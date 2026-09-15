<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplyProjectRequest;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectLike;
use App\Notifications\ProjectApplicationSubmitted;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ProjectController extends Controller
{
    /**
     * List discoverable projects with the current user's like/application state.
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();

        $projects = Project::query()
            ->with(['organisation', 'skills'])
            ->withCount('likes as likes_count')
            ->whereIn('status', [Project::STATUS_OPEN, Project::STATUS_IN_PROGRESS])
            ->orderBy('created_at', 'desc')
            ->get();

        if ($projects->isEmpty()) {
            return Inertia::render('projects/discover', ['projects' => []]);
        }

        $projectIds = $projects->pluck('id');

        $likedIds = ProjectLike::where('user_id', $user->id)
            ->whereIn('project_id', $projectIds)
            ->pluck('project_id');

        $applicationStatuses = ProjectApplication::where('user_id', $user->id)
            ->whereIn('project_id', $projectIds)
            ->pluck('status', 'project_id');

        $userSkillNames = $user->participantProfile?->skills->pluck('name');

        $payload = $projects->map(function (Project $project) use ($userSkillNames, $likedIds, $applicationStatuses): array {
            $requiredSkills = $project->skills->pluck('name');
            $matchingSkills = $requiredSkills->intersect($userSkillNames ?? collect());
            $match = $requiredSkills->isEmpty()
                ? 0
                : (int) round($matchingSkills->count() / $requiredSkills->count() * 100);

            return [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'description' => $project->description,
                'location' => $project->location,
                'status' => $project->status,
                'match' => $match,
                'positions' => $project->positions,
                'start_date' => $project->start_date?->toDateString(),
                'end_date' => $project->end_date?->toDateString(),
                'organisation' => $project->organisation?->name,
                'skills' => $requiredSkills->values(),
                'likes_count' => $project->likes_count,
                'liked_by_me' => $likedIds->contains($project->id),
                'application_status' => $applicationStatuses[$project->id] ?? null,
            ];
        });

        return Inertia::render('projects/discover', ['projects' => $payload]);
    }

    /**
     * Load the authenticated user's project applications for the "My applications" page.
     * This keeps the page payload small while still exposing status, project metadata,
     * and the cover letter the user submitted.
     */
    public function applications(Request $request): InertiaResponse
    {
        $user = $request->user();

        $applications = ProjectApplication::query()
            ->with(['project.organisation', 'project.skills'])
            ->where('user_id', $user->id)
            ->orderByDesc('submitted_at')
            ->get()
            ->map(function (ProjectApplication $application): array {
                $project = $application->project;

                return [
                    'id' => $application->id,
                    'project_id' => $project?->id,
                    'title' => $project?->title,
                    'slug' => $project?->slug,
                    'status' => $application->status,
                    'submitted_at' => $application->submitted_at?->format('M j, Y'),
                    'organisation' => $project?->organisation?->name,
                    'location' => $project?->location,
                    'description' => $project?->description,
                    'skills' => $project?->skills->pluck('name')->values()->all() ?? [],
                    'cover_letter' => $application->cover_letter,
                    'project_url' => $project ? route('projects.show', $project) : null,
                ];
            })
            ->values();

        return Inertia::render('applications/index', ['applications' => $applications]);
    }

    /**
     * Display a single project with full details.
     */
    public function show(Project $project): InertiaResponse
    {
        $user = request()->user();

        $project->load([
            'organisation',
            'skills',
            'creator',
            'participants' => fn ($q) => $q->where('status', 'active')->with('user:id,name'),
        ]);

        $project->loadCount([
            'likes as likes_count',
            'participants as participants_count' => fn ($q) => $q->where('status', 'active'),
        ]);

        $likedByMe = ProjectLike::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->exists();

        $application = ProjectApplication::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();

        $userSkillNames = $user->participantProfile?->skills->pluck('name') ?? collect();
        $requiredSkills = $project->skills->pluck('name');
        $matchingSkills = $requiredSkills->intersect($userSkillNames);
        $match = $requiredSkills->isEmpty()
            ? 0
            : (int) round($matchingSkills->count() / $requiredSkills->count() * 100);

        $payload = [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'description' => $project->description,
            'location' => $project->location,
            'status' => $project->status,
            'start_date' => $project->start_date?->format('M d, Y'),
            'end_date' => $project->end_date?->format('M d, Y'),
            'positions' => $project->positions,
            'positions_filled' => $project->participants_count,
            'duration_days' => $project->start_date && $project->end_date
                ? (int) $project->start_date->diffInDays($project->end_date) + 1
                : null,
            'match' => $match,
            'organisation' => [
                'id' => $project->organisation->id,
                'name' => $project->organisation->name,
                'description' => $project->organisation->description,
                'email' => $project->organisation->email,
                'website' => $project->organisation->website,
            ],
            'skills' => $requiredSkills->values(),
            'likes_count' => $project->likes_count,
            'liked_by_me' => $likedByMe,
            'application_status' => $application?->status,
            'cover_letter' => $application?->cover_letter,
            'is_own_project' => $project->created_by === $user->id,
            'participants' => $project->participants->take(12)->map(fn ($p) => [
                'id' => $p->user->id,
                'name' => $p->user->name,
                'role' => $p->role,
                'joined_at' => $p->joined_at?->format('M d, Y'),
            ]),
            'creator' => [
                'id' => $project->creator->id,
                'name' => $project->creator->name,
            ],
        ];

        return Inertia::render('projects/show', ['project' => $payload]);
    }

    /**
     * Toggle the current user's like on a project.
     */
    public function toggleLike(Request $request, Project $project): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        $like = ProjectLike::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();

        $liked = false;
        $message = '';

        if ($like) {
            $like->delete();
            $message = 'Removed from your liked projects.';
        } else {
            ProjectLike::create(['project_id' => $project->id, 'user_id' => $user->id]);
            $liked = true;
            $message = 'Nice! Project added to your likes.';
        }

        if ($request->expectsJson()) {
            return response()->json(['liked' => $liked, 'message' => $message]);
        }

        Inertia::flash('toast', ['type' => $liked ? 'success' : 'info', 'message' => $message]);

        return back();
    }

    /**
     * Submit an application for the current user.
     */
    public function apply(ApplyProjectRequest $request, Project $project): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        if ($project->created_by === $user->id) {
            abort(403, 'You cannot apply to a project you created.');
        }

        if (! in_array($project->status, [Project::STATUS_OPEN, Project::STATUS_IN_PROGRESS])) {
            abort(422, 'This project is not accepting applications.');
        }

        $withdrawn = [ProjectApplication::STATUS_WITHDRAWN];
        if ($user->projectApplications()->where('project_id', $project->id)->whereNotIn('status', $withdrawn)->exists()) {
            $message = 'You have already applied to this project.';

            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 409);
            }

            Inertia::flash('toast', ['type' => 'info', 'message' => $message]);

            return back();
        }

        $application = ProjectApplication::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'status' => ProjectApplication::STATUS_SUBMITTED,
            'cover_letter' => $request->validated('cover_letter'),
            'submitted_at' => now(),
        ]);

        $project->creator->notify(new ProjectApplicationSubmitted($application));

        $message = 'Application submitted successfully.';

        if ($request->expectsJson()) {
            return response()->json(['message' => $message]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }

    /**
     * Display a single application for review by the project creator.
     *
     * Restricted to the project creator and technical_admins so applicants'
     * profile data is only exposed to people who actually need to evaluate it.
     */
    public function showApplication(Request $request, Project $project, ProjectApplication $application): InertiaResponse
    {
        $user = $request->user();

        if ($project->created_by !== $user->id && ! $user->hasRole('technical_admin')) {
            abort(403, 'Only the project manager can view this application.');
        }

        if ($application->project_id !== $project->id) {
            abort(404);
        }

        $application->load([
            'project.organisation',
            'user.participantProfile' => function ($query): void {
                $query->with([
                    'skills',
                    'educations',
                    'workExperiences',
                    'certifications',
                ]);
            },
        ]);

        $applicant = $application->user;
        $profile = $applicant?->participantProfile;

        $payload = [
            'application' => [
                'id' => $application->id,
                'status' => $application->status,
                'cover_letter' => $application->cover_letter,
                'submitted_at' => $application->submitted_at?->format('M d, Y'),
            ],
            'project' => [
                'id' => $project->id,
                'slug' => $project->slug,
                'title' => $project->title,
                'organisation' => $project->organisation?->name,
            ],
            'applicant' => [
                'id' => $applicant?->id,
                'name' => $applicant?->name,
                'email' => $applicant?->email,
                'profile' => $profile ? [
                    'first_name' => $profile->first_name,
                    'last_name' => $profile->last_name,
                    'phone' => $profile->phone,
                    'city' => $profile->city,
                    'country' => $profile->country,
                    'nationality' => $profile->nationality,
                    'summary' => $profile->summary,
                    'photo_url' => $profile->photo_path
                        ? asset('storage/'.$profile->photo_path)
                        : null,
                    'skills' => $profile->skills->map(fn ($s) => ['name' => $s->name])->all(),
                    'educations' => $profile->educations->map(fn ($e) => [
                        'institution' => $e->institution,
                        'qualification' => $e->qualification,
                        'field_of_study' => $e->field_of_study,
                        'start_year' => $e->start_year,
                        'end_year' => $e->end_year,
                    ])->all(),
                    'experiences' => $profile->workExperiences->map(fn ($w) => [
                        'company' => $w->organisation,
                        'role' => $w->job_title,
                        'location' => $w->location,
                        'description' => $w->description,
                        'start_date' => $w->start_date?->format('M Y'),
                        'end_date' => $w->end_date?->format('M Y'),
                        'currently_working' => (bool) $w->currently_working,
                    ])->all(),
                    'certifications' => $profile->certifications->map(fn ($c) => [
                        'name' => $c->name,
                        'issuer' => $c->issuing_organisation,
                        'credential_number' => $c->credential_number,
                        'issue_date' => $c->issue_date?->format('M Y'),
                        'expiry_date' => $c->expiry_date?->format('M Y'),
                    ])->all(),
                ] : null,
            ],
        ];

        return Inertia::render('applications/show', ['application' => $payload]);
    }
}
