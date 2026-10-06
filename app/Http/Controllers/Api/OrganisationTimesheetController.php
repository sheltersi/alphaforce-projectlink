<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentOrganisation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\OrganisationTimesheetIndexRequest;
use App\Http\Resources\Organisation\TimesheetReviewResource;
use App\Models\Project;
use App\Models\TimesheetEntry;
use App\Services\TimesheetService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

/**
 * Organisation App timesheet review/approval (Project Manager workflow).
 *
 * Manager-only queue over the entries of the viewer's own organisation:
 * every query is confined to projects of the authenticated user's
 * organisation (cross-org access resolves to 404, mirroring
 * ProjectController::scoped, so project/entry existence never leaks).
 *
 * All transitions go through TimesheetService::approveEntry/rejectEntry
 * so weekly header totals stay truthful, and authorisation comes from the
 * existing `review` policy decision (organisation managers only,
 * `submitted` entries only, never own entries) — never reimplemented here.
 */
class OrganisationTimesheetController extends Controller
{
    use ResolvesCurrentOrganisation;

    public function __construct(protected TimesheetService $timesheets) {}

    /**
     * Review queue: entries on the organisation's projects.
     * Defaults to `status=submitted`. Supports ?status=, ?project_id=,
     * ?from= and ?to= (work_date bounds).
     *
     * GET /api/organisation/timesheets?status=submitted&project_id=&from=&to=
     */
    public function index(OrganisationTimesheetIndexRequest $request): AnonymousResourceCollection
    {
        $organisation = $this->currentOrganisation($request);

        abort_unless($request->user()->isOrganisationManager($organisation->id), 403);

        $filters = $request->validated();

        $project = null;
        if (isset($filters['project_id'])) {
            $project = Project::whereKey($filters['project_id'])->first();

            abort_if($project === null || $project->organisation_id !== $organisation->id, 404);
        }

        $entries = TimesheetEntry::query()
            ->with([
                'timesheet.participant.project',
                'timesheet.participant.user.participantProfile',
                'reviewer.participantProfile',
            ])
            ->whereHas(
                'timesheet.participant.project',
                fn ($query) => $query->where('organisation_id', $organisation->id)
            )
            ->when(
                $project !== null,
                fn ($query) => $query->whereHas(
                    'timesheet.participant',
                    fn ($query) => $query->where('project_id', $project->id)
                )
            )
            ->when(
                $filters['status'] ?? TimesheetEntry::STATUS_SUBMITTED,
                fn ($query, $status) => $query->where('status', $status)
            )
            // whereDate: SQLite stores date casts with a time suffix, so
            // plain string bounds are not portable across drivers.
            ->when(
                $filters['from'] ?? null,
                fn ($query, $from) => $query->whereDate('work_date', '>=', $from)
            )
            ->when(
                $filters['to'] ?? null,
                fn ($query, $to) => $query->whereDate('work_date', '<=', $to)
            )
            ->orderByDesc('work_date')
            ->orderBy('start_time')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return TimesheetReviewResource::collection($entries);
    }

    /**
     * Approve a submitted entry. The review comment is optional.
     *
     * POST /api/organisation/timesheets/{entry}/approve { review_comment? }
     */
    public function approve(Request $request, TimesheetEntry $entry): TimesheetReviewResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $entry);

        Gate::authorize('review', $entry);

        $data = $request->validate([
            'review_comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $approved = $this->timesheets->approveEntry(
            $entry,
            $request->user(),
            $data['review_comment'] ?? null
        );

        return (new TimesheetReviewResource($this->loaded($approved)))
            ->additional(['message' => 'Entry approved.']);
    }

    /**
     * Reject a submitted entry back to the participant. The review comment
     * is required so the participant knows what to correct; editing the
     * entry flips it back to draft for resubmission.
     *
     * POST /api/organisation/timesheets/{entry}/reject { review_comment }
     */
    public function reject(Request $request, TimesheetEntry $entry): TimesheetReviewResource
    {
        $organisation = $this->currentOrganisation($request);

        $this->scoped($organisation->id, $entry);

        Gate::authorize('review', $entry);

        $data = $request->validate([
            'review_comment' => ['required', 'string', 'max:2000'],
        ]);

        $rejected = $this->timesheets->rejectEntry(
            $entry,
            $request->user(),
            $data['review_comment']
        );

        return (new TimesheetReviewResource($this->loaded($rejected)))
            ->additional(['message' => 'Entry rejected.']);
    }

    /**
     * Confine the route-bound entry to the viewer's organisation.
     * Anything else resolves to 404 so cross-org existence never leaks.
     */
    protected function scoped(int $organisationId, TimesheetEntry $entry): void
    {
        $project = $entry->timesheet?->participant?->project;

        abort_if($project === null || $project->organisation_id !== $organisationId, 404);
    }

    /**
     * Full eager loads for the review queue: participant (with profile)
     * and project context plus the reviewer audit trail.
     */
    protected function loaded(TimesheetEntry $entry): TimesheetEntry
    {
        return $entry->load([
            'timesheet.participant.project',
            'timesheet.participant.user.participantProfile',
            'reviewer.participantProfile',
        ]);
    }
}
