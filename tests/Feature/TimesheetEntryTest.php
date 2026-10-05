<?php

use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\Project;
use App\Models\ProjectParticipant;
use App\Models\Timesheet;
use App\Models\TimesheetEntry;
use App\Models\User;
use Illuminate\Support\Carbon;

function timesheetAssignment(?User $forUser = null, array $projectAttrs = []): ProjectParticipant
{
    // Note: the schema allows only one active assignment (with a role) per
    // user, so each assignment here gets its own user unless one is passed.
    $user = $forUser ?? User::factory()->create();
    $user->markEmailAsVerified();
    $organisation = Organisation::factory()->create();
    $project = Project::factory()->create(array_merge(
        ['organisation_id' => $organisation->id, 'status' => 'in_progress'],
        $projectAttrs,
    ));

    return ProjectParticipant::create([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'role' => 'Developer',
        'status' => 'active',
        'joined_at' => now(),
    ]);
}

function entryPayload(ProjectParticipant $assignment, array $overrides = []): array
{
    return array_merge([
        'project_participant_id' => $assignment->id,
        'work_date' => '2026-10-06',
        'start_time' => '09:30',
        'end_time' => '12:15',
        'description' => 'Dashboard work',
    ], $overrides);
}

it('creates a draft calendar entry with server-computed hours on the weekly header', function () {
    $assignment = timesheetAssignment();
    $user = $assignment->user;

    $response = $this->actingAs($user)->post(route('timesheets.entries.store'), entryPayload($assignment));

    $response->assertRedirect();
    $entry = TimesheetEntry::first();
    expect($entry->status)->toBe('draft')
        ->and((float) $entry->hours)->toBe(2.75)
        ->and($entry->durationMinutes())->toBe(165)
        ->and($entry->timesheet->period_start->toDateString())->toBe('2026-10-05')
        ->and($entry->timesheet->period_end->toDateString())->toBe('2026-10-11');
});

it('rejects entries on assignments the user does not own', function () {
    $mine = timesheetAssignment();
    $theirs = timesheetAssignment();

    $this->actingAs($mine->user)
        ->post(route('timesheets.entries.store'), entryPayload($theirs))
        ->assertInvalid('project_participant_id');

    expect(TimesheetEntry::count())->toBe(0);
});

it('rejects entries on finished projects and invalid time ranges', function () {
    $finished = timesheetAssignment(projectAttrs: ['status' => 'completed']);

    // Finished project.
    $this->actingAs($finished->user)
        ->post(route('timesheets.entries.store'), entryPayload($finished))
        ->assertInvalid('project_participant_id');

    $open = timesheetAssignment();

    // End before start.
    $this->actingAs($open->user)
        ->post(route('timesheets.entries.store'), entryPayload($open, ['start_time' => '14:00', 'end_time' => '12:00']))
        ->assertInvalid('end_time');

    // Over 16 hours.
    $this->actingAs($open->user)
        ->post(route('timesheets.entries.store'), entryPayload($open, ['start_time' => '00:00', 'end_time' => '17:00']))
        ->assertInvalid('end_time');

    // Description required.
    $this->actingAs($open->user)
        ->post(route('timesheets.entries.store'), entryPayload($open, ['description' => '']))
        ->assertInvalid('description');

    expect(TimesheetEntry::count())->toBe(0);
});

it('prevents overlapping entries on the same day', function () {
    $assignment = timesheetAssignment();

    $this->actingAs($assignment->user)
        ->post(route('timesheets.entries.store'), entryPayload($assignment))
        ->assertRedirect();

    // 11:00–13:00 overlaps 09:30–12:15.
    $this->actingAs($assignment->user)
        ->post(route('timesheets.entries.store'), entryPayload($assignment, ['start_time' => '11:00', 'end_time' => '13:00']))
        ->assertInvalid('start_time');

    // Adjacent 12:15–13:00 is fine.
    $this->actingAs($assignment->user)
        ->post(route('timesheets.entries.store'), entryPayload($assignment, ['start_time' => '12:15', 'end_time' => '13:00']))
        ->assertRedirect();

    expect(TimesheetEntry::count())->toBe(2);
});

it('lets participants edit and delete drafts but not submitted entries', function () {
    $assignment = timesheetAssignment();
    $user = $assignment->user;

    $this->actingAs($user)->post(route('timesheets.entries.store'), entryPayload($assignment));
    $entry = TimesheetEntry::first();

    // Drag/resize-style partial update.
    $this->actingAs($user)
        ->patch(route('timesheets.entries.update', $entry), ['start_time' => '10:00', 'end_time' => '12:00'])
        ->assertRedirect();
    expect($entry->fresh()->durationMinutes())->toBe(120);

    // Submit the week, then edits and deletes are forbidden.
    Carbon::setTestNow('2026-10-07');
    $this->actingAs($user)->post(route('timesheets.submit'), ['week_start' => '2026-10-05'])->assertRedirect();
    expect($entry->fresh()->status)->toBe('submitted');

    $this->actingAs($user)
        ->patch(route('timesheets.entries.update', $entry), ['description' => 'Changed'])
        ->assertForbidden();
    $this->actingAs($user)
        ->delete(route('timesheets.entries.destroy', $entry))
        ->assertForbidden();

    Carbon::setTestNow();
});

it('submits the displayed week and blocks timeless legacy rows', function () {
    $assignment = timesheetAssignment();
    $user = $assignment->user;

    $this->actingAs($user)->post(route('timesheets.entries.store'), entryPayload($assignment));
    $this->actingAs($user)->post(route('timesheets.entries.store'), entryPayload($assignment, [
        'work_date' => '2026-10-07', 'start_time' => '09:00', 'end_time' => '10:00',
    ]));

    // Legacy row without times stays draft and blocks submission.
    $header = Timesheet::first();
    TimesheetEntry::create([
        'timesheet_id' => $header->id,
        'work_date' => '2026-10-08',
        'hours' => 4,
        'description' => 'Legacy import',
        'status' => 'draft',
    ]);

    $this->actingAs($user)
        ->post(route('timesheets.submit'), ['week_start' => '2026-10-05'])
        ->assertInvalid('week');

    TimesheetEntry::whereNull('start_time')->delete();

    $this->actingAs($user)
        ->post(route('timesheets.submit'), ['week_start' => '2026-10-05'])
        ->assertRedirect();

    expect(TimesheetEntry::where('status', 'submitted')->count())->toBe(2)
        ->and($header->fresh()->status)->toBe('submitted')
        ->and((float) $header->fresh()->total_hours)->toBe(3.75);
});

it('lets a project manager approve but never the owner', function () {
    $assignment = timesheetAssignment();
    $owner = $assignment->user;
    $organisationId = $assignment->project->organisation_id;

    $manager = User::factory()->create();
    $manager->markEmailAsVerified();
    OrganisationUser::create(['organisation_id' => $organisationId, 'user_id' => $manager->id, 'role' => 'manager']);

    $this->actingAs($owner)->post(route('timesheets.entries.store'), entryPayload($assignment));
    $entry = TimesheetEntry::first();
    $entry->update(['status' => 'submitted']);

    // Owner cannot approve their own entry.
    $this->actingAs($owner)
        ->post(route('timesheets.entries.approve', $entry))
        ->assertForbidden();

    // Manager approves.
    $this->actingAs($manager)
        ->post(route('timesheets.entries.approve', $entry), ['review_comment' => 'Looks good'])
        ->assertRedirect();

    $entry->refresh();
    expect($entry->status)->toBe('approved')
        ->and($entry->reviewed_by)->toBe($manager->id)
        ->and($entry->review_comment)->toBe('Looks good');
});

it('requires a comment on reject and lets the participant correct and resubmit', function () {
    $assignment = timesheetAssignment();
    $owner = $assignment->user;
    $organisationId = $assignment->project->organisation_id;

    $manager = User::factory()->create();
    $manager->markEmailAsVerified();
    OrganisationUser::create(['organisation_id' => $organisationId, 'user_id' => $manager->id, 'role' => 'manager']);

    $this->actingAs($owner)->post(route('timesheets.entries.store'), entryPayload($assignment));
    $entry = TimesheetEntry::first();
    $entry->update(['status' => 'submitted']);

    $this->actingAs($manager)
        ->post(route('timesheets.entries.reject', $entry))
        ->assertInvalid('review_comment');

    $this->actingAs($manager)
        ->post(route('timesheets.entries.reject', $entry), ['review_comment' => 'Add ticket number'])
        ->assertRedirect();

    expect($entry->fresh()->status)->toBe('rejected');

    // Correcting a rejection flips it back to draft.
    $this->actingAs($owner)
        ->patch(route('timesheets.entries.update', $entry), ['description' => 'Dashboard work (PROJ-123)'])
        ->assertRedirect();

    expect($entry->fresh()->status)->toBe('draft');

    $this->actingAs($owner)
        ->post(route('timesheets.submit'), ['week_start' => '2026-10-05'])
        ->assertRedirect();

    expect($entry->fresh()->status)->toBe('submitted');
});

it('treats active memberships without a role as loggable, like my projects does', function () {
    $user = User::factory()->create();
    $user->markEmailAsVerified();
    $organisation = Organisation::factory()->create();
    $project = Project::factory()->create(['organisation_id' => $organisation->id, 'status' => 'open']);
    $assignment = ProjectParticipant::create([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'role' => null,
        'status' => 'active',
        'joined_at' => now(),
    ]);

    $this->actingAs($user)
        ->post(route('timesheets.entries.store'), entryPayload($assignment))
        ->assertRedirect();

    expect(TimesheetEntry::count())->toBe(1);

    $this->actingAs($user)
        ->get(route('timesheets.index', ['week' => '2026-10-06']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('timesheets/index')
            ->has('assignments', 1)
            ->where('assignments.0.id', $assignment->id)
            ->has('entries', 1));
});

it('renders the current week when no week parameter is given', function () {
    $assignment = timesheetAssignment();
    Carbon::setTestNow('2026-10-07');

    // No ?week= : resolves through now(), which the app configures as
    // CarbonImmutable via the Date facade. Must not 500 on the return type.
    $response = $this->actingAs($assignment->user)->get(route('timesheets.index'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('timesheets/index')
        ->where('week.start', '2026-10-05')
        ->where('week.end', '2026-10-11')
        ->where('week.is_current', true));

    Carbon::setTestNow();
});

it('renders the weekly calendar page with entries, assignments and totals', function () {
    $assignment = timesheetAssignment();
    $user = $assignment->user;

    $this->actingAs($user)->post(route('timesheets.entries.store'), entryPayload($assignment));

    $response = $this->actingAs($user)->get(route('timesheets.index', ['week' => '2026-10-06']));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('timesheets/index')
        ->where('week.start', '2026-10-05')
        ->where('week.end', '2026-10-11')
        ->has('entries', 1)
        ->where('entries.0.minutes', 165)
        ->has('assignments', 1)
        ->where('summary.week_minutes', 165)
        ->where('summary.draft_count', 1));
});
