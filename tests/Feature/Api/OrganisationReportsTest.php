<?php

use App\Models\Organisation;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectParticipant;
use App\Models\Timesheet;
use App\Models\TimesheetEntry;
use App\Models\User;

/** @return array{organisation: Organisation, manager: User, member: User, otherOrganisation: Organisation, otherManager: User} */
function reportSetup(): array
{
    $organisation = Organisation::factory()->create();
    $otherOrganisation = Organisation::factory()->create();
    $manager = User::factory()->create();
    $member = User::factory()->create();
    $otherManager = User::factory()->create();
    $organisation->users()->attach($manager->id, ['role' => 'manager']);
    $organisation->users()->attach($member->id, ['role' => 'member']);
    $otherOrganisation->users()->attach($otherManager->id, ['role' => 'manager']);

    return compact('organisation', 'manager', 'member', 'otherOrganisation', 'otherManager');
}

/** @return array<string, string> */
function reportHeaders(User $user): array
{
    app('auth')->forgetGuards();

    return [
        'Authorization' => 'Bearer '.$user->createToken('reports-test')->plainTextToken,
        'Accept' => 'application/json',
    ];
}

function reportProject(Organisation $organisation, string $status = Project::STATUS_OPEN): Project
{
    return Project::factory()->create([
        'organisation_id' => $organisation->id,
        'status' => $status,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
    ]);
}

function reportAssignment(Project $project, User $participant, ?ProjectApplication $application = null, string $status = ProjectParticipant::STATUS_ACTIVE): ProjectParticipant
{
    return ProjectParticipant::factory()->create([
        'project_id' => $project->id,
        'user_id' => $participant->id,
        'application_id' => $application?->id,
        'status' => $status,
        'joined_at' => '2026-02-01',
    ]);
}

function reportEntry(Timesheet $timesheet, string $date, string $hours, string $status): TimesheetEntry
{
    return TimesheetEntry::factory()->create([
        'timesheet_id' => $timesheet->id,
        'work_date' => $date,
        'hours' => $hours,
        'status' => $status,
    ]);
}

it('returns organisation-scoped summary metrics calculated from existing records', function () {
    $setup = reportSetup();
    $open = reportProject($setup['organisation']);
    $inProgress = reportProject($setup['organisation'], Project::STATUS_IN_PROGRESS);
    reportProject($setup['organisation'], Project::STATUS_COMPLETED);
    $foreignProject = reportProject($setup['otherOrganisation']);

    $participant = User::factory()->create();
    $accepted = ProjectApplication::factory()->create([
        'project_id' => $open->id,
        'user_id' => $participant->id,
        'status' => ProjectApplication::STATUS_ACCEPTED,
        'reviewed_at' => '2026-02-01 12:00:00',
    ]);
    reportAssignment($open, $participant, $accepted);
    reportAssignment($inProgress, $participant, status: ProjectParticipant::STATUS_COMPLETED);

    ProjectApplication::factory()->create([
        'project_id' => $open->id,
        'status' => ProjectApplication::STATUS_UNDER_REVIEW,
    ]);
    ProjectApplication::factory()->create([
        'project_id' => $foreignProject->id,
        'status' => ProjectApplication::STATUS_SUBMITTED,
    ]);

    $assignment = ProjectParticipant::where('project_id', $open->id)->firstOrFail();
    $sheet = Timesheet::factory()->create([
        'project_participant_id' => $assignment->id,
        'period_start' => '2026-10-05',
        'period_end' => '2026-10-11',
    ]);
    reportEntry($sheet, '2026-10-06', '2.50', TimesheetEntry::STATUS_SUBMITTED);
    reportEntry($sheet, '2026-10-07', '1.25', TimesheetEntry::STATUS_APPROVED);

    $response = $this->getJson('/api/organisation/reports/summary', reportHeaders($setup['manager']))
        ->assertOk()
        ->assertJsonPath('data.active_projects', 2)
        ->assertJsonPath('data.total_participants', 1)
        ->assertJsonPath('data.pending_applications', 1)
        ->assertJsonPath('data.pending_timesheets', 1)
        ->assertJsonPath('data.total_hours_logged', 3.75);

    expect($response->json('data'))->not->toHaveKey('foreign_project_id');
});

it('returns project metrics with project, status and date filters and pagination', function () {
    $setup = reportSetup();
    $first = reportProject($setup['organisation']);
    $second = reportProject($setup['organisation'], Project::STATUS_IN_PROGRESS);
    reportProject($setup['otherOrganisation']);

    $person = User::factory()->create();
    $accepted = ProjectApplication::factory()->create([
        'project_id' => $first->id,
        'user_id' => $person->id,
        'status' => ProjectApplication::STATUS_ACCEPTED,
    ]);
    reportAssignment($first, $person, $accepted);
    reportAssignment($second, $person, status: ProjectParticipant::STATUS_COMPLETED);
    ProjectApplication::factory()->create(['project_id' => $first->id]);

    $sheet = Timesheet::factory()->create([
        'project_participant_id' => ProjectParticipant::where('project_id', $first->id)->firstOrFail()->id,
        'period_start' => '2026-10-05', 'period_end' => '2026-10-11',
    ]);
    reportEntry($sheet, '2026-10-06', '4.00', TimesheetEntry::STATUS_APPROVED);

    $headers = reportHeaders($setup['manager']);
    $page = $this->getJson('/api/organisation/reports/projects?per_page=1&page=1', $headers)
        ->assertOk()
        ->assertJsonStructure(['data', 'links', 'meta'])
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('meta.per_page', 1);
    expect($page->json('data'))->toHaveCount(1);

    $row = $this->getJson("/api/organisation/reports/projects?project_id={$first->id}", $headers)
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.0.status', Project::STATUS_OPEN)
        ->assertJsonPath('data.0.applications_count', 2)
        ->assertJsonPath('data.0.accepted_participants_count', 1)
        ->assertJsonPath('data.0.active_participants_count', 1)
        ->assertJsonPath('data.0.total_hours_logged', 4);

    expect($row->json('data'))->toHaveCount(1);
    $this->getJson('/api/organisation/reports/projects?status=in_progress&from=2026-01-01&to=2026-12-31', $headers)
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $second->id);
});

it('reports participants and pending applicants across their project relationships', function () {
    $setup = reportSetup();
    $project = reportProject($setup['organisation']);
    $secondProject = reportProject($setup['organisation'], Project::STATUS_IN_PROGRESS);
    $participant = User::factory()->create();
    $accepted = ProjectApplication::factory()->create([
        'project_id' => $project->id,
        'user_id' => $participant->id,
        'status' => ProjectApplication::STATUS_ACCEPTED,
        'reviewed_at' => '2026-02-01 12:00:00',
    ]);
    $assignment = reportAssignment($project, $participant, $accepted);
    reportAssignment($secondProject, $participant, status: ProjectParticipant::STATUS_COMPLETED);
    $pending = ProjectApplication::factory()->create([
        'project_id' => $project->id,
        'status' => ProjectApplication::STATUS_SUBMITTED,
        'submitted_at' => '2026-03-02 09:00:00',
    ]);

    $sheet = Timesheet::factory()->create([
        'project_participant_id' => $assignment->id,
        'period_start' => '2026-10-05', 'period_end' => '2026-10-11',
    ]);
    reportEntry($sheet, '2026-10-06', '2.00', TimesheetEntry::STATUS_APPROVED);
    reportEntry($sheet, '2026-10-07', '1.50', TimesheetEntry::STATUS_SUBMITTED);
    reportEntry($sheet, '2026-10-08', '0.50', TimesheetEntry::STATUS_REJECTED);
    reportEntry($sheet, '2026-10-09', '1.00', TimesheetEntry::STATUS_DRAFT);

    $headers = reportHeaders($setup['manager']);
    $acceptedRow = $this->getJson("/api/organisation/reports/participants?project_id={$project->id}&participant_id={$participant->id}", $headers)
        ->assertOk()
        ->assertJsonPath('data.0.application_status', ProjectApplication::STATUS_ACCEPTED)
        ->assertJsonPath('data.0.participation_status', ProjectParticipant::STATUS_ACTIVE)
        ->assertJsonPath('data.0.total_hours_logged', 5)
        ->assertJsonPath('data.0.timesheet_summary.approved_hours', 2)
        ->assertJsonPath('data.0.timesheet_summary.pending_hours', 1.5)
        ->assertJsonPath('data.0.timesheet_summary.rejected_hours', 0.5)
        ->assertJsonPath('data.0.timesheet_summary.draft_hours', 1);
    expect($acceptedRow->json('data'))->toHaveCount(1);

    $this->getJson("/api/organisation/reports/participants?project_id={$project->id}&status=submitted", $headers)
        ->assertOk()->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.application_id', $pending->id)
        ->assertJsonPath('data.0.application_status', ProjectApplication::STATUS_SUBMITTED)
        ->assertJsonPath('data.0.assignment_id', null);

    $this->getJson("/api/organisation/reports/participants?project_id={$project->id}&from=2026-03-01&to=2026-03-31", $headers)
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.application_id', $pending->id);
    $this->getJson("/api/organisation/reports/participants?project_id={$project->id}&from=2026-02-01&to=2026-02-01", $headers)
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.application_id', $accepted->id);

    $this->getJson('/api/organisation/reports/participants?per_page=1', $headers)
        ->assertOk()->assertJsonPath('meta.total', 3)->assertJsonPath('meta.per_page', 1);
});

it('summarises per-entry timesheet hours and supports period, status and participant filters', function () {
    $setup = reportSetup();
    $project = reportProject($setup['organisation']);
    $otherProject = reportProject($setup['otherOrganisation']);
    $participant = User::factory()->create();
    $assignment = reportAssignment($project, $participant);
    $foreignAssignment = reportAssignment($otherProject, User::factory()->create());

    $sheet = Timesheet::factory()->create([
        'project_participant_id' => $assignment->id,
        'period_start' => '2026-10-05',
        'period_end' => '2026-10-11',
        'status' => Timesheet::STATUS_SUBMITTED,
    ]);
    reportEntry($sheet, '2026-10-06', '3.00', TimesheetEntry::STATUS_SUBMITTED);
    reportEntry($sheet, '2026-10-07', '2.00', TimesheetEntry::STATUS_APPROVED);
    reportEntry($sheet, '2026-10-08', '1.00', TimesheetEntry::STATUS_REJECTED);
    reportEntry($sheet, '2026-10-09', '0.50', TimesheetEntry::STATUS_DRAFT);

    $foreignSheet = Timesheet::factory()->create([
        'project_participant_id' => $foreignAssignment->id,
        'period_start' => '2026-10-05', 'period_end' => '2026-10-11',
    ]);
    reportEntry($foreignSheet, '2026-10-06', '8.00', TimesheetEntry::STATUS_SUBMITTED);

    $headers = reportHeaders($setup['manager']);
    $this->getJson("/api/organisation/reports/timesheets?project_id={$project->id}&participant_id={$participant->id}&from=2026-10-05&to=2026-10-11", $headers)
        ->assertOk()->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.project.id', $project->id)
        ->assertJsonPath('data.0.participant.id', $participant->id)
        ->assertJsonPath('data.0.period_start', '2026-10-05')
        ->assertJsonPath('data.0.submitted_hours', 6)
        ->assertJsonPath('data.0.approved_hours', 2)
        ->assertJsonPath('data.0.pending_hours', 3)
        ->assertJsonPath('data.0.rejected_hours', 1)
        ->assertJsonPath('data.0.total_hours', 6.5);

    $this->getJson('/api/organisation/reports/timesheets?status=approved', $headers)
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $sheet->id);
});

it('requires an organisation manager and prevents cross-organisation report access', function () {
    $setup = reportSetup();
    $ownProject = reportProject($setup['organisation']);
    $foreignProject = reportProject($setup['otherOrganisation']);
    $foreignParticipant = User::factory()->create();
    $foreignAssignment = reportAssignment($foreignProject, $foreignParticipant);
    $foreignSheet = Timesheet::factory()->create(['project_participant_id' => $foreignAssignment->id]);
    reportEntry($foreignSheet, '2026-10-06', '8.00', TimesheetEntry::STATUS_SUBMITTED);

    $this->getJson('/api/organisation/reports/summary')->assertUnauthorized();
    $this->getJson('/api/organisation/reports/summary', reportHeaders($setup['member']))->assertForbidden();

    $headers = reportHeaders($setup['manager']);
    $this->getJson('/api/organisation/reports/projects', $headers)
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $ownProject->id);
    $this->getJson('/api/organisation/reports/participants', $headers)
        ->assertOk()->assertJsonCount(0, 'data');
    $this->getJson('/api/organisation/reports/timesheets', $headers)
        ->assertOk()->assertJsonCount(0, 'data');
    $this->getJson('/api/organisation/reports/summary', $headers)
        ->assertOk()->assertJsonPath('data.total_hours_logged', 0)
        ->assertJsonPath('data.pending_timesheets', 0);
    $this->getJson("/api/organisation/reports/projects?project_id={$foreignProject->id}", $headers)->assertNotFound();

    $this->getJson('/api/organisation/reports/projects?status=not-a-status', $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('status');
    $this->getJson('/api/organisation/reports/timesheets?per_page=101', $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('per_page');
});
