<?php

use App\Models\Organisation;
use App\Models\ParticipantProfile;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectParticipant;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/**
 * @return array{orgA: Organisation, orgB: Organisation, adminA: User, managerA: User, managerA2: User, participantA: User, outsider: User, adminB: User}
 */
function makeReviewSetup(): array
{
    $orgA = Organisation::factory()->create();
    $orgB = Organisation::factory()->create();

    $adminA = User::factory()->create();
    $adminA->assignRole('technical_admin');
    $orgA->users()->attach($adminA->id, ['role' => 'admin']);

    $managerA = User::factory()->create();
    $managerA->assignRole('project_manager');
    $orgA->users()->attach($managerA->id, ['role' => 'manager']);

    $managerA2 = User::factory()->create();
    $managerA2->assignRole('project_manager');
    $orgA->users()->attach($managerA2->id, ['role' => 'manager']);

    $participantA = User::factory()->create();
    $participantA->assignRole('candidate');
    $orgA->users()->attach($participantA->id, ['role' => 'member']);

    $outsider = User::factory()->create();
    $outsider->assignRole('project_manager');

    $adminB = User::factory()->create();
    $adminB->assignRole('technical_admin');
    $orgB->users()->attach($adminB->id, ['role' => 'admin']);

    return compact('orgA', 'orgB', 'adminA', 'managerA', 'managerA2', 'participantA', 'outsider', 'adminB');
}

/**
 * @return array<string, string>
 */
function reviewHeaders(User $user): array
{
    Auth::forgetGuards();

    return ['Authorization' => 'Bearer '.$user->createToken('test-token')->plainTextToken];
}

function makeApplicant(): User
{
    $user = User::factory()->create();
    $user->assignRole('candidate');

    $profile = ParticipantProfile::create([
        'user_id' => $user->id,
        'first_name' => 'Test',
        'last_name' => 'Applicant',
        'email' => $user->email,
        'id_number' => 'ID-SECRET-123',
        'phone' => '+1-555-9999',
        'city' => 'Amsterdam',
        'country' => 'Netherlands',
        'nationality' => 'Dutch',
        'summary' => str_repeat('Experienced volunteer. ', 5),
    ]);
    Skill::create(['participant_profile_id' => $profile->id, 'name' => 'Mentoring']);

    return $user;
}

function applyTo(Project $project, User $applicant, string $status = ProjectApplication::STATUS_SUBMITTED): ProjectApplication
{
    return ProjectApplication::factory()->create([
        'project_id' => $project->id,
        'user_id' => $applicant->id,
        'status' => $status,
    ]);
}

it('rejects unauthenticated applications access', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $this->getJson("/api/projects/{$project->id}/applications")->assertUnauthorized();
});

it('lets the creator list project applications with applicant details', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $applicant1 = makeApplicant();
    $applicant2 = makeApplicant();
    applyTo($project, $applicant1);
    applyTo($project, $applicant2, ProjectApplication::STATUS_UNDER_REVIEW);

    // Application on another project must not leak in.
    $other = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    applyTo($other, makeApplicant());

    $response = $this->getJson("/api/projects/{$project->id}/applications", reviewHeaders($managerA));

    $response->assertOk()->assertJsonStructure([
        'data' => [[
            'id', 'project_id', 'user_id', 'status', 'cover_letter', 'submitted_at', 'applicant',
        ]],
        'links',
        'meta',
    ]);

    expect($response->json('meta.total'))->toBe(2);

    $byUser = collect($response->json('data'))->keyBy('user_id');
    expect($byUser[$applicant1->id]['status'])->toBe(ProjectApplication::STATUS_SUBMITTED);
    expect($byUser[$applicant2->id]['status'])->toBe(ProjectApplication::STATUS_UNDER_REVIEW);
    expect($byUser[$applicant1->id]['applicant']['email'])->toBe($applicant1->email);
    expect($byUser[$applicant1->id]['applicant']['profile']['skills'][0]['name'])->toBe('Mentoring');

    // Sensitive applicant data must never leak.
    expect($response->getContent())->not->toContain('ID-SECRET-123');
    expect($byUser[$applicant1->id]['applicant'])->not->toHaveKey('password');
});

it('lets technical admins review applications on any organisation project', function () {
    ['orgA' => $orgA, 'adminA' => $adminA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    applyTo($project, makeApplicant());

    $this->getJson("/api/projects/{$project->id}/applications", reviewHeaders($adminA))
        ->assertOk()
        ->assertJsonPath('meta.total', 1);
});

it('forbids participants and outsiders but lets every manager view', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'managerA2' => $managerA2, 'participantA' => $participantA, 'outsider' => $outsider] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    applyTo($project, makeApplicant());

    $uri = "/api/projects/{$project->id}/applications";

    // Any organisation manager (not just the creator) may view the queue.
    $this->getJson($uri, reviewHeaders($managerA2))->assertOk();
    $this->getJson($uri, reviewHeaders($participantA))->assertForbidden();
    $this->getJson($uri, reviewHeaders($outsider))->assertForbidden();
});

it('lets every manager view but only the creator or admin decide', function () {
    ['orgA' => $orgA, 'adminA' => $adminA, 'managerA' => $managerA, 'managerA2' => $managerA2] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    $application = applyTo($project, makeApplicant());

    $uri = "/api/projects/{$project->id}/applications/{$application->id}";

    // Read: another manager may view the detail…
    $this->getJson($uri, reviewHeaders($managerA2))->assertOk();
    // …but deciding stays creator-or-admin-only.
    $this->patchJson($uri, ['status' => 'accepted'], reviewHeaders($managerA2))->assertForbidden();

    // Creator and admin may decide.
    $this->patchJson($uri, ['status' => 'shortlisted'], reviewHeaders($managerA))->assertOk();
    $this->patchJson($uri, ['status' => 'under_review'], reviewHeaders($adminA))->assertOk();
});

it('returns 404 for another organisation project applications', function () {
    ['orgB' => $orgB, 'adminA' => $adminA, 'adminB' => $adminB] = makeReviewSetup();
    $theirs = Project::factory()->create([
        'organisation_id' => $orgB->id,
        'created_by' => $adminB->id,
        'status' => Project::STATUS_OPEN,
    ]);
    applyTo($theirs, makeApplicant());

    $this->getJson("/api/projects/{$theirs->id}/applications", reviewHeaders($adminA))
        ->assertNotFound();
});

it('filters applications by status', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    $shortlisted = makeApplicant();
    applyTo($project, makeApplicant());
    applyTo($project, $shortlisted, ProjectApplication::STATUS_SHORTLISTED);

    $headers = reviewHeaders($managerA);

    $filtered = $this->getJson(
        "/api/projects/{$project->id}/applications?status=shortlisted", $headers
    )->assertOk();

    expect($filtered->json('meta.total'))->toBe(1);
    expect($filtered->json('data.0.user_id'))->toBe($shortlisted->id);

    $this->getJson("/api/projects/{$project->id}/applications?status=bogus", $headers)
        ->assertStatus(422)->assertJsonValidationErrors('status');
});

it('returns an empty list when a project has no applications', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $this->getJson("/api/projects/{$project->id}/applications", reviewHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data', [])
        ->assertJsonPath('meta.total', 0);
});

// ---------------------------------------------------------------------------
// Participants (accepted applicants)
// ---------------------------------------------------------------------------

function addParticipant(Project $project, User $user, string $status = ProjectParticipant::STATUS_ACTIVE): ProjectParticipant
{
    return ProjectParticipant::factory()->create([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'status' => $status,
    ]);
}

it('rejects unauthenticated participants access', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $this->getJson("/api/projects/{$project->id}/participants")->assertUnauthorized();
});

it('lets the creator list project participants with privacy-filtered details', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $member1 = makeApplicant();
    $member2 = makeApplicant();
    addParticipant($project, $member1);
    addParticipant($project, $member2, ProjectParticipant::STATUS_COMPLETED);

    // Participant on another project must not leak in.
    $other = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    addParticipant($other, makeApplicant());

    $response = $this->getJson("/api/projects/{$project->id}/participants", reviewHeaders($managerA));

    $response->assertOk()->assertJsonStructure([
        'data' => [[
            'id', 'project_id', 'user_id', 'role', 'status', 'joined_at', 'participant',
        ]],
        'links',
        'meta',
    ]);

    expect($response->json('meta.total'))->toBe(2);

    $byUser = collect($response->json('data'))->keyBy('user_id');
    expect($byUser[$member1->id]['status'])->toBe(ProjectParticipant::STATUS_ACTIVE);
    expect($byUser[$member2->id]['status'])->toBe(ProjectParticipant::STATUS_COMPLETED);
    expect($byUser[$member1->id]['participant']['email'])->toBe($member1->email);
    expect($byUser[$member1->id]['participant']['profile']['skills'][0]['name'])->toBe('Mentoring');

    // Sensitive applicant data must never leak.
    expect($response->getContent())->not->toContain('ID-SECRET-123');
});

it('filters participants by status and search', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $zara = User::factory()->create(['name' => 'Zara Almeida', 'email' => 'zara@example.com']);
    $zara->assignRole('participant');
    addParticipant($project, $zara);
    addParticipant($project, makeApplicant(), ProjectParticipant::STATUS_WITHDRAWN);

    $headers = reviewHeaders($managerA);

    $byStatus = $this->getJson("/api/projects/{$project->id}/participants?status=active", $headers)->assertOk();
    expect($byStatus->json('meta.total'))->toBe(1);
    expect($byStatus->json('data.0.user_id'))->toBe($zara->id);

    $bySearch = $this->getJson("/api/projects/{$project->id}/participants?search=zara", $headers)->assertOk();
    expect($bySearch->json('meta.total'))->toBe(1);
    expect($bySearch->json('data.0.user_id'))->toBe($zara->id);

    $this->getJson("/api/projects/{$project->id}/participants?status=bogus", $headers)
        ->assertStatus(422)->assertJsonValidationErrors('status');
});

it('forbids participants access for outsiders and returns 404 cross-org', function () {
    ['orgA' => $orgA, 'orgB' => $orgB, 'managerA' => $managerA, 'managerA2' => $managerA2, 'participantA' => $participantA, 'outsider' => $outsider, 'adminA' => $adminA, 'adminB' => $adminB] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    addParticipant($project, makeApplicant());

    $uri = "/api/projects/{$project->id}/participants";

    // Any organisation manager (not just the creator) may view participants.
    $this->getJson($uri, reviewHeaders($managerA2))->assertOk();
    $this->getJson($uri, reviewHeaders($participantA))->assertForbidden();
    $this->getJson($uri, reviewHeaders($outsider))->assertForbidden();

    $theirs = Project::factory()->create([
        'organisation_id' => $orgB->id,
        'created_by' => $adminB->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $this->getJson("/api/projects/{$theirs->id}/participants", reviewHeaders($adminA))
        ->assertNotFound();
});

it('exposes participants on the project detail response', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    $member = makeApplicant();
    addParticipant($project, $member);

    $this->getJson("/api/projects/{$project->id}", reviewHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data.participants_count', 1)
        ->assertJsonPath('data.participants.0.user_id', $member->id)
        ->assertJsonPath('data.participants.0.participant.email', $member->email);
});

// ---------------------------------------------------------------------------
// Assignment (Phase 2)
// ---------------------------------------------------------------------------

it('creates an active but unassigned participant on accept', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    $application = applyTo($project, makeApplicant());

    $this->patchJson(
        "/api/projects/{$project->id}/applications/{$application->id}",
        ['status' => ProjectApplication::STATUS_ACCEPTED],
        reviewHeaders($managerA)
    )->assertOk();

    $participant = ProjectParticipant::where('project_id', $project->id)
        ->where('user_id', $application->user_id)
        ->firstOrFail();

    expect($participant->status)->toBe(ProjectParticipant::STATUS_ACTIVE);
    expect($participant->role)->toBeNull();
    expect($participant->joined_at)->not->toBeNull();
    expect($application->user->hasRole('candidate'))->toBeTrue();
});

it('shows a single participant with full loads', function () {
    ['orgA' => $orgA, 'orgB' => $orgB, 'managerA' => $managerA, 'participantA' => $participantA, 'adminA' => $adminA, 'adminB' => $adminB] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    $member = makeApplicant();
    $participant = addParticipant($project, $member);

    $this->getJson("/api/projects/{$project->id}/participants/{$participant->id}", reviewHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data.id', $participant->id)
        ->assertJsonPath('data.participant.id', $member->id)
        ->assertJsonStructure(['data' => ['role', 'team', 'start_date', 'end_date', 'work_location', 'working_hours', 'notes', 'status', 'participant', 'application', 'project']]);

    $this->getJson("/api/projects/{$project->id}/participants/{$participant->id}", reviewHeaders($participantA))->assertForbidden();

    $theirs = Project::factory()->create([
        'organisation_id' => $orgB->id,
        'created_by' => $adminB->id,
        'status' => Project::STATUS_OPEN,
    ]);
    $foreign = ProjectParticipant::factory()->create(['project_id' => $theirs->id]);

    $this->getJson("/api/projects/{$project->id}/participants/{$foreign->id}", reviewHeaders($managerA))->assertNotFound();
    $this->getJson("/api/projects/{$theirs->id}/participants/{$foreign->id}", reviewHeaders($adminA))->assertNotFound();
});

it('assigns an unassigned participant and edits in place without new rows', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'participantA' => $participantA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    $participant = ProjectParticipant::factory()->create([
        'project_id' => $project->id,
        'role' => null,
        'status' => ProjectParticipant::STATUS_ACTIVE,
    ]);
    $participant->user->assignRole(Role::findByName('candidate', 'web'));

    $uri = "/api/projects/{$project->id}/participants/{$participant->id}";
    $headers = reviewHeaders($managerA);

    // Role is required when the member has none yet.
    $this->patchJson($uri, ['team' => 'Alpha'], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('role');

    // Status cannot be sent via PATCH.
    $this->patchJson($uri, ['role' => 'Mentor', 'status' => 'active'], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('status');

    // Date sanity.
    $this->patchJson($uri, ['role' => 'Mentor', 'start_date' => '2026-11-01', 'end_date' => '2026-10-01'], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('end_date');

    // First assignment fills the role; status stays active.
    $this->patchJson($uri, [
        'role' => 'Mentor',
        'team' => 'Alpha',
        'start_date' => '2026-10-01',
        'end_date' => '2026-12-31',
        'work_location' => 'Amsterdam',
        'working_hours' => '8h/week',
        'notes' => 'Onboard Monday.',
    ], $headers)
        ->assertOk()
        ->assertJsonPath('data.status', ProjectParticipant::STATUS_ACTIVE)
        ->assertJsonPath('data.role', 'Mentor')
        ->assertJsonPath('data.team', 'Alpha')
        ->assertJsonPath('message', 'Assignment updated.');

    expect($participant->user->fresh()->hasRole('participant'))->toBeTrue();

    expect(ProjectParticipant::where('project_id', $project->id)->count())->toBe(1);

    // Subsequent edit updates in place.
    $this->patchJson($uri, ['team' => 'Beta'], $headers)
        ->assertOk()
        ->assertJsonPath('data.status', ProjectParticipant::STATUS_ACTIVE)
        ->assertJsonPath('data.team', 'Beta')
        ->assertJsonPath('data.role', 'Mentor');

    // Participants cannot edit.
    $this->patchJson($uri, ['team' => 'Gamma'], reviewHeaders($participantA))->assertForbidden();
});

it('rejects a second active project assignment for the same user', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $projectA = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_IN_PROGRESS,
    ]);
    $projectB = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_IN_PROGRESS,
    ]);
    $user = makeApplicant();
    $activeAssignment = ProjectParticipant::factory()->create([
        'project_id' => $projectA->id,
        'user_id' => $user->id,
        'role' => 'Mentor',
    ]);
    $user->syncProjectParticipationRole();
    $unassigned = ProjectParticipant::factory()->create([
        'project_id' => $projectB->id,
        'user_id' => $user->id,
        'role' => null,
    ]);

    $this->patchJson(
        "/api/projects/{$projectB->id}/participants/{$unassigned->id}",
        ['role' => 'Developer'],
        reviewHeaders($managerA),
    )->assertUnprocessable()->assertJsonValidationErrors('role');

    expect($user->fresh()->hasRole('participant'))->toBeTrue();
    expect($activeAssignment->fresh()->role)->toBe('Mentor');
    expect($unassigned->fresh()->role)->toBeNull();
});

it('enforces the participant status lifecycle', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    $headers = reviewHeaders($managerA);

    $make = function (string $status) use ($project): ProjectParticipant {
        $participant = ProjectParticipant::factory()->create([
            'project_id' => $project->id,
            'status' => $status,
        ]);
        $participant->user->assignRole(Role::findByName(
            $status === ProjectParticipant::STATUS_ACTIVE ? 'participant' : 'candidate',
            'web',
        ));

        return $participant;
    };
    $url = fn (ProjectParticipant $p) => "/api/projects/{$project->id}/participants/{$p->id}/status";

    // Legal moves: active → completed, active → withdrawn.
    $participant = $make(ProjectParticipant::STATUS_ACTIVE);
    $this->postJson($url($participant), ['status' => 'completed'], $headers)->assertOk()->assertJsonPath('data.status', 'completed');
    expect($participant->user->fresh()->hasRole('candidate'))->toBeTrue();

    $participant = $make(ProjectParticipant::STATUS_ACTIVE);
    $this->postJson($url($participant), ['status' => 'withdrawn'], $headers)->assertOk()->assertJsonPath('data.status', 'withdrawn');
    expect($participant->user->fresh()->hasRole('candidate'))->toBeTrue();

    // Terminal states reject every move.
    foreach ([ProjectParticipant::STATUS_COMPLETED, ProjectParticipant::STATUS_WITHDRAWN] as $terminal) {
        $this->postJson($url($make($terminal)), ['status' => 'completed'], $headers)
            ->assertStatus(422)->assertJsonValidationErrors('status');
    }

    // Bogus status fails validation, not transition logic.
    $this->postJson($url($make(ProjectParticipant::STATUS_ACTIVE)), ['status' => 'bogus'], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('status');
});

it('lists distinct roles and filters the index by role', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    addParticipant($project, makeApplicant())->update(['role' => 'Mentor']);
    addParticipant($project, makeApplicant())->update(['role' => 'Developer']);

    $headers = reviewHeaders($managerA);

    $roles = $this->getJson("/api/projects/{$project->id}/roles", $headers)->assertOk();
    expect($roles->json('data'))->toEqualCanonicalizing(['Developer', 'Mentor']);

    $filtered = $this->getJson("/api/projects/{$project->id}/participants?role=Mentor", $headers)->assertOk();
    expect($filtered->json('meta.total'))->toBe(1);
    expect($filtered->json('data.0.role'))->toBe('Mentor');
});

it('lists active participants without duplicates', function () {
    ['orgA' => $orgA, 'orgB' => $orgB, 'managerA' => $managerA, 'participantA' => $participantA] = makeReviewSetup();
    $member = makeApplicant();
    $member->removeRole(Role::findByName('candidate', 'web'));
    $member->assignRole(Role::findByName('participant', 'web'));
    $orgA->users()->attach($member->id, ['role' => 'member']);
    $foreign = makeApplicant();
    $foreign->removeRole(Role::findByName('candidate', 'web'));
    $foreign->assignRole(Role::findByName('participant', 'web'));
    $orgB->users()->attach($foreign->id, ['role' => 'member']);
    $memberProject = Project::factory()->create(['organisation_id' => $orgA->id, 'created_by' => $managerA->id]);
    addParticipant($memberProject, $member);
    $foreignProject = Project::factory()->create(['organisation_id' => $orgB->id]);
    addParticipant($foreignProject, $foreign);
    $unaffiliated = User::factory()->create();
    $unaffiliated->assignRole(Role::findByName('candidate', 'web'));
    $headers = reviewHeaders($managerA);
    $response = $this->getJson('/api/participants', $headers)
        ->assertOk()->assertJsonPath('meta.total', 2);
    expect(array_column($response->json('data'), 'id'))->toEqualCanonicalizing([$member->id, $foreign->id]);
    $this->getJson('/api/participants?search='.urlencode($member->email), $headers)
        ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.id', $member->id)
        ->assertJsonMissingPath('data.0.profile.id_number');
    $this->getJson('/api/participants?search=Applicant', $headers)
        ->assertOk()->assertJsonPath('meta.total', 2);
    $this->getJson('/api/participants?search[]=invalid', $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('search');
});

it('authorises participant user routes and restricts details to participant roles', function () {
    ['orgA' => $orgA, 'orgB' => $orgB, 'managerA' => $managerA, 'participantA' => $participantA, 'outsider' => $outsider] = makeReviewSetup();
    $member = makeApplicant();
    $member->removeRole(Role::findByName('candidate', 'web'));
    $member->assignRole(Role::findByName('participant', 'web'));
    $orgA->users()->attach($member->id, ['role' => 'member']);
    $foreign = makeApplicant();
    $foreign->removeRole(Role::findByName('candidate', 'web'));
    $foreign->assignRole(Role::findByName('participant', 'web'));
    $orgB->users()->attach($foreign->id, ['role' => 'member']);
    addParticipant(Project::factory()->create(['organisation_id' => $orgA->id]), $member);
    addParticipant(Project::factory()->create(['organisation_id' => $orgB->id]), $foreign);
    $uri = "/api/participants/{$member->id}";

    $this->getJson('/api/participants')->assertUnauthorized();
    $this->getJson($uri)->assertUnauthorized();
    $headers = reviewHeaders($managerA);
    $this->getJson($uri, $headers)
        ->assertOk()->assertJsonPath('data.id', $member->id)
        ->assertJsonStructure(['data' => ['name', 'email', 'profile' => ['skills', 'educations', 'work_experiences', 'certifications']]])
        ->assertJsonMissingPath('data.profile.id_number');
    $this->getJson("/api/participants/{$participantA->id}", $headers)
        ->assertNotFound();
    $this->getJson("/api/participants/{$foreign->id}", $headers)
        ->assertOk()->assertJsonPath('data.id', $foreign->id);
    $unaffiliated = User::factory()->create();
    $unaffiliated->assignRole(Role::findByName('candidate', 'web'));
    $this->getJson("/api/participants/{$unaffiliated->id}", $headers)
        ->assertNotFound();
    $this->getJson("/api/participants/{$managerA->id}", $headers)->assertNotFound();
    foreach ([$participantA, $outsider] as $user) {
        $this->getJson('/api/participants', reviewHeaders($user))->assertForbidden();
        $this->getJson($uri, reviewHeaders($user))->assertForbidden();
    }
});
