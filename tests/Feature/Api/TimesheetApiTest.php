<?php

use App\Models\Organisation;
use App\Models\Project;
use App\Models\ProjectParticipant;
use App\Models\TimesheetEntry;
use App\Models\User;

function apiTimesheetAssignment(?User $forUser = null, array $projectAttrs = []): ProjectParticipant
{
    $user = $forUser ?? User::factory()->create();
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

/**
 * @return array<string, string>
 */
function apiTimesheetHeaders(User $user): array
{
    return [
        'Authorization' => 'Bearer '.$user->createToken('test-token')->plainTextToken,
        'Accept' => 'application/json',
    ];
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function apiEntryPayload(ProjectParticipant $assignment, array $overrides = []): array
{
    return array_merge([
        'project_participant_id' => $assignment->id,
        'work_date' => '2026-10-06',
        'start_time' => '09:30',
        'end_time' => '12:15',
        'description' => 'Dashboard work',
    ], $overrides);
}

/*
 | The sanctum guard memoizes the first Bearer-authenticated user on the
 | shared test app instance, so requests switching users must forget
 | guards first. Real HTTP traffic boots a fresh app per request and is
 | unaffected — this is purely a test-isolation helper.
 */
function apiForgetGuards(): void
{
    app('auth')->forgetGuards();
}

it('creates a timesheet entry through the api with server-computed duration', function () {
    $assignment = apiTimesheetAssignment();

    $response = $this->withHeaders(apiTimesheetHeaders($assignment->user))
        ->postJson('/api/timesheets', apiEntryPayload($assignment));

    $response->assertCreated()
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonPath('data.minutes', 165)
        ->assertJsonPath('data.project.id', $assignment->project->id);

    expect(TimesheetEntry::count())->toBe(1);
});

it('rejects api entries on assignments the participant does not own', function () {
    $mine = apiTimesheetAssignment();
    $theirs = apiTimesheetAssignment();

    $this->withHeaders(apiTimesheetHeaders($mine->user))
        ->postJson('/api/timesheets', apiEntryPayload($theirs))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('project_participant_id');

    expect(TimesheetEntry::count())->toBe(0);
});

it('rejects api entries with an invalid time range or missing description', function () {
    $assignment = apiTimesheetAssignment();
    $headers = apiTimesheetHeaders($assignment->user);

    $this->withHeaders($headers)
        ->postJson('/api/timesheets', apiEntryPayload($assignment, ['start_time' => '14:00', 'end_time' => '12:00']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('end_time');

    $this->withHeaders($headers)
        ->postJson('/api/timesheets', apiEntryPayload($assignment, ['description' => '']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('description');

    expect(TimesheetEntry::count())->toBe(0);
});

it('lists only the authenticated participant entries inside the requested range', function () {
    $mine = apiTimesheetAssignment();
    $theirs = apiTimesheetAssignment();

    apiForgetGuards();
    $this->withHeaders(apiTimesheetHeaders($mine->user))
        ->postJson('/api/timesheets', apiEntryPayload($mine));
    apiForgetGuards();
    $this->withHeaders(apiTimesheetHeaders($theirs->user))
        ->postJson('/api/timesheets', apiEntryPayload($theirs, ['work_date' => '2026-10-07']));

    // In-range: only my entry.
    apiForgetGuards();
    $this->withHeaders(apiTimesheetHeaders($mine->user))
        ->getJson('/api/timesheets?from=2026-10-05&to=2026-10-11')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.description', 'Dashboard work');

    // Out-of-range week: empty, not an error.
    apiForgetGuards();
    $this->withHeaders(apiTimesheetHeaders($mine->user))
        ->getJson('/api/timesheets?from=2026-10-12&to=2026-10-18')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('forbids reading another participant entry through the api', function () {
    $mine = apiTimesheetAssignment();
    $theirs = apiTimesheetAssignment();

    apiForgetGuards();
    $this->withHeaders(apiTimesheetHeaders($theirs->user))
        ->postJson('/api/timesheets', apiEntryPayload($theirs));
    $theirEntry = TimesheetEntry::first();

    // Neither view nor update nor delete may cross the ownership boundary.
    apiForgetGuards();
    $this->withHeaders(apiTimesheetHeaders($mine->user))
        ->getJson("/api/timesheets/{$theirEntry->id}")
        ->assertForbidden();

    apiForgetGuards();
    $this->withHeaders(apiTimesheetHeaders($mine->user))
        ->putJson("/api/timesheets/{$theirEntry->id}", ['description' => 'Hijacked'])
        ->assertForbidden();

    apiForgetGuards();
    $this->withHeaders(apiTimesheetHeaders($mine->user))
        ->deleteJson("/api/timesheets/{$theirEntry->id}")
        ->assertForbidden();
});

it('lets participants edit and delete drafts but locks submitted entries', function () {
    $assignment = apiTimesheetAssignment();
    $headers = apiTimesheetHeaders($assignment->user);

    $id = $this->withHeaders($headers)
        ->postJson('/api/timesheets', apiEntryPayload($assignment))
        ->assertCreated()
        ->json('data.id');

    // Drag/resize-style partial update.
    $this->withHeaders($headers)
        ->putJson("/api/timesheets/{$id}", ['start_time' => '10:00', 'end_time' => '12:00'])
        ->assertOk()
        ->assertJsonPath('data.minutes', 120);

    // Submit, then the entry is read-only.
    $this->withHeaders($headers)
        ->postJson("/api/timesheets/{$id}/submit")
        ->assertOk()
        ->assertJsonPath('data.status', 'submitted');

    $this->withHeaders($headers)
        ->putJson("/api/timesheets/{$id}", ['description' => 'Changed'])
        ->assertForbidden();

    $this->withHeaders($headers)
        ->deleteJson("/api/timesheets/{$id}")
        ->assertForbidden();

    // Resubmitting a submitted entry is rejected.
    $this->withHeaders($headers)
        ->postJson("/api/timesheets/{$id}/submit")
        ->assertForbidden();
});

it('deletes a draft entry through the api', function () {
    $assignment = apiTimesheetAssignment();
    $headers = apiTimesheetHeaders($assignment->user);

    $id = $this->withHeaders($headers)
        ->postJson('/api/timesheets', apiEntryPayload($assignment))
        ->json('data.id');

    $this->withHeaders($headers)
        ->deleteJson("/api/timesheets/{$id}")
        ->assertOk();

    expect(TimesheetEntry::count())->toBe(0);
});

it('returns a server-computed weekly summary through the api', function () {
    $assignment = apiTimesheetAssignment();
    $headers = apiTimesheetHeaders($assignment->user);

    $this->withHeaders($headers)
        ->postJson('/api/timesheets', apiEntryPayload($assignment));
    $this->withHeaders($headers)
        ->postJson('/api/timesheets', apiEntryPayload($assignment, [
            'work_date' => '2026-10-07', 'start_time' => '09:00', 'end_time' => '10:00',
        ]));

    $this->withHeaders($headers)
        ->getJson('/api/timesheets/summary?from=2026-10-05&to=2026-10-11')
        ->assertOk()
        ->assertJsonPath('data.week_minutes', 225)
        ->assertJsonPath('data.total_entries', 2)
        ->assertJsonPath('data.draft_count', 2)
        ->assertJsonPath('data.by_day.2026-10-06', 165)
        ->assertJsonPath('data.by_day.2026-10-07', 60);
});

it('submits the whole week through the api', function () {
    $assignment = apiTimesheetAssignment();
    $headers = apiTimesheetHeaders($assignment->user);

    $this->withHeaders($headers)
        ->postJson('/api/timesheets', apiEntryPayload($assignment));

    $this->withHeaders($headers)
        ->postJson('/api/timesheets/submit', ['week_start' => '2026-10-05'])
        ->assertOk()
        ->assertJsonPath('submitted_count', 1);

    expect(TimesheetEntry::first()->status)->toBe('submitted');
});
