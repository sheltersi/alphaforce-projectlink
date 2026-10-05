<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTimesheetEntryRequest;
use App\Http\Requests\UpdateTimesheetEntryRequest;
use App\Models\TimesheetEntry;
use App\Services\TimesheetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class TimesheetController extends Controller
{
    public function __construct(protected TimesheetService $timesheets) {}

    /**
     * Weekly calendar page: the user's entries, loggable assignments and
     * server-computed totals for the requested week (Monday–Sunday).
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();
        $weekStart = $this->weekStart($request->query('week'));

        [$monday, $sunday] = [$weekStart->copy(), $weekStart->copy()->addDays(6)];

        $entries = $this->timesheets->weekEntries($user, $weekStart);
        $summary = $this->timesheets->weekSummary($entries);

        $assignments = $this->timesheets->loggableAssignments($user)->map(fn ($membership): array => [
            'id' => $membership->id,
            'role' => $membership->role,
            'team' => $membership->team,
            'project' => [
                'id' => $membership->project->id,
                'title' => $membership->project->title,
            ],
        ])->values();

        $payload = $entries->map(fn (TimesheetEntry $entry): array => [
            'id' => $entry->id,
            'work_date' => $entry->work_date->toDateString(),
            'start_time' => substr((string) $entry->start_time, 0, 5),
            'end_time' => substr((string) $entry->end_time, 0, 5),
            'minutes' => $entry->durationMinutes(),
            'description' => $entry->description,
            'status' => $entry->status,
            'review_comment' => $entry->review_comment,
            'reviewed_by' => $entry->reviewer?->name,
            'project' => [
                'id' => $entry->timesheet->participant->project->id,
                'title' => $entry->timesheet->participant->project->title,
            ],
            'assignment' => [
                'id' => $entry->timesheet->project_participant_id,
                'role' => $entry->timesheet->participant->role,
                'team' => $entry->timesheet->participant->team,
            ],
        ])->values();

        return Inertia::render('timesheets/index', [
            'week' => [
                'start' => $monday->toDateString(),
                'end' => $sunday->toDateString(),
                'prev' => $monday->copy()->subWeek()->toDateString(),
                'next' => $monday->copy()->addWeek()->toDateString(),
                'is_current' => $monday->isSameWeek(now()),
            ],
            'entries' => $payload,
            'assignments' => $assignments,
            'summary' => $summary + [
                'draft_count' => $entries->where('status', TimesheetEntry::STATUS_DRAFT)->count()
                    + $entries->where('status', TimesheetEntry::STATUS_REJECTED)->count(),
            ],
        ]);
    }

    /**
     * Create a calendar entry on the participant's own assignment.
     */
    public function store(StoreTimesheetEntryRequest $request): RedirectResponse
    {
        Gate::authorize('create', TimesheetEntry::class);

        $this->timesheets->createEntry($request->user(), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Entry added to your calendar.']);

        return back();
    }

    /**
     * Edit times, date, assignment or description of a draft entry.
     * Drag/resize on the calendar lands here with start/end only.
     */
    public function update(UpdateTimesheetEntryRequest $request, TimesheetEntry $entry): RedirectResponse
    {
        Gate::authorize('update', $entry);

        $this->timesheets->updateEntry($entry, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Entry updated.']);

        return back();
    }

    /**
     * Delete a draft entry.
     */
    public function destroy(TimesheetEntry $entry): RedirectResponse
    {
        Gate::authorize('delete', $entry);

        $this->timesheets->deleteEntry($entry);

        Inertia::flash('toast', ['type' => 'info', 'message' => 'Entry deleted.']);

        return back();
    }

    /**
     * Submit the displayed week's draft/rejected entries for review.
     */
    public function submitWeek(Request $request): RedirectResponse
    {
        $data = $request->validate(['week_start' => ['required', 'date']]);

        $count = $this->timesheets->submitWeek($request->user(), Carbon::parse($data['week_start']));

        Inertia::flash('toast', [
            'type' => $count > 0 ? 'success' : 'info',
            'message' => $count > 0
                ? "Submitted {$count} ".($count === 1 ? 'entry' : 'entries').' for review.'
                : 'Nothing to submit — no draft entries this week.',
        ]);

        return back();
    }

    /**
     * Approve a submitted entry. No UI yet (Organisation App, later phase);
     * exposed now so the review workflow is API-complete.
     */
    public function approve(Request $request, TimesheetEntry $entry): RedirectResponse
    {
        Gate::authorize('review', $entry);

        $data = $request->validate(['review_comment' => ['nullable', 'string', 'max:2000']]);

        $this->timesheets->approveEntry($entry, $request->user(), $data['review_comment'] ?? null);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Entry approved.']);

        return back();
    }

    /**
     * Reject a submitted entry with a mandatory comment.
     */
    public function reject(Request $request, TimesheetEntry $entry): RedirectResponse
    {
        Gate::authorize('review', $entry);

        $data = $request->validate(['review_comment' => ['required', 'string', 'max:2000']]);

        $this->timesheets->rejectEntry($entry, $request->user(), $data['review_comment']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Entry rejected with feedback.']);

        return back();
    }

    protected function weekStart(?string $week): Carbon
    {
        try {
            $date = $week !== null ? Carbon::parse($week) : now();
        } catch (\Throwable) {
            $date = now();
        }

        // The app swaps the Date facade to CarbonImmutable
        // (AppServiceProvider), so now() may be immutable here. Parse the
        // date part back through the mutable class: callers rely on
        // copy()/startOfWeek() mutation semantics downstream.
        return Carbon::parse($date->toDateString())
            ->startOfWeek(Carbon::MONDAY)
            ->startOfDay();
    }
}
