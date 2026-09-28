<?php

use App\Models\Organisation;
use App\Models\ParticipantProfile;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/**
 * @return array{orgA: Organisation, orgB: Organisation, adminA: User, managerA: User, managerA2: User, participantA: User, outsider: User, adminB: User}
 */
function makeProjectSetup(): array
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
function projectHeaders(User $user): array
{
    return ['Authorization' => 'Bearer '.$user->createToken('test-token')->plainTextToken];
}

function makeCatalogueSkill(string $name = 'First Aid'): Skill
{
    $user = User::factory()->create();
    $profile = ParticipantProfile::create([
        'user_id' => $user->id,
        'first_name' => 'Skill',
        'last_name' => 'Owner',
        'email' => $user->email,
    ]);

    return Skill::create(['participant_profile_id' => $profile->id, 'name' => $name]);
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validProjectPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Community Garden Revival',
        'description' => 'Wheelchair-accessible raised beds and a composting system.',
        'location' => 'Amsterdam',
        'start_date' => '2026-10-01',
        'end_date' => '2026-12-31',
        'positions' => 5,
    ], $overrides);
}

function makeOrgProject(Organisation $org, User $creator, string $status = Project::STATUS_DRAFT): Project
{
    return Project::factory()->create([
        'organisation_id' => $org->id,
        'created_by' => $creator->id,
        'status' => $status,
    ]);
}

// ---------------------------------------------------------------------------
// Access
// ---------------------------------------------------------------------------

it('rejects unauthenticated project access', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA);

    $this->getJson('/api/projects')->assertUnauthorized();
    $this->postJson('/api/projects', validProjectPayload())->assertUnauthorized();
    $this->getJson("/api/projects/{$project->id}")->assertUnauthorized();
    $this->putJson("/api/projects/{$project->id}", ['title' => 'Nope'])->assertUnauthorized();
    $this->deleteJson("/api/projects/{$project->id}", [], [])->assertUnauthorized();
    $this->postJson("/api/projects/{$project->id}/publish")->assertUnauthorized();
});

it('lists only projects belonging to the authenticated organisation', function () {
    ['orgA' => $orgA, 'orgB' => $orgB, 'adminA' => $adminA, 'managerA' => $managerA, 'adminB' => $adminB] = makeProjectSetup();

    $mine1 = makeOrgProject($orgA, $managerA);
    $mine2 = makeOrgProject($orgA, $adminA, Project::STATUS_OPEN);
    $theirs = makeOrgProject($orgB, $adminB, Project::STATUS_OPEN);

    $response = $this->getJson('/api/projects', projectHeaders($adminA));

    $response->assertOk()->assertJsonStructure(['data', 'links', 'meta']);

    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($mine1->id, $mine2->id)
        ->and($ids)->not->toContain($theirs->id);
    expect($response->json('meta.total'))->toBe(2);
});

it('returns 404 for another organisation project by ID', function () {
    ['orgB' => $orgB, 'adminA' => $adminA, 'adminB' => $adminB] = makeProjectSetup();
    $theirs = makeOrgProject($orgB, $adminB);
    $headers = projectHeaders($adminA);

    $this->getJson("/api/projects/{$theirs->id}", $headers)->assertNotFound();
    $this->putJson("/api/projects/{$theirs->id}", ['title' => 'Hijacked'], $headers)->assertNotFound();
    $this->deleteJson("/api/projects/{$theirs->id}", [], $headers)->assertNotFound();
    $this->postJson("/api/projects/{$theirs->id}/publish", [], $headers)->assertNotFound();
});

it('denies participants and outsiders project access', function () {
    ['participantA' => $participantA, 'outsider' => $outsider] = makeProjectSetup();

    $this->getJson('/api/projects', projectHeaders($participantA))->assertForbidden();
    $this->postJson('/api/projects', validProjectPayload(), projectHeaders($participantA))->assertForbidden();
    $this->getJson('/api/projects', projectHeaders($outsider))->assertForbidden();
});

it('filters projects by status, search, manager and dates', function () {
    ['orgA' => $orgA, 'adminA' => $adminA, 'managerA' => $managerA, 'managerA2' => $managerA2] = makeProjectSetup();
    $headers = projectHeaders($adminA);

    $open = Project::factory()->create([
        'organisation_id' => $orgA->id, 'created_by' => $managerA->id,
        'title' => 'River Cleanup Crew', 'status' => Project::STATUS_OPEN,
        'start_date' => '2026-10-01', 'end_date' => '2026-12-31',
    ]);
    $draft = Project::factory()->create([
        'organisation_id' => $orgA->id, 'created_by' => $managerA2->id,
        'title' => 'Winter Garden Workshop', 'status' => Project::STATUS_DRAFT,
        'start_date' => '2027-01-15', 'end_date' => '2027-03-01',
    ]);

    $byStatus = $this->getJson('/api/projects?status=open', $headers)->assertOk();
    expect(collect($byStatus->json('data'))->pluck('id'))->toContain($open->id)->not->toContain($draft->id);

    $bySearch = $this->getJson('/api/projects?search=cleanup', $headers)->assertOk();
    expect(collect($bySearch->json('data'))->pluck('id'))->toContain($open->id)->not->toContain($draft->id);

    $byManager = $this->getJson("/api/projects?project_manager={$managerA2->id}", $headers)->assertOk();
    expect(collect($byManager->json('data'))->pluck('id'))->toContain($draft->id)->not->toContain($open->id);

    $byStart = $this->getJson('/api/projects?start_date=2027-01-01', $headers)->assertOk();
    expect(collect($byStart->json('data'))->pluck('id'))->toContain($draft->id)->not->toContain($open->id);

    $byEnd = $this->getJson('/api/projects?end_date=2026-12-31', $headers)->assertOk();
    expect(collect($byEnd->json('data'))->pluck('id'))->toContain($open->id)->not->toContain($draft->id);
});

// ---------------------------------------------------------------------------
// Creation
// ---------------------------------------------------------------------------

it('creates a draft project for the authenticated organisation', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $skill = makeCatalogueSkill();

    $response = $this->postJson('/api/projects', validProjectPayload([
        'skill_ids' => [$skill->id],
    ]), projectHeaders($managerA));

    $response->assertCreated()
        ->assertJsonPath('data.title', 'Community Garden Revival')
        ->assertJsonPath('data.status', Project::STATUS_DRAFT)
        ->assertJsonPath('data.organisation_id', $orgA->id)
        ->assertJsonPath('data.positions', 5)
        ->assertJsonPath('data.creator.id', $managerA->id)
        ->assertJsonPath('data.creator.name', $managerA->name)
        ->assertJsonPath('message', 'Project created.');

    expect($response->json('data.skills'))->toContain('First Aid');

    $this->assertDatabaseHas('projects', [
        'title' => 'Community Garden Revival',
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_DRAFT,
    ]);
});

it('lets a technical admin assign another manager on creation', function () {
    ['adminA' => $adminA, 'managerA2' => $managerA2] = makeProjectSetup();

    $response = $this->postJson('/api/projects', validProjectPayload([
        'project_manager_id' => $managerA2->id,
    ]), projectHeaders($adminA));

    $response->assertCreated()->assertJsonPath('data.creator.id', $managerA2->id);
});

it('rejects invalid project data', function () {
    ['managerA' => $managerA, 'adminB' => $adminB, 'participantA' => $participantA] = makeProjectSetup();
    $headers = projectHeaders($managerA);

    $this->postJson('/api/projects', validProjectPayload(['title' => null]), $headers)
        ->assertStatus(422)->assertJsonValidationErrors('title');

    $this->postJson('/api/projects', validProjectPayload([
        'start_date' => '2026-12-31', 'end_date' => '2026-10-01',
    ]), $headers)->assertStatus(422)->assertJsonValidationErrors('end_date');

    $this->postJson('/api/projects', validProjectPayload(['positions' => 0]), $headers)
        ->assertStatus(422)->assertJsonValidationErrors('positions');

    $this->postJson('/api/projects', validProjectPayload(['skill_ids' => [999999]]), $headers)
        ->assertStatus(422)->assertJsonValidationErrors('skill_ids.0');

    $this->postJson('/api/projects', validProjectPayload(['status' => 'open']), $headers)
        ->assertStatus(422)->assertJsonValidationErrors('status');

    $this->postJson('/api/projects', validProjectPayload(['project_manager_id' => $adminB->id]), $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project_manager_id');

    $this->postJson('/api/projects', validProjectPayload(['project_manager_id' => $participantA->id]), $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project_manager_id');
});

// ---------------------------------------------------------------------------
// Updating
// ---------------------------------------------------------------------------

it('lets the creator and technical admins update a project', function () {
    ['orgA' => $orgA, 'adminA' => $adminA, 'managerA' => $managerA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA);

    $this->putJson("/api/projects/{$project->id}", [
        'title' => 'Renamed by creator',
        'positions' => 8,
    ], projectHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data.title', 'Renamed by creator')
        ->assertJsonPath('data.positions', 8)
        ->assertJsonPath('message', 'Project updated.');

    $this->putJson("/api/projects/{$project->id}", [
        'title' => 'Renamed by admin',
    ], projectHeaders($adminA))->assertOk();

    expect($project->fresh()->title)->toBe('Renamed by admin');
});

it('forbids other project managers from updating a project', function () {
    ['managerA' => $managerA, 'managerA2' => $managerA2] = makeProjectSetup();
    $project = makeOrgProject($managerA->currentOrganisation(), $managerA);

    $this->putJson("/api/projects/{$project->id}", ['title' => 'Hijacked'], projectHeaders($managerA2))
        ->assertForbidden();

    expect($project->fresh()->title)->not->toBe('Hijacked');
});

it('rejects invalid updates and immutable fields', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA);
    $headers = projectHeaders($managerA);

    $this->putJson("/api/projects/{$project->id}", [
        'start_date' => '2026-12-31', 'end_date' => '2026-10-01',
    ], $headers)->assertStatus(422)->assertJsonValidationErrors('end_date');

    $this->putJson("/api/projects/{$project->id}", ['status' => 'open'], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('status');
});

it('rejects updates to closed and archived projects', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $headers = projectHeaders($managerA);

    $closed = makeOrgProject($orgA, $managerA, Project::STATUS_COMPLETED);
    $this->putJson("/api/projects/{$closed->id}", ['title' => 'Too late'], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project');

    $archived = makeOrgProject($orgA, $managerA, Project::STATUS_ARCHIVED);
    $this->putJson("/api/projects/{$archived->id}", ['title' => 'Too late'], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project');
});

it('shows a single project with manager, skills and counts', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $skill = makeCatalogueSkill('Mentoring');
    $project = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $project->skills()->sync([$skill->id]);

    $this->getJson("/api/projects/{$project->id}", projectHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data.id', $project->id)
        ->assertJsonPath('data.organisation_id', $orgA->id)
        ->assertJsonPath('data.creator.id', $managerA->id)
        ->assertJsonPath('data.applications_count', 0)
        ->assertJsonPath('data.participants_count', 0);

    expect($this->getJson("/api/projects/{$project->id}", projectHeaders($managerA))->json('data.skills'))
        ->toContain('Mentoring');
});

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

it('publishes a complete draft project', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $project = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_DRAFT,
        'description' => 'Ready to publish.',
        'start_date' => '2026-10-01',
        'end_date' => '2026-12-31',
    ]);

    $this->postJson("/api/projects/{$project->id}/publish", [], projectHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data.status', Project::STATUS_OPEN)
        ->assertJsonPath('message', 'Project published.');

    expect($project->fresh()->status)->toBe(Project::STATUS_OPEN);
});

it('refuses to publish incomplete or non-draft projects', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $headers = projectHeaders($managerA);

    $incomplete = Project::factory()->create([
        'organisation_id' => $orgA->id,
        'created_by' => $managerA->id,
        'status' => Project::STATUS_DRAFT,
        'description' => null,
        'start_date' => null,
        'end_date' => null,
    ]);
    $this->postJson("/api/projects/{$incomplete->id}/publish", [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project');

    $open = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $this->postJson("/api/projects/{$open->id}/publish", [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project');
});

it('unpublishes an open project without active applications', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $headers = projectHeaders($managerA);

    $project = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $this->postJson("/api/projects/{$project->id}/unpublish", [], $headers)
        ->assertOk()
        ->assertJsonPath('data.status', Project::STATUS_DRAFT);

    $draft = makeOrgProject($orgA, $managerA);
    $this->postJson("/api/projects/{$draft->id}/unpublish", [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project');
});

it('blocks unpublishing when active applications exist', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $headers = projectHeaders($managerA);

    $withActive = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    ProjectApplication::factory()->create([
        'project_id' => $withActive->id,
        'user_id' => User::factory()->create()->id,
        'status' => ProjectApplication::STATUS_SUBMITTED,
    ]);
    $this->postJson("/api/projects/{$withActive->id}/unpublish", [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project');

    $withdrawnOnly = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    ProjectApplication::factory()->create([
        'project_id' => $withdrawnOnly->id,
        'user_id' => User::factory()->create()->id,
        'status' => ProjectApplication::STATUS_WITHDRAWN,
    ]);
    $this->postJson("/api/projects/{$withdrawnOnly->id}/unpublish", [], $headers)
        ->assertOk()->assertJsonPath('data.status', Project::STATUS_DRAFT);
});

it('closes open projects and rejects invalid closes', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $headers = projectHeaders($managerA);

    $open = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $this->postJson("/api/projects/{$open->id}/close", [], $headers)
        ->assertOk()
        ->assertJsonPath('data.status', Project::STATUS_COMPLETED)
        ->assertJsonPath('message', 'Project closed.');

    $draft = makeOrgProject($orgA, $managerA);
    $this->postJson("/api/projects/{$draft->id}/close", [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project');
});

it('archives completed projects and lists them by status', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'adminA' => $adminA] = makeProjectSetup();

    $completed = makeOrgProject($orgA, $managerA, Project::STATUS_COMPLETED);
    $this->postJson("/api/projects/{$completed->id}/archive", [], projectHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data.status', Project::STATUS_ARCHIVED)
        ->assertJsonPath('message', 'Project archived.');

    expect($completed->fresh()->status)->toBe(Project::STATUS_ARCHIVED);

    $open = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $this->postJson("/api/projects/{$open->id}/archive", [], projectHeaders($managerA))
        ->assertStatus(422)->assertJsonValidationErrors('project');

    $listed = $this->getJson('/api/projects?status=archived', projectHeaders($adminA))->assertOk();
    expect(collect($listed->json('data'))->pluck('id'))
        ->toContain($completed->id)->not->toContain($open->id);
});

it('forbids unauthorised lifecycle transitions', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'managerA2' => $managerA2] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA);

    $this->postJson("/api/projects/{$project->id}/publish", [], projectHeaders($managerA2))
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// Deletion
// ---------------------------------------------------------------------------

it('deletes draft projects', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $skill = makeCatalogueSkill();
    $project = makeOrgProject($orgA, $managerA);
    $project->skills()->sync([$skill->id]);

    $this->deleteJson("/api/projects/{$project->id}", [], projectHeaders($managerA))
        ->assertOk()->assertJsonPath('message', 'Project deleted.');

    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    $this->assertDatabaseMissing('project_skill', ['project_id' => $project->id]);
});

it('refuses to delete non-draft projects', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $headers = projectHeaders($managerA);

    $open = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $this->deleteJson("/api/projects/{$open->id}", [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('project');

    expect($open->fresh())->not->toBeNull();
});

it('forbids unauthorised deletion', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'managerA2' => $managerA2, 'participantA' => $participantA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA);

    $this->deleteJson("/api/projects/{$project->id}", [], projectHeaders($managerA2))->assertForbidden();
    $this->deleteJson("/api/projects/{$project->id}", [], projectHeaders($participantA))->assertForbidden();

    expect($project->fresh())->not->toBeNull();
});
