<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectParticipant;
use App\Models\Timesheet;
use App\Models\TimesheetEntry;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Single source of truth for timesheet business logic.
 *
 * Both the Participant App (session/Inertia) and the Organisation App
 * (token API) go through here, so calendar rules, durations, overlap
 * detection and status transitions can never drift between frontends.
 */
class TimesheetService
{
    /**
     * Assignments of the user that may log time, with their projects.
     *
     * Same bucket as the "current" list on My Projects
     * (ProjectController@myProjects): active memberships on projects that
     * are still running. Role is display info only, never a filter.
     *
     * @return Collection<int, ProjectParticipant>
     */
    public function loggableAssignments(User $user)
    {
        $finished = [Project::STATUS_COMPLETED, Project::STATUS_CANCELLED, Project::STATUS_ARCHIVED];

        return $user->projectParticipants()
            ->with('project.organisation')
            ->where('status', ProjectParticipant::STATUS_ACTIVE)
            ->whereHas('project', fn ($query) => $query->whereNotIn('status', $finished))
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    /**
     * Week (Monday–Sunday) entries of the user with project context.
     *
     * @return Collection<int, TimesheetEntry>
     */
    public function weekEntries(User $user, Carbon $weekStart)
    {
        [$start, $end] = $this->weekBounds($weekStart);

        return $this->rangeEntries($user, $start, $end);
    }

    /**
     * Entries of the user inside an arbitrary inclusive date range.
     * Always scoped to the caller's own assignments — the frontend can
     * never reach another participant's rows by changing an id.
     *
     * @return Collection<int, TimesheetEntry>
     */
    public function rangeEntries(User $user, Carbon $from, Carbon $to)
    {
        return TimesheetEntry::query()
            ->with(['timesheet.participant.project', 'reviewer:id,name'])
            ->whereHas('timesheet.participant', fn ($query) => $query->where('user_id', $user->id))
            // whereDate: SQLite stores date casts with a time suffix, so
            // plain string bounds are not portable across drivers.
            ->whereDate('work_date', '>=', $from->toDateString())
            ->whereDate('work_date', '<=', $to->toDateString())
            ->orderBy('work_date')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Per-day and week totals in minutes, derived from start/end times.
     * Legacy rows without a time range contribute 0 and are listed so the
     * UI can nudge the participant to add times.
     *
     * @param  Collection<int, TimesheetEntry>  $entries
     * @return array{by_day: array<string, int>, week_minutes: int, timeless_count: int}
     */
    public function weekSummary($entries): array
    {
        $byDay = [];
        $timeless = 0;

        foreach ($entries as $entry) {
            $day = $entry->work_date->toDateString();
            $minutes = $entry->durationMinutes();

            if ($minutes === null) {
                $timeless++;

                continue;
            }

            $byDay[$day] = ($byDay[$day] ?? 0) + $minutes;
        }

        ksort($byDay);

        return [
            'by_day' => $byDay,
            'week_minutes' => array_sum($byDay),
            'timeless_count' => $timeless,
        ];
    }

    /**
     * Create a calendar entry on the caller's own assignment.
     *
     * @param  array{project_participant_id: int, work_date: string, start_time: string, end_time: string, description: string}  $data
     */
    public function createEntry(User $user, array $data): TimesheetEntry
    {
        $assignment = $this->resolveAssignment($user, (int) $data['project_participant_id']);
        $minutes = $this->validateTimeRange($data['start_time'], $data['end_time']);
        $workDate = Carbon::parse($data['work_date'])->toDateString();

        $this->assertNoOverlap($user, $workDate, $data['start_time'], $data['end_time']);

        $timesheet = $this->weekHeader($assignment, Carbon::parse($workDate));

        $entry = TimesheetEntry::create([
            'timesheet_id' => $timesheet->id,
            'work_date' => $workDate,
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'hours' => round($minutes / 60, 2),
            'description' => $data['description'],
            'status' => TimesheetEntry::STATUS_DRAFT,
        ]);

        $this->refreshHeader($timesheet);

        return $entry->fresh(['timesheet.participant.project']);
    }

    /**
     * Update a draft (or rejected → back to draft) entry.
     *
     * @param  array{project_participant_id?: int, work_date?: string, start_time?: string, end_time?: string, description?: string}  $data
     */
    public function updateEntry(TimesheetEntry $entry, array $data): TimesheetEntry
    {
        $entry->loadMissing('timesheet.participant');

        $assignmentId = isset($data['project_participant_id'])
            ? (int) $data['project_participant_id']
            : $entry->timesheet->project_participant_id;

        $assignment = $this->resolveAssignment($entry->timesheet->participant->user, $assignmentId);

        $workDate = isset($data['work_date'])
            ? Carbon::parse($data['work_date'])->toDateString()
            : $entry->work_date->toDateString();
        $start = $data['start_time'] ?? $this->shortTime($entry->start_time);
        $end = $data['end_time'] ?? $this->shortTime($entry->end_time);

        $minutes = $this->validateTimeRange($start, $end);
        $this->assertNoOverlap($entry->timesheet->participant->user, $workDate, $start, $end, $entry->id);

        $oldHeader = $entry->timesheet;
        $newHeader = $this->weekHeader($assignment, Carbon::parse($workDate));

        $entry->update([
            'timesheet_id' => $newHeader->id,
            'work_date' => $workDate,
            'start_time' => $start,
            'end_time' => $end,
            'hours' => round($minutes / 60, 2),
            'description' => $data['description'] ?? $entry->description,
            // A corrected rejection re-enters the draft queue.
            'status' => TimesheetEntry::STATUS_DRAFT,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);

        $this->refreshHeader($oldHeader->fresh());
        if ($newHeader->id !== $oldHeader->id) {
            $this->refreshHeader($newHeader->fresh());
        }

        return $entry->fresh(['timesheet.participant.project']);
    }

    public function deleteEntry(TimesheetEntry $entry): void
    {
        $header = $entry->timesheet;
        $entry->delete();
        $this->refreshHeader($header->fresh());
    }

    /**
     * Submit a single draft/rejected entry for review.
     * Only the owning participant may submit, enforced by the policy.
     */
    public function submitEntry(TimesheetEntry $entry): TimesheetEntry
    {
        if (! in_array($entry->status, [TimesheetEntry::STATUS_DRAFT, TimesheetEntry::STATUS_REJECTED], true)) {
            throw ValidationException::withMessages([
                'entry' => 'Only draft entries can be submitted.',
            ]);
        }

        if ($entry->durationMinutes() === null) {
            throw ValidationException::withMessages([
                'entry' => 'Add start and end times before submitting.',
            ]);
        }

        $entry->update(['status' => TimesheetEntry::STATUS_SUBMITTED]);
        $this->refreshHeader($entry->timesheet->fresh());

        return $entry->fresh(['timesheet.participant.project', 'reviewer:id,name']);
    }

    /**
     * Submit the user's draft/rejected entries of the given week.
     * Returns the number of submitted entries.
     */
    public function submitWeek(User $user, Carbon $weekStart): int
    {
        [$start, $end] = $this->weekBounds($weekStart);

        $entries = TimesheetEntry::query()
            ->whereHas('timesheet.participant', fn ($query) => $query->where('user_id', $user->id))
            ->whereDate('work_date', '>=', $start->toDateString())
            ->whereDate('work_date', '<=', $end->toDateString())
            ->whereIn('status', [TimesheetEntry::STATUS_DRAFT, TimesheetEntry::STATUS_REJECTED])
            ->get();

        if ($entries->isEmpty()) {
            return 0;
        }

        // Every submitted entry must carry a time range: duration is the
        // billable source of truth, so timeless legacy rows stay draft.
        $timeless = $entries->filter(fn (TimesheetEntry $entry): bool => $entry->durationMinutes() === null);
        if ($timeless->isNotEmpty()) {
            throw ValidationException::withMessages([
                'week' => 'Add start and end times to all entries before submitting.',
            ]);
        }

        TimesheetEntry::query()->whereIn('id', $entries->pluck('id'))->update([
            'status' => TimesheetEntry::STATUS_SUBMITTED,
        ]);

        $headerIds = $entries->pluck('timesheet_id')->unique();
        foreach (Timesheet::whereIn('id', $headerIds)->get() as $header) {
            $this->refreshHeader($header);
        }

        return $entries->count();
    }

    /**
     * Approve a submitted entry. Reserved for project managers (Phase 5 UI).
     */
    public function approveEntry(TimesheetEntry $entry, User $reviewer, ?string $comment = null): TimesheetEntry
    {
        $entry->update([
            'status' => TimesheetEntry::STATUS_APPROVED,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_comment' => $comment,
        ]);

        $this->refreshHeader($entry->timesheet->fresh());

        return $entry->fresh();
    }

    /**
     * Reject a submitted entry with a mandatory comment so the participant
     * knows what to correct before resubmitting.
     */
    public function rejectEntry(TimesheetEntry $entry, User $reviewer, string $comment): TimesheetEntry
    {
        $entry->update([
            'status' => TimesheetEntry::STATUS_REJECTED,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_comment' => $comment,
        ]);

        $this->refreshHeader($entry->timesheet->fresh());

        return $entry->fresh();
    }

    /**
     * Resolve and authorize the assignment: it must belong to the user,
     * be in a loggable state, and live on a project still running.
     */
    protected function resolveAssignment(User $user, int $assignmentId): ProjectParticipant
    {
        $assignment = ProjectParticipant::with('project')
            ->where('id', $assignmentId)
            ->where('user_id', $user->id)
            ->where('status', ProjectParticipant::STATUS_ACTIVE)
            ->first();

        if ($assignment === null
            || $assignment->project === null
            || in_array($assignment->project->status, [
                Project::STATUS_COMPLETED,
                Project::STATUS_CANCELLED,
                Project::STATUS_ARCHIVED,
            ], true)) {
            throw ValidationException::withMessages([
                'project_participant_id' => 'Select one of your current project assignments.',
            ]);
        }

        return $assignment;
    }

    /**
     * Validate a same-day time range. Returns duration in minutes.
     */
    protected function validateTimeRange(string $start, string $end): int
    {
        $startAt = Carbon::parse($start);
        $endAt = Carbon::parse($end);

        if (! $endAt->greaterThan($startAt)) {
            throw ValidationException::withMessages([
                'end_time' => 'End time must be after start time.',
            ]);
        }

        $minutes = (int) $startAt->diffInMinutes($endAt);

        if ($minutes > TimesheetEntry::MAX_MINUTES) {
            throw ValidationException::withMessages([
                'end_time' => 'A single entry may not exceed 16 hours.',
            ]);
        }

        return $minutes;
    }

    /**
     * Prevent accidental double-booking: no overlapping time ranges for
     * the same participant on the same date (rejected corrections count
     * as occupied until they are moved or deleted).
     */
    protected function assertNoOverlap(User $user, string $workDate, string $start, string $end, ?int $ignoreId = null): void
    {
        $conflict = TimesheetEntry::query()
            ->whereHas('timesheet.participant', fn ($query) => $query->where('user_id', $user->id))
            // whereDate: SQLite stores date casts with a time suffix,
            // so exact string equality never matches there.
            ->whereDate('work_date', $workDate)
            ->whereNotNull('start_time')
            ->whereNotNull('end_time')
            ->when($ignoreId !== null, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('start_time', '<', $end)
            ->where('end_time', '>', $start)
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'start_time' => 'This overlaps another entry on the same day.',
            ]);
        }
    }

    /**
     * Find or create the draft weekly header containing the entry.
     * Headers group entries per assignment × week for the existing weekly
     * review views and keep total_hours truthful via refreshHeader().
     */
    protected function weekHeader(ProjectParticipant $assignment, Carbon $date): Timesheet
    {
        [$start, $end] = $this->weekBounds($date);

        return Timesheet::firstOrCreate(
            [
                'project_participant_id' => $assignment->id,
                // Full datetime strings: SQLite stores date casts with a
                // time suffix, so 'Y-m-d' lookups would miss every time
                // and spawn duplicate headers.
                'period_start' => $start->toDateTimeString(),
                'period_end' => $end->toDateTimeString(),
            ],
            [
                'total_hours' => 0,
                'status' => Timesheet::STATUS_DRAFT,
            ],
        );
    }

    /**
     * Recompute a header's totals and roll up entry states so the weekly
     * views never drift from the entries. Draft dominates: a header is
     * only approved once every entry is approved.
     */
    protected function refreshHeader(Timesheet $header): void
    {
        if (! $header->exists) {
            return;
        }

        $states = $header->entries()->pluck('status');
        $total = (float) $header->entries()->sum('hours');

        $status = match (true) {
            $states->contains(Timesheet::STATUS_DRAFT) => Timesheet::STATUS_DRAFT,
            $states->contains(Timesheet::STATUS_SUBMITTED) => Timesheet::STATUS_SUBMITTED,
            $states->contains(Timesheet::STATUS_REJECTED) => Timesheet::STATUS_REJECTED,
            $states->isNotEmpty() => Timesheet::STATUS_APPROVED,
            default => Timesheet::STATUS_DRAFT,
        };

        $header->update(['total_hours' => $total, 'status' => $status]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    protected function weekBounds(Carbon $date): array
    {
        $start = $date->copy()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $end = $start->copy()->addDays(6)->startOfDay();

        return [$start, $end];
    }

    /**
     * Normalize a TIME column value (H:i:s) to the H:i form inputs use.
     */
    protected function shortTime(?string $time): string
    {
        return substr((string) $time, 0, 5);
    }
}
