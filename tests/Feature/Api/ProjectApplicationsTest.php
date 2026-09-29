<?php

use App\Models\Organisation;
use App\Models\ParticipantProfile;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Auth;

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
    $participantA->assignRole('participant');
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
    $user->assignRole('participant');

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

it('forbids other project managers, participants and outsiders', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'managerA2' => $managerA2, 'participantA' => $participantA, 'outsider' => $outsider] = makeReviewSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);
    applyTo($project, makeApplicant());

    $uri = "/api/projects/{$project->id}/applications";

    $this->getJson($uri, reviewHeaders($managerA2))->assertForbidden();
    $this->getJson($uri, reviewHeaders($participantA))->assertForbidden();
    $this->getJson($uri, reviewHeaders($outsider))->assertForbidden();
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
