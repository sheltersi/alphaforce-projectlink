<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TimesheetIndexRequest;
use App\Http\Requests\StoreTimesheetEntryRequest;
use App\Http\Requests\UpdateTimesheetEntryRequest;
use App\Http\Resources\Participant\TimesheetEntryResource;
use App\Models\TimesheetEntry;
use App\Services\TimesheetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;

/**
 * Participant timesheet API (Phases 1–3).
 *
 * Stateless Sanctum token API for calendar timesheet entries. Every query
 * is scoped to the authenticated participant's own assignments through
 * TimesheetService — ids from the client can never reach another
 * participant's rows. All calendar rules (ownership, time ranges, overlap,
 * status transitions) live in the shared service, so this API and the
 * session/Inertia Participant App can never drift apart.
 *
 * Review/approval is manager-only via OrganisationTimesheetController
 * (existing `review` policy + the Organisation App UI).
 */
class TimesheetController extends Controller
{
    public function __construct(protected TimesheetService $timesheets) {}

    /**
     * Calendar entries of the authenticated participant in a date range.
     * Defaults to the current week (Monday–Sunday) when no bounds given.
     *
     * GET /api/timesheets?from=2026-10-05&to=2026-10-11
     */
    public function index(TimesheetIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();

        [$from, $to] = $this->resolveRange($filters['from'] ?? null, $filters['to'] ?? null);

        $entries = $this->timesheets->rangeEntries($request->user(), $from, $to);

        return TimesheetEntryResource::collection($entries);
    }

    /**
     * Server-computed weekly summary for the authenticated participant.
     * Totals always derive from stored start/end times, never from
     * client-side math.
     *
     * GET /api/timesheets/summary?from=2026-10-05&to=2026-10-11
     */
    public function summary(TimesheetIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();

        [$from, $to] = $this->resolveRange($filters['from'] ?? null, $filters['to'] ?? null);

        $entries = $this->timesheets->rangeEntries($request->user(), $from, $to);
        $summary = $this->timesheets->weekSummary($entries);

        return response()->json([
            'data' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'by_day' => $summary['by_day'],
                'week_minutes' => $summary['week_minutes'],
                'timeless_count' => $summary['timeless_count'],
                'total_entries' => $entries->count(),
                'draft_count' => $entries
                    ->whereIn('status', [TimesheetEntry::STATUS_DRAFT, TimesheetEntry::STATUS_REJECTED])
                    ->count(),
                'submitted_count' => $entries->where('status', TimesheetEntry::STATUS_SUBMITTED)->count(),
            ],
        ]);
    }

    /**
     * Create a calendar entry on the caller's own assignment.
     *
     * POST /api/timesheets
     */
    public function store(StoreTimesheetEntryRequest $request): JsonResponse
    {
        Gate::authorize('create', TimesheetEntry::class);

        $validated = $request->validated();

        $entry = $this->timesheets->createEntry($request->user(), [
            'project_participant_id' => (int) $validated['project_participant_id'],
            'work_date' => (string) $validated['work_date'],
            'start_time' => (string) $validated['start_time'],
            'end_time' => (string) $validated['end_time'],
            'description' => (string) $validated['description'],
        ]);

        return (new TimesheetEntryResource($entry->loadMissing(['timesheet.participant.project', 'reviewer:id,name'])))
            ->additional(['message' => 'Entry added to your calendar.'])
            ->response($request)
            ->setStatusCode(201);
    }

    /**
     * Single entry detail. Participants may only view their own rows.
     *
     * GET /api/timesheets/{timesheet}
     */
    public function show(Request $request, TimesheetEntry $timesheet): TimesheetEntryResource
    {
        Gate::authorize('view', $timesheet);

        return new TimesheetEntryResource($timesheet->loadMissing(['timesheet.participant.project', 'reviewer:id,name']));
    }

    /**
     * Edit times, date, assignment or description of a draft entry.
     *
     * PUT /api/timesheets/{timesheet}
     */
    public function update(UpdateTimesheetEntryRequest $request, TimesheetEntry $timesheet): TimesheetEntryResource
    {
        Gate::authorize('update', $timesheet);

        $entry = $this->timesheets->updateEntry($timesheet, $request->validated());

        return (new TimesheetEntryResource($entry))
            ->additional(['message' => 'Entry updated.']);
    }

    /**
     * Delete a draft entry.
     *
     * DELETE /api/timesheets/{timesheet}
     */
    public function destroy(TimesheetEntry $timesheet): JsonResponse
    {
        Gate::authorize('delete', $timesheet);

        $this->timesheets->deleteEntry($timesheet);

        return response()->json(['message' => 'Entry deleted.']);
    }

    /**
     * Submit a single draft entry for review. draft → submitted.
     * Submitted entries become read-only (policy blocks edits/deletes).
     *
     * POST /api/timesheets/{timesheet}/submit
     */
    public function submit(TimesheetEntry $timesheet): TimesheetEntryResource
    {
        Gate::authorize('submit', $timesheet);

        $entry = $this->timesheets->submitEntry($timesheet);

        return (new TimesheetEntryResource($entry))
            ->additional(['message' => 'Entry submitted for review.']);
    }

    /**
     * Submit the displayed week's draft/rejected entries for review.
     *
     * POST /api/timesheets/submit { week_start }
     */
    public function submitWeek(Request $request): JsonResponse
    {
        $data = $request->validate(['week_start' => ['required', 'date']]);

        $count = $this->timesheets->submitWeek($request->user(), Carbon::parse($data['week_start']));

        return response()->json([
            'message' => $count > 0
                ? "Submitted {$count} ".($count === 1 ? 'entry' : 'entries').' for review.'
                : 'Nothing to submit — no draft entries this week.',
            'submitted_count' => $count,
        ]);
    }

    /**
     * Resolve the [from, to] range: explicit bounds win, otherwise the
     * current week (Monday–Sunday). A lone `from` opens a 7-day window.
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    protected function resolveRange(?string $from, ?string $to): array
    {
        if ($from !== null && $to !== null) {
            return [Carbon::parse($from)->startOfDay(), Carbon::parse($to)->startOfDay()];
        }

        if ($from !== null) {
            $start = Carbon::parse($from)->startOfDay();

            return [$start, $start->copy()->addDays(6)];
        }

        $monday = Carbon::now()->startOfWeek(Carbon::MONDAY)->startOfDay();

        return [$monday, $monday->copy()->addDays(6)];
    }
}
