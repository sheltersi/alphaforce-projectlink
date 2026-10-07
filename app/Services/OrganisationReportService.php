<?php

namespace App\Services;

use App\Models\Organisation;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectParticipant;
use App\Models\Timesheet;
use App\Models\TimesheetEntry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Read-only reporting queries over the existing project and timesheet
 * workflow. All returned records are rooted in projects owned by the given
 * organisation; no reporting counters are persisted.
 */
class OrganisationReportService
{
    private const PENDING_APPLICATION_STATUSES = [
        ProjectApplication::STATUS_SUBMITTED,
        ProjectApplication::STATUS_UNDER_REVIEW,
        ProjectApplication::STATUS_SHORTLISTED,
    ];

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, int|float>
     */
    public function summary(Organisation $organisation, array $filters = []): array
    {
        $projects = Project::query()->where('organisation_id', $organisation->id);

        if (isset($filters['project_id'])) {
            $projects->whereKey($filters['project_id']);
        }

        if (isset($filters['from'])) {
            $projects->where(fn (Builder $query) => $query->whereNull('end_date')->orWhereDate('end_date', '>=', $filters['from']));
        }

        if (isset($filters['to'])) {
            $projects->where(fn (Builder $query) => $query->whereNull('start_date')->orWhereDate('start_date', '<=', $filters['to']));
        }

        $projectIds = $projects->select('id');
        $participants = ProjectParticipant::query()->whereIn('project_id', $projectIds);
        $applications = ProjectApplication::query()->whereIn('project_id', $projectIds);
        $entries = TimesheetEntry::query()->whereHas('timesheet.participant.project', fn (Builder $query) => $query->where('organisation_id', $organisation->id));

        if (isset($filters['participant_id'])) {
            $participants->where('user_id', $filters['participant_id']);
            $applications->where('user_id', $filters['participant_id']);
            $entries->whereHas('timesheet.participant', fn (Builder $query) => $query->where('user_id', $filters['participant_id']));
        }

        if (isset($filters['from'])) {
            $participants->whereDate('joined_at', '>=', $filters['from']);
            $applications->whereDate('submitted_at', '>=', $filters['from']);
        }

        if (isset($filters['to'])) {
            $participants->whereDate('joined_at', '<=', $filters['to']);
            $applications->whereDate('submitted_at', '<=', $filters['to']);
        }

        $pendingApplications = (clone $applications)->whereIn('status', self::PENDING_APPLICATION_STATUSES);
        $pendingTimesheets = Timesheet::query()
            ->whereHas('participant.project', fn (Builder $query) => $query->where('organisation_id', $organisation->id))
            ->whereHas('entries', function (Builder $query) use ($filters) {
                $query->where('status', TimesheetEntry::STATUS_SUBMITTED);
                $this->applyEntryDateFilters($query, $filters);
            });

        if (isset($filters['project_id'])) {
            $pendingTimesheets->whereHas('participant', fn (Builder $query) => $query->where('project_id', $filters['project_id']));
        }

        if (isset($filters['participant_id'])) {
            $pendingTimesheets->whereHas('participant', fn (Builder $query) => $query->where('user_id', $filters['participant_id']));
        }

        $this->applyEntryDateFilters($entries, $filters);

        $activeProjects = (clone $projects)->whereIn('status', [Project::STATUS_OPEN, Project::STATUS_IN_PROGRESS]);

        return [
            'active_projects' => $activeProjects->count(),
            'total_participants' => $participants->distinct('user_id')->count('user_id'),
            'pending_applications' => $pendingApplications->count(),
            'pending_timesheets' => $pendingTimesheets->distinct('timesheets.id')->count('timesheets.id'),
            'total_hours_logged' => round((float) $entries->sum('hours'), 2),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function projects(Organisation $organisation, array $filters = []): LengthAwarePaginator
    {
        $applicationsCount = fn (Builder $query) => $query
            ->when(isset($filters['participant_id']), fn (Builder $query) => $query->where('user_id', $filters['participant_id']))
            ->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('submitted_at', '>=', $filters['from']))
            ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('submitted_at', '<=', $filters['to']));
        $participantsCount = fn (Builder $query) => $query
            ->when(isset($filters['participant_id']), fn (Builder $query) => $query->where('user_id', $filters['participant_id']))
            ->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('joined_at', '>=', $filters['from']))
            ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('joined_at', '<=', $filters['to']));

        $query = Project::query()
            ->where('organisation_id', $organisation->id)
            ->withCount([
                'applications' => $applicationsCount,
                'applications as accepted_participants_count' => fn (Builder $query) => $applicationsCount($query)->where('status', ProjectApplication::STATUS_ACCEPTED),
                'participants as active_participants_count' => fn (Builder $query) => $participantsCount($query)->where('status', ProjectParticipant::STATUS_ACTIVE),
            ])
            ->addSelect([
                'total_hours_logged' => TimesheetEntry::query()
                    ->selectRaw('COALESCE(SUM(timesheet_entries.hours), 0)')
                    ->join('timesheets', 'timesheets.id', '=', 'timesheet_entries.timesheet_id')
                    ->join('project_participants', 'project_participants.id', '=', 'timesheets.project_participant_id')
                    ->whereColumn('project_participants.project_id', 'projects.id')
                    ->when(isset($filters['participant_id']), fn (Builder $query) => $query->where('project_participants.user_id', $filters['participant_id']))
                    ->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('timesheet_entries.work_date', '>=', $filters['from']))
                    ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('timesheet_entries.work_date', '<=', $filters['to'])),
            ]);

        $query->when(isset($filters['project_id']), fn (Builder $query) => $query->whereKey($filters['project_id']));
        $query->when(isset($filters['status']), fn (Builder $query) => $query->where('status', $filters['status']));
        $query->when(isset($filters['participant_id']), fn (Builder $query) => $query->where(function (Builder $query) use ($filters) {
            $query->whereHas('participants', fn (Builder $participant) => $participant->where('user_id', $filters['participant_id']))
                ->orWhereHas('applications', fn (Builder $application) => $application->where('user_id', $filters['participant_id']));
        }));
        $this->applyProjectDateFilters($query, $filters);

        return $query->orderBy('projects.id')->paginate($this->perPage($filters))->withQueryString()
            ->through(fn (Project $project) => [
                'id' => $project->id,
                'title' => $project->title,
                'status' => $project->status,
                'start_date' => $project->start_date?->toDateString(),
                'end_date' => $project->end_date?->toDateString(),
                'positions' => $project->positions,
                'applications_count' => $project->applications_count,
                'accepted_participants_count' => $project->accepted_participants_count,
                'active_participants_count' => $project->active_participants_count,
                'total_hours_logged' => round((float) $project->total_hours_logged, 2),
            ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function participants(Organisation $organisation, array $filters = []): LengthAwarePaginator
    {
        // Applications are the broadest project/user relationship: they
        // include pending applicants as well as accepted participants.
        // Include manually-created assignments that have no application in
        // a second branch so every existing participation is represented.
        $applications = DB::table('project_applications as applications')
            ->join('projects', 'projects.id', '=', 'applications.project_id')
            ->join('users', 'users.id', '=', 'applications.user_id')
            ->leftJoin('project_participants', function ($join) {
                $join->on('project_participants.project_id', '=', 'applications.project_id')
                    ->on('project_participants.user_id', '=', 'applications.user_id');
            })
            ->where('projects.organisation_id', $organisation->id)
            ->selectRaw("applications.id as application_id, project_participants.id as assignment_id, applications.project_id, applications.user_id, applications.status as application_status, project_participants.status as participation_status, CASE WHEN applications.status = 'accepted' THEN COALESCE(applications.reviewed_at, project_participants.joined_at) ELSE project_participants.joined_at END as accepted_at, projects.title as project_title, projects.status as project_status, users.name as participant_name, users.email as participant_email")
            ->selectSub($this->participantHoursQuery(null, $filters), 'total_hours_logged')
            ->selectSub($this->participantHoursQuery([TimesheetEntry::STATUS_APPROVED], $filters), 'approved_hours')
            ->selectSub($this->participantHoursQuery([TimesheetEntry::STATUS_SUBMITTED], $filters), 'pending_hours')
            ->selectSub($this->participantHoursQuery([TimesheetEntry::STATUS_REJECTED], $filters), 'rejected_hours')
            ->selectSub($this->participantHoursQuery([TimesheetEntry::STATUS_DRAFT], $filters), 'draft_hours');

        $assignments = DB::table('project_participants')
            ->join('projects', 'projects.id', '=', 'project_participants.project_id')
            ->join('users', 'users.id', '=', 'project_participants.user_id')
            ->where('projects.organisation_id', $organisation->id)
            ->whereNotExists(fn ($query) => $query->selectRaw('1')->from('project_applications')
                ->whereColumn('project_applications.project_id', 'project_participants.project_id')
                ->whereColumn('project_applications.user_id', 'project_participants.user_id'))
            ->selectRaw('NULL as application_id, project_participants.id as assignment_id, project_participants.project_id, project_participants.user_id, NULL as application_status, project_participants.status as participation_status, project_participants.joined_at as accepted_at, projects.title as project_title, projects.status as project_status, users.name as participant_name, users.email as participant_email')
            ->selectSub($this->participantHoursQuery(null, $filters), 'total_hours_logged')
            ->selectSub($this->participantHoursQuery([TimesheetEntry::STATUS_APPROVED], $filters), 'approved_hours')
            ->selectSub($this->participantHoursQuery([TimesheetEntry::STATUS_SUBMITTED], $filters), 'pending_hours')
            ->selectSub($this->participantHoursQuery([TimesheetEntry::STATUS_REJECTED], $filters), 'rejected_hours')
            ->selectSub($this->participantHoursQuery([TimesheetEntry::STATUS_DRAFT], $filters), 'draft_hours');

        $this->applyParticipantReportFilters($applications, $filters, false);
        $this->applyParticipantReportFilters($assignments, $filters, true);

        $rows = $applications->unionAll($assignments);

        return DB::query()->fromSub($rows, 'participant_report_rows')
            ->orderByDesc('accepted_at')->orderBy('project_id')->orderBy('user_id')
            ->paginate($this->perPage($filters))->withQueryString()
            ->through(fn (object $row) => [
                'application_id' => $row->application_id,
                'assignment_id' => $row->assignment_id,
                'participant' => [
                    'id' => $row->user_id,
                    'name' => $row->participant_name,
                    'email' => $row->participant_email,
                ],
                'project' => [
                    'id' => $row->project_id,
                    'title' => $row->project_title,
                    'status' => $row->project_status,
                ],
                'application_status' => $row->application_status,
                'participation_status' => $row->participation_status,
                'accepted_at' => $row->accepted_at,
                'total_hours_logged' => round((float) $row->total_hours_logged, 2),
                'timesheet_summary' => [
                    'approved_hours' => round((float) $row->approved_hours, 2),
                    'pending_hours' => round((float) $row->pending_hours, 2),
                    'rejected_hours' => round((float) $row->rejected_hours, 2),
                    'draft_hours' => round((float) $row->draft_hours, 2),
                ],
            ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function timesheets(Organisation $organisation, array $filters = []): LengthAwarePaginator
    {
        $query = Timesheet::query()
            ->whereHas('participant.project', fn (Builder $query) => $query->where('organisation_id', $organisation->id))
            ->with([
                'participant.project:id,title,status',
                'participant.user:id,name,email',
            ])
            ->withSum(['entries as submitted_hours' => fn (Builder $query) => $query->whereIn('status', [
                TimesheetEntry::STATUS_SUBMITTED,
                TimesheetEntry::STATUS_APPROVED,
                TimesheetEntry::STATUS_REJECTED,
            ])->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('work_date', '>=', $filters['from']))
                ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('work_date', '<=', $filters['to']))], 'hours')
            ->withSum(['entries as approved_hours' => fn (Builder $query) => $query->where('status', TimesheetEntry::STATUS_APPROVED)
                ->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('work_date', '>=', $filters['from']))
                ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('work_date', '<=', $filters['to']))], 'hours')
            ->withSum(['entries as pending_hours' => fn (Builder $query) => $query->where('status', TimesheetEntry::STATUS_SUBMITTED)
                ->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('work_date', '>=', $filters['from']))
                ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('work_date', '<=', $filters['to']))], 'hours')
            ->withSum(['entries as rejected_hours' => fn (Builder $query) => $query->where('status', TimesheetEntry::STATUS_REJECTED)
                ->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('work_date', '>=', $filters['from']))
                ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('work_date', '<=', $filters['to']))], 'hours');

        $query->when(isset($filters['project_id']), fn (Builder $query) => $query->whereHas('participant', fn (Builder $participant) => $participant->where('project_id', $filters['project_id'])));
        $query->when(isset($filters['participant_id']), fn (Builder $query) => $query->whereHas('participant', fn (Builder $participant) => $participant->where('user_id', $filters['participant_id'])));
        $query->when(isset($filters['status']), function (Builder $query) use ($filters) {
            $query->where(function (Builder $query) use ($filters) {
                $query->where('status', $filters['status'])
                    ->orWhereHas('entries', function (Builder $entry) use ($filters) {
                        $entry->where('status', $filters['status']);
                        $this->applyEntryDateFilters($entry, $filters);
                    });
            });
        });
        $query->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('period_end', '>=', $filters['from']));
        $query->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('period_start', '<=', $filters['to']));

        if (isset($filters['from']) || isset($filters['to'])) {
            $query->withSum(['entries as total_hours' => function (Builder $entry) use ($filters) {
                $this->applyEntryDateFilters($entry, $filters);
            }], 'hours');
        }

        return $query->orderByDesc('period_start')->orderByDesc('id')->paginate($this->perPage($filters))->withQueryString()
            ->through(fn (Timesheet $timesheet) => [
                'id' => $timesheet->id,
                'project' => [
                    'id' => $timesheet->participant->project->id,
                    'title' => $timesheet->participant->project->title,
                    'status' => $timesheet->participant->project->status,
                ],
                'participant' => [
                    'id' => $timesheet->participant->user->id,
                    'name' => $timesheet->participant->user->name,
                    'email' => $timesheet->participant->user->email,
                ],
                'period_start' => $timesheet->period_start->toDateString(),
                'period_end' => $timesheet->period_end->toDateString(),
                'status' => $timesheet->status,
                'submitted_hours' => round((float) $timesheet->submitted_hours, 2),
                'approved_hours' => round((float) $timesheet->approved_hours, 2),
                'pending_hours' => round((float) $timesheet->pending_hours, 2),
                'rejected_hours' => round((float) $timesheet->rejected_hours, 2),
                'total_hours' => round((float) $timesheet->total_hours, 2),
            ]);
    }

    private function participantHoursQuery(?array $statuses, array $filters)
    {
        return DB::table('timesheet_entries')
            ->join('timesheets', 'timesheets.id', '=', 'timesheet_entries.timesheet_id')
            ->selectRaw('COALESCE(SUM(timesheet_entries.hours), 0)')
            ->whereColumn('timesheets.project_participant_id', 'project_participants.id')
            ->when($statuses !== null, fn ($query) => $query->whereIn('timesheet_entries.status', $statuses))
            ->when(isset($filters['from']), fn ($query) => $query->whereDate('timesheet_entries.work_date', '>=', $filters['from']))
            ->when(isset($filters['to']), fn ($query) => $query->whereDate('timesheet_entries.work_date', '<=', $filters['to']));
    }

    /** @param array<string, mixed> $filters */
    private function applyParticipantReportFilters($query, array $filters, bool $assignmentOnly): void
    {
        $projectColumn = $assignmentOnly ? 'project_participants.project_id' : 'applications.project_id';
        $userColumn = $assignmentOnly ? 'project_participants.user_id' : 'applications.user_id';
        $applicationStatusColumn = $assignmentOnly ? null : 'applications.status';
        $participationStatusColumn = 'project_participants.status';
        $acceptedDate = $assignmentOnly
            ? 'project_participants.joined_at'
            : "COALESCE(CASE WHEN applications.status = 'accepted' THEN applications.reviewed_at END, project_participants.joined_at, applications.submitted_at)";

        if (isset($filters['project_id'])) {
            $query->where($projectColumn, $filters['project_id']);
        }

        if (isset($filters['participant_id'])) {
            $query->where($userColumn, $filters['participant_id']);
        }

        if (isset($filters['status'])) {
            $query->where(function ($query) use ($filters, $applicationStatusColumn, $participationStatusColumn) {
                if ($applicationStatusColumn !== null) {
                    $query->where($applicationStatusColumn, $filters['status'])
                        ->orWhere($participationStatusColumn, $filters['status']);
                } else {
                    $query->where($participationStatusColumn, $filters['status']);
                }
            });
        }

        if (isset($filters['from'])) {
            $query->whereDate(DB::raw($acceptedDate), '>=', $filters['from']);
        }

        if (isset($filters['to'])) {
            $query->whereDate(DB::raw($acceptedDate), '<=', $filters['to']);
        }
    }

    /** @param array<string, mixed> $filters */
    private function applyEntryDateFilters(Builder $query, array $filters): void
    {
        $query->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('work_date', '>=', $filters['from']))
            ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('work_date', '<=', $filters['to']));
    }

    /** @param array<string, mixed> $filters */
    private function applyProjectDateFilters(Builder $query, array $filters): void
    {
        $query->when(isset($filters['from']), fn (Builder $query) => $query->where(fn (Builder $query) => $query->whereNull('end_date')->orWhereDate('end_date', '>=', $filters['from'])))
            ->when(isset($filters['to']), fn (Builder $query) => $query->where(fn (Builder $query) => $query->whereNull('start_date')->orWhereDate('start_date', '<=', $filters['to'])));
    }

    /** @param array<string, mixed> $filters */
    private function perPage(array $filters): int
    {
        return (int) ($filters['per_page'] ?? 15);
    }
}
