<?php

use App\Models\Organisation;
use App\Models\Project;
use App\Models\ProjectParticipant;
use App\Models\Timesheet;
use App\Models\TimesheetEntry;
use App\Models\User;
use App\Services\TimesheetService;

/**
 * @return array{org: Organisation, manager: User, member: User, participant: User, project: Project, assignment: ProjectParticipant}
 */
function reviewQueueSetup(?Organisation $org = null): array
{
    $org ??= Organisation::factory()->create();

    $manager = User::factory()->create();
    $org->users()->attach($manager->id, ['role' => 'manager']);

    $member = User::factory()->create();
    $org->users()->attach($member->id, ['role' => 'member']);

    $participant = User::factory()->create();

    $project = Project::factory()->create([
        'organisation_id' => $org->id,
        'status' => 'in_progress',
    ]);

    $assignment = ProjectParticipant::create([
        'project_id' => $project->id,
        'user_id' => $participant->id,
        'role' => 'Developer',
        'status' => 'active',
        'joined_at' => now(),
    ]);

    return compact('org', 'manager', 'member', 'participant', 'project', 'assignment');
}

/**
 * @return array<string, string>
 */
function reviewQueueHeaders(User $user): array
{
    apiForgetGuards();

    return [
        'Authorization' => 'Bearer '.$user->createToken('test-token')->plainTextToken,
        'Accept' => 'application/json',
    ];
}

function reviewSubmittedEntry(ProjectParticipant $assignment, array $overrides = []): TimesheetEntry
{
    $service = app(TimesheetService::class);

    $entry = $service->createEntry($assignment->user, array_merge([
        'project_participant_id' => $assignment->id,
        'work_date' => '2026-10-06',
        'start_time' => '09:00',
        'end_time' => '11:45',
        'description' => 'Queue work',
    ], $overrides));

    return $service->submitEntry($entry);
}

it('lists only the manager organisation submitted entries', function () {
    $setupA = reviewQueueSetup();
    $setupB = reviewQueueSetup();

    $entryA = reviewSubmittedEntry($setupA['assignment']);
    reviewSubmittedEntry($setupB['assignment']);

    // A draft in the same org stays out of the default (submitted) queue.
    app(TimesheetService::class)->createEntry($setupA['participant'], [
        'project_participant_id' => $setupA['assignment']->id,
        'work_date' => '2026-10-07',
        'start_time' => '09:00',
        'end_time' => '10:00',
        'description' => 'Still drafting',
    ]);

    $response = $this->withHeaders(reviewQueueHeaders($setupA['manager']))
        ->getJson('/api/organisation/timesheets');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $entryA->id)
        ->assertJsonPath('data.0.status', 'submitted')
        ->assertJsonPath('data.0.project.id', $setupA['project']->id)
        ->assertJsonPath('data.0.participant.email', $setupA['participant']->email);

    // Explicit status filter honours the queue contract too.
    $this->withHeaders(reviewQueueHeaders($setupA['manager']))
        ->getJson('/api/organisation/timesheets?status=approved')
        ->assertOk()
        ->assertJsonCount(0, 'data');

    // Scoping the queue to the manager's own project works …
    $this->withHeaders(reviewQueueHeaders($setupA['manager']))
        ->getJson("/api/organisation/timesheets?project_id={$setupA['project']->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data');

    // … while another organisation's project resolves to 404 (never leaks).
    $this->withHeaders(reviewQueueHeaders($setupA['manager']))
        ->getJson("/api/organisation/timesheets?project_id={$setupB['project']->id}")
        ->assertNotFound();

    // Date bounds filter the queue by work date.
    $this->withHeaders(reviewQueueHeaders($setupA['manager']))
        ->getJson('/api/organisation/timesheets?from=2026-10-07&to=2026-10-07')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('approves a submitted entry and rolls up header totals', function () {
    $setup = reviewQueueSetup();
    $entry = reviewSubmittedEntry($setup['assignment']);

    $response = $this->withHeaders(reviewQueueHeaders($setup['manager']))
        ->postJson("/api/organisation/timesheets/{$entry->id}/approve", [
            'review_comment' => 'Nicely done.',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.status', 'approved')
        ->assertJsonPath('data.review_comment', 'Nicely done.')
        ->assertJsonPath('data.reviewer.name', $setup['manager']->name);

    expect($entry->fresh()->reviewed_by)->toBe($setup['manager']->id);
    expect($entry->fresh()->reviewed_at)->not->toBeNull();

    // 09:00–11:45 books 2.75h; the single-entry header rolls up to approved.
    $header = Timesheet::find($entry->timesheet_id);
    expect((float) $header->fresh()->total_hours)->toBe(2.75)
        ->and($header->fresh()->status)->toBe('approved');
});

it('approves without a comment', function () {
    $setup = reviewQueueSetup();
    $entry = reviewSubmittedEntry($setup['assignment']);

    $this->withHeaders(reviewQueueHeaders($setup['manager']))
        ->postJson("/api/organisation/timesheets/{$entry->id}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', 'approved')
        ->assertJsonPath('data.review_comment', null);
});

it('forbids owners from approving their own entries', function () {
    $setup = reviewQueueSetup();

    // A manager who also holds an assignment owns this entry.
    $ownAssignment = ProjectParticipant::create([
        'project_id' => $setup['project']->id,
        'user_id' => $setup['manager']->id,
        'role' => 'Lead',
        'status' => 'active',
        'joined_at' => now(),
    ]);
    $ownEntry = reviewSubmittedEntry($ownAssignment);

    $this->withHeaders(reviewQueueHeaders($setup['manager']))
        ->postJson("/api/organisation/timesheets/{$ownEntry->id}/approve")
        ->assertForbidden();

    $this->withHeaders(reviewQueueHeaders($setup['manager']))
        ->postJson("/api/organisation/timesheets/{$ownEntry->id}/reject", [
            'review_comment' => 'Self-review.',
        ])
        ->assertForbidden();

    // The participant owner is no reviewer either.
    $entry = reviewSubmittedEntry($setup['assignment']);

    $this->withHeaders(reviewQueueHeaders($setup['participant']))
        ->postJson("/api/organisation/timesheets/{$entry->id}/approve")
        ->assertForbidden();
});

it('forbids non-managers from reviewing', function () {
    $setup = reviewQueueSetup();
    $entry = reviewSubmittedEntry($setup['assignment']);

    // The queue itself is manager-only.
    $this->withHeaders(reviewQueueHeaders($setup['member']))
        ->getJson('/api/organisation/timesheets')
        ->assertForbidden();

    $this->withHeaders(reviewQueueHeaders($setup['member']))
        ->postJson("/api/organisation/timesheets/{$entry->id}/approve")
        ->assertForbidden();

    $this->withHeaders(reviewQueueHeaders($setup['member']))
        ->postJson("/api/organisation/timesheets/{$entry->id}/reject", [
            'review_comment' => 'Nope.',
        ])
        ->assertForbidden();
});

it('requires a review comment to reject', function () {
    $setup = reviewQueueSetup();
    $entry = reviewSubmittedEntry($setup['assignment']);

    $this->withHeaders(reviewQueueHeaders($setup['manager']))
        ->postJson("/api/organisation/timesheets/{$entry->id}/reject")
        ->assertUnprocessable()
        ->assertJsonValidationErrors('review_comment');

    expect($entry->fresh()->status)->toBe('submitted');

    $this->withHeaders(reviewQueueHeaders($setup['manager']))
        ->postJson("/api/organisation/timesheets/{$entry->id}/reject", [
            'review_comment' => 'Move this to Tuesday and resubmit.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'rejected')
        ->assertJsonPath('data.review_comment', 'Move this to Tuesday and resubmit.');

    expect(Timesheet::find($entry->timesheet_id)->fresh()->status)->toBe('rejected');
});

it('lets participants correct rejected entries back to draft', function () {
    $setup = reviewQueueSetup();
    $entry = reviewSubmittedEntry($setup['assignment']);

    $this->withHeaders(reviewQueueHeaders($setup['manager']))
        ->postJson("/api/organisation/timesheets/{$entry->id}/reject", [
            'review_comment' => 'Wrong date.',
        ])
        ->assertOk();

    // Correcting a rejection flips the entry back to draft …
    $this->withHeaders(reviewQueueHeaders($setup['participant']))
        ->putJson("/api/timesheets/{$entry->id}", ['description' => 'Fixed date'])
        ->assertOk()
        ->assertJsonPath('data.status', 'draft');

    // … so it can be resubmitted for review.
    $this->withHeaders(reviewQueueHeaders($setup['participant']))
        ->postJson("/api/timesheets/{$entry->id}/submit")
        ->assertOk()
        ->assertJsonPath('data.status', 'submitted');
});

it('rejects repeat decisions on decided entries', function () {
    $setup = reviewQueueSetup();
    $approved = reviewSubmittedEntry($setup['assignment']);
    $rejected = reviewSubmittedEntry($setup['assignment'], [
        'work_date' => '2026-10-07', 'start_time' => '13:00', 'end_time' => '14:00',
    ]);

    $manager = reviewQueueHeaders($setup['manager']);
    $this->withHeaders($manager)
        ->postJson("/api/organisation/timesheets/{$approved->id}/approve")
        ->assertOk();
    $this->withHeaders($manager)
        ->postJson("/api/organisation/timesheets/{$rejected->id}/reject", [
            'review_comment' => 'No.',
        ])
        ->assertOk();

    // Approved is terminal for reviewers …
    $this->withHeaders($manager)
        ->postJson("/api/organisation/timesheets/{$approved->id}/approve")
        ->assertForbidden();
    $this->withHeaders($manager)
        ->postJson("/api/organisation/timesheets/{$approved->id}/reject", [
            'review_comment' => 'Changed my mind.',
        ])
        ->assertForbidden();

    // … and so is rejected.
    $this->withHeaders($manager)
        ->postJson("/api/organisation/timesheets/{$rejected->id}/approve")
        ->assertForbidden();
    $this->withHeaders($manager)
        ->postJson("/api/organisation/timesheets/{$rejected->id}/reject", [
            'review_comment' => 'Again.',
        ])
        ->assertForbidden();
});

it('keeps participant and manager tokens on their own endpoints', function () {
    $setup = reviewQueueSetup();
    $entry = reviewSubmittedEntry($setup['assignment']);

    // A participant (no organisation) cannot reach the manager queue at all.
    $this->withHeaders(reviewQueueHeaders($setup['participant']))
        ->getJson('/api/organisation/timesheets')
        ->assertForbidden();

    $this->withHeaders(reviewQueueHeaders($setup['participant']))
        ->postJson("/api/organisation/timesheets/{$entry->id}/reject", [
            'review_comment' => 'Self-reject.',
        ])
        ->assertForbidden();

    // … and a manager cannot act on another participant's entries
    // through the participant endpoints.
    $this->withHeaders(reviewQueueHeaders($setup['manager']))
        ->postJson("/api/timesheets/{$entry->id}/submit")
        ->assertForbidden();

    $this->withHeaders(reviewQueueHeaders($setup['manager']))
        ->putJson("/api/timesheets/{$entry->id}", ['description' => 'Hijacked'])
        ->assertForbidden();
});

it('resolves cross-organisation entries to 404 without leaking them', function () {
    $setupA = reviewQueueSetup();
    $setupB = reviewQueueSetup();
    $entryB = reviewSubmittedEntry($setupB['assignment']);

    $this->withHeaders(reviewQueueHeaders($setupA['manager']))
        ->postJson("/api/organisation/timesheets/{$entryB->id}/approve")
        ->assertNotFound();

    $this->withHeaders(reviewQueueHeaders($setupA['manager']))
        ->postJson("/api/organisation/timesheets/{$entryB->id}/reject", [
            'review_comment' => 'Not mine.',
        ])
        ->assertNotFound();
});
