<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentOrganisation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ProjectApplicationIndexRequest;
use App\Http\Requests\Api\ProjectIndexRequest;
use App\Http\Requests\Api\ProjectParticipantIndexRequest;
use App\Http\Requests\Api\StoreProjectRequest;
use App\Http\Requests\Api\UpdateApplicationRequest;
use App\Http\Requests\Api\UpdateParticipantRequest;
use App\Http\Requests\Api\UpdateParticipantStatusRequest;
use App\Http\Requests\Api\UpdateProjectRequest;
use App\Http\Resources\Organisation\ApplicationResource;
use App\Http\Resources\Organisation\ProjectListResource;
use App\Http\Resources\Organisation\ProjectParticipantResource;
use App\Http\Resources\Organisation\ProjectResource;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectParticipant;
use App\Notifications\ProjectApplicationAccepted;
use App\Notifications\ProjectApplicationRejected;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

/**
 * Organisation App project management.
 *
 * All access is scoped to the authenticated user's own organisation
 * (cross-org projects resolve to 404). Lifecycle mapping onto the
 * existing statuses: publish (draft → open), unpublish (open → draft),
 * close (open/in_progress → completed), archive (completed/cancelled →
 * archived). Only drafts can be hard-deleted; history is preserved via
 * close/archive since related records cascade.
 */
class ProjectController extends Controller
{
    use ResolvesCurrentOrganisation;

    /**
     * Statuses that still accept normal edits.
     *
     * @var array<int, string>
     */
    private const EDITABLE_STATUSES = [
        Project::STATUS_DRAFT,
        Project::STATUS_OPEN,
        Project::STATUS_IN_PROGRESS,
    ];

    public function index(ProjectIndexRequest $request): AnonymousResourceCollection
    {
        $organisation = $this->currentOrganisation($request);

        Gate::authorize('viewAny', Project::class);

        $filters = $request->validated();

        $projects = $organisation->projects()
            ->with(['skills', 'creator'])
            ->withCount(['applications', 'participants'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(
                fn ($query) => $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
            ))
            ->when($filters['project_manager'] ?? null, fn ($query, $manager) => $query->where('created_by', $manager))
            ->when($filters['start_date'] ?? null, fn ($query, $date) => $query->whereDate('start_date', '>=', $date))
            ->when($filters['end_date'] ?? null, fn ($query, $date) => $query->whereDate('end_date', '<=', $date))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return ProjectListResource::collection($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $organisation = $this->currentOrganisation($request);

        Gate::authorize('create', Project::class);

        $validated = $request->validated();

        $project = $organisation->projects()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'location' => $validated['location'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'positions' => $validated['positions'] ?? 1,
            'created_by' => $validated['project_manager_id'] ?? $request->user()->id,
            'status' => Project::STATUS_DRAFT,
        ]);

        if (array_key_exists('skill_ids', $validated)) {
            $project->skills()->sync($validated['skill_ids']);
        }

        return $this->projectResponse($project, 'Project created.', 201);
    }

    public function show(Request $request, Project $project): ProjectResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('view', $project);

        return new ProjectResource($this->loaded($project));
    }

    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('update', $project);

        if (! in_array($project->status, self::EDITABLE_STATUSES, true)) {
            throw ValidationException::withMessages([
                'project' => ["A {$project->status} project can no longer be modified."],
            ]);
        }

        $validated = $request->validated();

        $project->fill([
            'title' => $validated['title'] ?? $project->title,
            'description' => array_key_exists('description', $validated) ? $validated['description'] : $project->description,
            'location' => array_key_exists('location', $validated) ? $validated['location'] : $project->location,
            'start_date' => array_key_exists('start_date', $validated) ? $validated['start_date'] : $project->start_date,
            'end_date' => array_key_exists('end_date', $validated) ? $validated['end_date'] : $project->end_date,
            'positions' => $validated['positions'] ?? $project->positions,
            'created_by' => $validated['project_manager_id'] ?? $project->created_by,
        ])->save();

        if (array_key_exists('skill_ids', $validated)) {
            $project->skills()->sync($validated['skill_ids']);
        }

        return (new ProjectResource($this->loaded($project->fresh())))
            ->additional(['message' => 'Project updated.']);
    }

    /**
     * Paginated applications for a single project (review queue).
     * Applicant data uses the privacy-filtered ParticipantResource.
     * Supports ?search= matching user name/email and profile first/last name.
     */
    public function applications(ProjectApplicationIndexRequest $request, Project $project): AnonymousResourceCollection
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('viewApplications', $project);

        $filters = $request->validated();

        $applications = $project->applications()
            ->with(['user.participantProfile.skills', 'participant', 'reviewer'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $like = "%{$search}%";

                $query->where(function ($query) use ($like) {
                    $query->whereHas('user', fn ($query) => $query
                        ->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like))
                        ->orWhereHas('user.participantProfile', fn ($query) => $query
                            ->where('first_name', 'like', $like)
                            ->orWhere('last_name', 'like', $like));
                });
            })
            ->latest('submitted_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return ApplicationResource::collection($applications);
    }

    /**
     * Paginated accepted participants for a single project.
     * Participant data uses the privacy-filtered ParticipantResource.
     * Supports ?status=, ?role= and ?search= (user name/email, profile
     * first/last name). Every organisation manager may view.
     */
    public function participants(ProjectParticipantIndexRequest $request, Project $project): AnonymousResourceCollection
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('viewApplications', $project);

        $filters = $request->validated();

        $participants = $project->participants()
            ->with(['user.participantProfile.skills', 'application'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('project_participants.status', $status))
            ->when($filters['role'] ?? null, fn ($query, $role) => $query->where('project_participants.role', $role))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $like = "%{$search}%";

                $query->where(function ($query) use ($like) {
                    $query->whereHas('user', fn ($query) => $query
                        ->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like))
                        ->orWhereHas('user.participantProfile', fn ($query) => $query
                            ->where('first_name', 'like', $like)
                            ->orWhere('last_name', 'like', $like));
                });
            })
            ->orderBy('joined_at')
            ->orderBy('id')
            ->paginate(15)
            ->withQueryString();

        return ProjectParticipantResource::collection($participants);
    }

    /**
     * Single participant with full eager loads for the detail page and
     * the edit form (profile collections, application, project).
     * Same org-scoping (404) and manager gate (403) as the index.
     */
    public function showParticipant(Request $request, Project $project, ProjectParticipant $participant): ProjectParticipantResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('viewApplications', $project);

        $this->scopedParticipant($project, $participant);

        return new ProjectParticipantResource($this->loadedParticipant($participant));
    }

    /**
     * Assign / edit a participant in place (never creates rows).
     *
     * A role is required when the member has none yet (first assignment);
     * assignment state is derived from the role column (empty role = Not
     * Assigned), not from a status. Status itself is rejected here (use
     * the status action). Returns the updated resource so detail + edit
     * form update in place.
     */
    public function updateParticipant(UpdateParticipantRequest $request, Project $project, ProjectParticipant $participant): ProjectParticipantResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('reviewApplications', $project);

        $this->scopedParticipant($project, $participant);

        $validated = $request->validated();

        if (blank($participant->role) && blank($validated['role'] ?? null)) {
            throw ValidationException::withMessages([
                'role' => ['A role is required for the first assignment.'],
            ]);
        }

        $participant->fill([
            'role' => array_key_exists('role', $validated) ? $validated['role'] : $participant->role,
            'team' => array_key_exists('team', $validated) ? $validated['team'] : $participant->team,
            'start_date' => array_key_exists('start_date', $validated) ? $validated['start_date'] : $participant->start_date,
            'end_date' => array_key_exists('end_date', $validated) ? $validated['end_date'] : $participant->end_date,
            'work_location' => array_key_exists('work_location', $validated) ? $validated['work_location'] : $participant->work_location,
            'working_hours' => array_key_exists('working_hours', $validated) ? $validated['working_hours'] : $participant->working_hours,
            'notes' => array_key_exists('notes', $validated) ? $validated['notes'] : $participant->notes,
        ]);

        $participant->save();
        $participant->user->syncProjectParticipationRole();

        $message = 'Assignment updated.';

        return (new ProjectParticipantResource($this->loadedParticipant($participant->fresh())))
            ->additional(['message' => $message]);
    }

    /**
     * Explicit status transition for a participant.
     *
     * Legal moves: active → completed|withdrawn. Terminal: completed,
     * withdrawn (re-entry is via re-application).
     */
    public function updateParticipantStatus(UpdateParticipantStatusRequest $request, Project $project, ProjectParticipant $participant): ProjectParticipantResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('reviewApplications', $project);

        $this->scopedParticipant($project, $participant);

        $to = $request->validated('status');

        $this->ensureParticipantTransition($participant->status, $to);

        $participant->update(['status' => $to]);
        $participant->user->syncProjectParticipationRole();

        $message = match ($to) {
            ProjectParticipant::STATUS_COMPLETED => 'Participant marked as completed.',
            ProjectParticipant::STATUS_WITHDRAWN => 'Participant withdrawn.',
            default => 'Participant status updated.',
        };

        return (new ProjectParticipantResource($this->loadedParticipant($participant->fresh())))
            ->additional(['message' => $message]);
    }

    /**
     * Distinct role values already used on a project, for the Position
     * dropdown. Roles are free-text per project (no config table), so
     * this aggregates what exists; an empty list means free-text input.
     */
    public function participantRoles(Request $request, Project $project): JsonResponse
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('viewApplications', $project);

        $roles = $project->participants()
            ->whereNotNull('role')
            ->distinct()
            ->orderBy('role')
            ->pluck('role')
            ->values();

        return response()->json(['data' => $roles]);
    }

    /**
     * Single application with full eager loads for the review detail page.
     * Read access follows the queue (every organisation manager may view).
     */
    public function showApplication(Request $request, Project $project, ProjectApplication $application): ApplicationResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('viewApplications', $project);

        $this->scopedApplication($project, $application);

        return new ApplicationResource($this->loadedApplication($application));
    }

    /**
     * Reviewer decision on an application.
     *
     * Frontend contract: PATCH with {status, rejection_reason?}.
     * Transition rules (422 on violation): submitted/under_review/shortlisted
     * may move to accepted/rejected/under_review/shortlisted; accepted is
     * terminal; rejected may only be re-rejected (reason update); withdrawn
     * is terminal for reviewers (applicant must re-apply, which reuses the row).
     */
    public function updateApplication(UpdateApplicationRequest $request, Project $project, ProjectApplication $application): ApplicationResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('reviewApplications', $project);

        $this->scopedApplication($project, $application);

        $validated = $request->validated();
        $from = $application->status;
        $to = $validated['status'];

        $this->ensureApplicationTransition($from, $to);

        if ($to === ProjectApplication::STATUS_ACCEPTED) {
            $application->update([
                'status' => $to,
                'rejection_reason' => null,
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
            ]);

            // Accept creates an active row with no role yet (empty role =
            // Not Assigned; the Assign action fills it in). Idempotent:
            // never duplicates (unique [project_id, user_id]), never
            // overwrites an existing row.
            $participant = ProjectParticipant::firstOrCreate(
                ['project_id' => $project->id, 'user_id' => $application->user_id],
                [
                    'application_id' => $application->id,
                    'role' => null,
                    'status' => ProjectParticipant::STATUS_ACTIVE,
                    'joined_at' => now()->toDateString(),
                ],
            );

            if ($participant->application_id === null) {
                $participant->update(['application_id' => $application->id]);
            }

            $application->user->notify(new ProjectApplicationAccepted($application->fresh('project')));

            $message = 'Application accepted.';
        } elseif ($to === ProjectApplication::STATUS_REJECTED) {
            $application->update([
                'status' => $to,
                'rejection_reason' => $validated['rejection_reason'] ?? null,
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
            ]);

            $application->user->notify(new ProjectApplicationRejected($application->fresh('project')));

            $message = 'Application rejected.';
        } else {
            $application->update([
                'status' => $to,
                'rejection_reason' => null,
            ]);

            $message = 'Application updated.';
        }

        return (new ApplicationResource($this->loadedApplication($application->fresh())))
            ->additional(['message' => $message]);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('delete', $project);

        if ($project->status !== Project::STATUS_DRAFT) {
            throw ValidationException::withMessages([
                'project' => ['Only draft projects can be deleted. Archive the project to retire it instead.'],
            ]);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }

    public function publish(Request $request, Project $project): ProjectResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('publish', $project);

        $this->ensureTransition($project, [Project::STATUS_DRAFT], 'publish', Project::STATUS_OPEN);

        $missing = collect(['description', 'start_date', 'end_date'])
            ->filter(function (string $field) use ($project): bool {
                $value = $project->{$field};

                return $value === null || $value === '';
            })
            ->values();

        if ($missing->isNotEmpty()) {
            throw ValidationException::withMessages([
                'project' => ["Cannot publish: missing {$missing->join(', ')}."],
            ]);
        }

        $project->update(['status' => Project::STATUS_OPEN]);

        return (new ProjectResource($this->loaded($project->fresh())))
            ->additional(['message' => 'Project published.']);
    }

    public function unpublish(Request $request, Project $project): ProjectResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('unpublish', $project);

        $this->ensureTransition($project, [Project::STATUS_OPEN], 'unpublish', Project::STATUS_DRAFT);

        $hasActiveApplications = $project->applications()
            ->whereNotIn('status', [ProjectApplication::STATUS_WITHDRAWN, ProjectApplication::STATUS_REJECTED])
            ->exists();

        if ($hasActiveApplications) {
            throw ValidationException::withMessages([
                'project' => ['Cannot unpublish a project with active applications.'],
            ]);
        }

        $project->update(['status' => Project::STATUS_DRAFT]);

        return (new ProjectResource($this->loaded($project->fresh())))
            ->additional(['message' => 'Project unpublished.']);
    }

    public function close(Request $request, Project $project): ProjectResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('close', $project);

        $this->ensureTransition(
            $project,
            [Project::STATUS_OPEN, Project::STATUS_IN_PROGRESS],
            'close',
            Project::STATUS_COMPLETED
        );

        $project->update(['status' => Project::STATUS_COMPLETED]);

        return (new ProjectResource($this->loaded($project->fresh())))
            ->additional(['message' => 'Project closed.']);
    }

    public function archive(Request $request, Project $project): ProjectResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $project);

        Gate::authorize('archive', $project);

        $this->ensureTransition(
            $project,
            [Project::STATUS_COMPLETED, Project::STATUS_CANCELLED],
            'archive',
            Project::STATUS_ARCHIVED
        );

        $project->update(['status' => Project::STATUS_ARCHIVED]);

        return (new ProjectResource($this->loaded($project->fresh())))
            ->additional(['message' => 'Project archived.']);
    }

    /**
     * Confine the route-bound project to the viewer's organisation.
     * Anything else resolves to 404 so cross-org existence never leaks.
     */
    protected function scoped(int $organisationId, Project $project): void
    {
        abort_if($project->organisation_id !== $organisationId, 404);
    }

    /**
     * Confine the route-bound application to its project (404 otherwise).
     */
    protected function scopedApplication(Project $project, ProjectApplication $application): void
    {
        abort_if($application->project_id !== $project->id, 404);
    }

    /**
     * Confine the route-bound participant to its project (404 otherwise).
     */
    protected function scopedParticipant(Project $project, ProjectParticipant $participant): void
    {
        abort_if($participant->project_id !== $project->id, 404);
    }

    /**
     * Full eager loads for the participant detail page and edit form:
     * profile collections, application (with submitted/reviewed dates)
     * and project.
     */
    protected function loadedParticipant(ProjectParticipant $participant): ProjectParticipant
    {
        return $participant->load([
            'user.participantProfile.skills',
            'user.participantProfile.educations',
            'user.participantProfile.workExperiences',
            'user.participantProfile.certifications',
            'application',
            'project',
        ]);
    }

    /**
     * Legal participant moves: active → completed|withdrawn.
     * completed and withdrawn are terminal (re-entry is via
     * re-application).
     *
     * @throws ValidationException
     */
    protected function ensureParticipantTransition(string $from, string $to): void
    {
        $allowed = match ($from) {
            ProjectParticipant::STATUS_ACTIVE => [
                ProjectParticipant::STATUS_COMPLETED,
                ProjectParticipant::STATUS_WITHDRAWN,
            ],
            default => [],
        };

        if (! in_array($to, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => ["A participant with status {$from} cannot move to {$to}."],
            ]);
        }
    }

    /**
     * Full eager loads for the review detail page: applicant profile with
     * skills, educations, work experiences and certifications, plus the
     * post-acceptance assignment, reviewer and project.
     */
    protected function loadedApplication(ProjectApplication $application): ProjectApplication
    {
        return $application->load([
            'user.participantProfile.skills',
            'user.participantProfile.educations',
            'user.participantProfile.workExperiences',
            'user.participantProfile.certifications',
            'participant',
            'reviewer',
            'project',
        ]);
    }

    /**
     * @throws ValidationException
     */
    protected function ensureApplicationTransition(string $from, string $to): void
    {
        $reviewable = [
            ProjectApplication::STATUS_SUBMITTED,
            ProjectApplication::STATUS_UNDER_REVIEW,
            ProjectApplication::STATUS_SHORTLISTED,
        ];

        if ($from === ProjectApplication::STATUS_ACCEPTED) {
            throw ValidationException::withMessages([
                'status' => ['An accepted application can no longer be changed.'],
            ]);
        }

        if ($from === ProjectApplication::STATUS_WITHDRAWN) {
            throw ValidationException::withMessages([
                'status' => ['A withdrawn application can no longer be reviewed. The applicant may re-apply.'],
            ]);
        }

        if ($from === ProjectApplication::STATUS_REJECTED) {
            if ($to !== ProjectApplication::STATUS_REJECTED) {
                throw ValidationException::withMessages([
                    'status' => ['A rejected application cannot be accepted. The applicant may re-apply.'],
                ]);
            }

            return;
        }

        if (! in_array($from, $reviewable, true)) {
            throw ValidationException::withMessages([
                'status' => ["An application with status {$from} cannot be reviewed."],
            ]);
        }
    }

    /**
     * @param  array<int, string>  $from
     *
     * @throws ValidationException
     */
    protected function ensureTransition(Project $project, array $from, string $action, string $to): void
    {
        if ($project->status === $to || ! in_array($project->status, $from, true)) {
            throw ValidationException::withMessages([
                'project' => ["A {$project->status} project cannot be {$action}d."],
            ]);
        }
    }

    protected function loaded(Project $project): Project
    {
        return $project->load([
            'creator',
            'skills',
            'participants' => fn ($query) => $query->orderBy('joined_at')->orderBy('id'),
            'participants.user.participantProfile.skills',
            'participants.application',
        ])->loadCount(['applications', 'participants']);
    }

    protected function projectResponse(Project $project, string $message, int $status): JsonResponse
    {
        return (new ProjectResource($this->loaded($project)))
            ->additional(['message' => $message])
            ->response(request())
            ->setStatusCode($status);
    }
}
