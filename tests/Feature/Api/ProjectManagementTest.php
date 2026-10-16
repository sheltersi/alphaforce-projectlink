<?php

use App\Models\Organisation;
use App\Models\ParticipantProfile;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectInvitation;
use App\Models\ProjectParticipant;
use App\Models\Skill;
use App\Models\User;
use App\Notifications\ProjectManagerAssigned;
use App\Notifications\ProjectMemberInvitation;
use App\Notifications\ProjectMemberJoined;
use App\Services\ProjectInvitationService;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

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
    Auth::forgetGuards();

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

it('emails the selected project manager when a project manager assigns them during project creation', function () {
    Notification::fake();

    ['orgA' => $orgA, 'managerA' => $managerA, 'participantA' => $participantA] = makeProjectSetup();

    $this->postJson('/api/projects', validProjectPayload([
        'project_manager_id' => $participantA->id,
        'role' => 'project_manager',
    ]), projectHeaders($managerA))
        ->assertCreated()
        ->assertJsonPath('data.creator.id', $participantA->id);

    $this->assertDatabaseHas('organisation_users', [
        'organisation_id' => $orgA->id,
        'user_id' => $participantA->id,
        'role' => 'project_manager',
    ]);

    Notification::assertSentTo($participantA, ProjectManagerAssigned::class, function (ProjectManagerAssigned $notification) use ($participantA): bool {
        $mail = $notification->toMail($participantA);

        return $notification->project->title === 'Community Garden Revival'
            && $mail->subject === 'You’ve been assigned as project manager for Community Garden Revival'
            && $mail->actionText === 'View your projects';
    });
    Notification::assertNotSentTo($managerA, ProjectManagerAssigned::class);
});

function makeOrgProject(Organisation $org, User $creator, string $status = Project::STATUS_DRAFT): Project
{
    return Project::factory()->create([
        'organisation_id' => $org->id,
        'created_by' => $creator->id,
        'originator_id' => $creator->id,
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

it('limits project managers to projects they manage while admins can see every project', function () {
    ['orgA' => $orgA, 'adminA' => $adminA, 'managerA' => $managerA, 'managerA2' => $managerA2] = makeProjectSetup();
    $managedProject = makeOrgProject($orgA, $managerA);
    $anotherManagerProject = makeOrgProject($orgA, $managerA2);
    $createdByManagerProject = makeOrgProject($orgA, $managerA2);
    $createdByManagerProject->update(['originator_id' => $managerA->id]);
    $adminProject = makeOrgProject($orgA, $adminA);

    $this->getJson('/api/projects', projectHeaders($managerA))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonFragment(['id' => $managedProject->id])
        ->assertJsonFragment(['id' => $createdByManagerProject->id]);
    $this->getJson("/api/projects/{$managedProject->id}", projectHeaders($managerA))->assertOk();
    $this->getJson("/api/projects/{$anotherManagerProject->id}", projectHeaders($managerA))->assertForbidden();
    $this->getJson("/api/projects/{$createdByManagerProject->id}", projectHeaders($managerA))->assertOk();
    $this->getJson("/api/projects/{$anotherManagerProject->id}/applications", projectHeaders($managerA))->assertForbidden();

    $this->getJson('/api/projects', projectHeaders($adminA))
        ->assertOk()
        ->assertJsonCount(4, 'data');
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

it('allows organisation members to browse projects but not create them', function () {
    ['orgA' => $orgA, 'orgB' => $orgB, 'managerA' => $managerA, 'adminB' => $adminB, 'participantA' => $participantA, 'outsider' => $outsider] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $foreignProject = makeOrgProject($orgB, $adminB, Project::STATUS_COMPLETED);
    $headers = projectHeaders($participantA);

    $this->getJson('/api/projects', $headers)
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $project->id);
    $this->getJson("/api/projects/{$project->id}", $headers)->assertOk();
    $this->getJson("/api/projects/{$foreignProject->id}", $headers)->assertNotFound();
    $this->postJson('/api/projects', validProjectPayload(), $headers)->assertForbidden();
    $this->getJson('/api/projects', projectHeaders($outsider))->assertForbidden();
});

it('lets a project manager create an open project in their organisation without becoming an organisation admin', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'managerA2' => $managerA2] = makeProjectSetup();

    $response = $this->postJson('/api/projects', validProjectPayload([
        'project_manager_id' => $managerA2->id,
        'role' => 'project_manager',
    ]), projectHeaders($managerA))
        ->assertCreated()
        ->assertJsonPath('data.organisation_id', $orgA->id)
        ->assertJsonPath('data.creator.id', $managerA2->id)
        ->assertJsonPath('data.originator_id', $managerA->id)
        ->assertJsonPath('data.status', Project::STATUS_OPEN);

    $this->assertDatabaseHas('projects', [
        'id' => $response->json('data.id'),
        'organisation_id' => $orgA->id,
        'created_by' => $managerA2->id,
        'originator_id' => $managerA->id,
    ]);
    $this->getJson('/api/projects', projectHeaders($managerA))
        ->assertOk()
        ->assertJsonFragment(['id' => $response->json('data.id')]);
    $this->assertDatabaseHas('organisation_users', [
        'organisation_id' => $orgA->id,
        'user_id' => $managerA->id,
        'role' => 'manager',
    ]);
    expect($managerA->fresh()->isOrganisationAdmin($orgA))->toBeFalse();
});

it('lets an admin assign a member to manage only a specific project', function () {
    Notification::fake();

    ['orgA' => $orgA, 'adminA' => $adminA, 'managerA' => $managerA, 'managerA2' => $managerA2, 'participantA' => $participantA] = makeProjectSetup();
    $assignedProject = makeOrgProject($orgA, $managerA);
    $otherProject = makeOrgProject($orgA, $managerA2);

    $this->patchJson("/api/projects/{$assignedProject->id}", [
        'project_manager_id' => $participantA->id,
        'role' => 'project_manager',
    ], projectHeaders($adminA))
        ->assertOk()
        ->assertJsonPath('data.creator.id', $participantA->id);

    Notification::assertSentTo($participantA, ProjectManagerAssigned::class, function (ProjectManagerAssigned $notification, array $channels) use ($assignedProject, $participantA): bool {
        $mail = $notification->toMail($participantA);

        return $notification->project->is($assignedProject)
            && $mail->subject === 'You’ve been assigned as project manager for '.$assignedProject->title
            && collect($mail->introLines)->contains(fn (string $line): bool => str_contains($line, 'Project Manager'))
            && $channels === ['database', 'mail'];
    });
    Notification::assertNotSentTo($managerA, ProjectManagerAssigned::class);

    $memberHeaders = projectHeaders($participantA);
    $this->getJson('/api/projects', $memberHeaders)
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $assignedProject->id);
    $this->getJson("/api/projects/{$assignedProject->id}", $memberHeaders)->assertOk();
    $this->getJson("/api/projects/{$assignedProject->id}/applications", $memberHeaders)->assertOk();
    $this->getJson("/api/projects/{$otherProject->id}", $memberHeaders)->assertForbidden();
    $this->getJson("/api/projects/{$otherProject->id}/applications", $memberHeaders)->assertForbidden();
    $this->getJson('/api/organisation/invitations', $memberHeaders)->assertForbidden();
    $this->putJson("/api/projects/{$assignedProject->id}", ['title' => 'Member managed project'], $memberHeaders)
        ->assertOk()
        ->assertJsonPath('data.title', 'Member managed project');
    $this->putJson("/api/projects/{$otherProject->id}", ['title' => 'Not managed by member'], $memberHeaders)
        ->assertForbidden();

    Auth::forgetGuards();
    $this->getJson('/api/auth/me', $memberHeaders)
        ->assertOk()
        ->assertJsonPath('data.current_organisation.role', 'project_manager')
        ->assertJsonPath('data.managed_projects_count', 1);
});

it('promotes an accepted project participant to project manager without granting organisation admin access', function () {
    Notification::fake();

    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $acceptedParticipant = User::factory()->create();
    $acceptedParticipant->assignRole('participant');
    ProjectParticipant::factory()->create([
        'project_id' => $project->id,
        'user_id' => $acceptedParticipant->id,
        'role' => null,
    ]);

    $this->patchJson("/api/projects/{$project->id}", [
        'project_manager_id' => $acceptedParticipant->id,
        'role' => 'project_manager',
    ], projectHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data.creator.id', $acceptedParticipant->id);

    $this->assertDatabaseHas('organisation_users', [
        'organisation_id' => $orgA->id,
        'user_id' => $acceptedParticipant->id,
        'role' => 'project_manager',
    ]);
    expect($acceptedParticipant->fresh()->isOrganisationAdmin($orgA))->toBeFalse();
});

it('lets a project manager invite an organisation member to a managed project by email', function () {
    Notification::fake();

    ['orgA' => $orgA, 'managerA' => $managerA, 'participantA' => $participantA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);

    $response = $this->postJson("/api/projects/{$project->id}/invitations", [
        'user_id' => $participantA->id,
    ], projectHeaders($managerA))
        ->assertCreated()
        ->assertJsonPath('data.project_id', $project->id)
        ->assertJsonPath('data.user_id', $participantA->id)
        ->assertJsonPath('message', 'Project invitation sent.');

    $invitation = ProjectInvitation::query()->findOrFail($response->json('data.id'));
    expect($invitation->token_hash)->not->toBeEmpty()
        ->and($invitation->accepted_at)->toBeNull();

    $this->assertDatabaseMissing('project_participants', [
        'project_id' => $project->id,
        'user_id' => $participantA->id,
    ]);

    Notification::assertSentTo($participantA, ProjectMemberInvitation::class, function (ProjectMemberInvitation $notification): bool {
        $mail = $notification->toMail($notification->project->creator);

        return $mail->subject === 'You’re invited to join '.$notification->project->title
            && ($mail->view['html'] ?? null) === 'emails.project-member-invitation'
            && ($mail->view['text'] ?? null) === 'emails.project-member-invitation-text'
            && $mail->viewData['projectTitle'] === $notification->project->title;
    });
});

it('reports invited and joined states to a project manager for their own projects only', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'managerA2' => $managerA2, 'participantA' => $participantA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $otherProject = makeOrgProject($orgA, $managerA2, Project::STATUS_OPEN);
    $invitation = app(ProjectInvitationService::class)->invite($project, $managerA, $participantA);

    $this->getJson('/api/organisation/project-member-statuses', projectHeaders($managerA))
        ->assertOk()
        ->assertJsonFragment(['user_id' => $participantA->id, 'status' => 'invited']);

    $this->getJson('/api/organisation/project-member-statuses', projectHeaders($managerA2))
        ->assertOk()
        ->assertJsonMissing(['user_id' => $participantA->id, 'status' => 'invited']);

    $this->postJson('/api/projects/invitations/accept', [
        'token' => $invitation['token'],
    ], projectHeaders($participantA))->assertCreated();

    $this->getJson('/api/organisation/project-member-statuses', projectHeaders($managerA))
        ->assertOk()
        ->assertJsonFragment(['user_id' => $participantA->id, 'status' => 'joined']);

    expect($otherProject->created_by)->toBe($managerA2->id);
});

it('adds an invited organisation member to the project only after accepting the invitation', function () {
    Notification::fake();

    ['orgA' => $orgA, 'managerA' => $managerA, 'participantA' => $participantA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $invitation = app(ProjectInvitationService::class)->invite($project, $managerA, $participantA);

    $this->postJson('/api/projects/invitations/accept', [
        'token' => $invitation['token'],
    ], projectHeaders($participantA))
        ->assertCreated()
        ->assertJsonPath('data.project_id', $project->id)
        ->assertJsonPath('data.user_id', $participantA->id)
        ->assertJsonPath('data.status', ProjectParticipant::STATUS_ACTIVE)
        ->assertJsonPath('data.project.title', $project->title)
        ->assertJsonPath('message', 'You joined '.$project->title.'.');

    $this->assertDatabaseHas('project_participants', [
        'project_id' => $project->id,
        'user_id' => $participantA->id,
        'application_id' => null,
        'role' => null,
        'status' => ProjectParticipant::STATUS_ACTIVE,
    ]);
    $this->assertNotNull($invitation['invitation']->fresh()->accepted_at);

    Notification::assertSentTo($managerA, ProjectMemberJoined::class, function (ProjectMemberJoined $notification, array $channels) use ($managerA, $participantA, $project): bool {
        $mail = $notification->toMail($managerA);

        return $notification->member->is($participantA)
            && $notification->project->is($project)
            && $mail->subject === $participantA->name.' joined '.$project->title
            && ($mail->view['html'] ?? null) === 'emails.project-member-joined'
            && in_array('mail', $channels, true);
    });

    $this->postJson('/api/projects/invitations/accept', [
        'token' => $invitation['token'],
    ], projectHeaders($participantA))->assertOk();

    Notification::assertSentToTimes($managerA, ProjectMemberJoined::class, 1);
});

it('does not allow inviting organisation administrators to a project', function () {
    Notification::fake();

    ['orgA' => $orgA, 'adminA' => $adminA, 'managerA' => $managerA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);

    $this->postJson("/api/projects/{$project->id}/invitations", [
        'user_id' => $adminA->id,
    ], projectHeaders($managerA))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('user_id');

    expect(ProjectInvitation::query()->where('project_id', $project->id)->count())->toBe(0);
    Notification::assertNothingSent();
});

it('rejects a project invitation accepted by a different account', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'participantA' => $participantA, 'managerA2' => $managerA2] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA, Project::STATUS_OPEN);
    $invitation = app(ProjectInvitationService::class)->invite($project, $managerA, $participantA);

    $this->postJson('/api/projects/invitations/accept', [
        'token' => $invitation['token'],
    ], projectHeaders($managerA2))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('token');

    $this->assertDatabaseMissing('project_participants', [
        'project_id' => $project->id,
        'user_id' => $participantA->id,
    ]);
});

it('lets an invited organisation member browse the participant directory without project assignment', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'participantA' => $participantA] = makeProjectSetup();
    $managedProject = makeOrgProject($orgA, $participantA);
    $otherProject = makeOrgProject($orgA, $managerA);
    $managedParticipant = User::factory()->create();
    $managedParticipant->assignRole('participant');
    $otherParticipant = User::factory()->create();
    $otherParticipant->assignRole('participant');

    ProjectParticipant::create([
        'project_id' => $managedProject->id,
        'user_id' => $managedParticipant->id,
        'role' => 'Coordinator',
        'status' => ProjectParticipant::STATUS_ACTIVE,
        'joined_at' => now(),
    ]);
    ProjectParticipant::create([
        'project_id' => $otherProject->id,
        'user_id' => $otherParticipant->id,
        'role' => 'Coordinator',
        'status' => ProjectParticipant::STATUS_ACTIVE,
        'joined_at' => now(),
    ]);

    $headers = projectHeaders($participantA);
    $directory = $this->getJson('/api/participants', $headers)
        ->assertOk()
        ->assertJsonCount(3, 'data');
    expect(collect($directory->json('data'))->pluck('id'))
        ->toContain($managedParticipant->id, $otherParticipant->id);
    $this->getJson("/api/participants/{$managedParticipant->id}", $headers)->assertOk();
    $this->getJson("/api/participants/{$otherParticipant->id}", $headers)->assertOk();
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

it('creates an open project without assigning a manager when none is selected', function () {
    ['orgA' => $orgA, 'managerA' => $managerA] = makeProjectSetup();
    $skill = makeCatalogueSkill();

    $response = $this->postJson('/api/projects', validProjectPayload([
        'skill_ids' => [$skill->id],
    ]), projectHeaders($managerA));

    $response->assertCreated()
        ->assertJsonPath('data.title', 'Community Garden Revival')
        ->assertJsonPath('data.status', Project::STATUS_OPEN)
        ->assertJsonPath('data.organisation_id', $orgA->id)
        ->assertJsonPath('data.positions', 5)
        ->assertJsonPath('data.originator_id', $managerA->id)
        ->assertJsonPath('message', 'Project created.');

    expect($response->json('data.skills'))->toContain('First Aid');

    $this->assertDatabaseHas('projects', [
        'title' => 'Community Garden Revival',
        'organisation_id' => $orgA->id,
        'created_by' => null,
        'originator_id' => $managerA->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $projectId = $response->json('data.id');
    $this->putJson("/api/projects/{$projectId}", ['title' => 'Unassigned Garden'], projectHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data.title', 'Unassigned Garden');
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
        ->assertCreated()
        ->assertJsonPath('data.creator.id', $participantA->id);
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

it('updates the organisation membership role when an admin assigns a project manager', function () {
    ['orgA' => $orgA, 'adminA' => $adminA, 'managerA' => $managerA, 'participantA' => $participantA] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA);

    $this->patchJson("/api/projects/{$project->id}", [
        'project_manager_id' => $participantA->id,
        'role' => 'project_manager',
    ], projectHeaders($adminA))
        ->assertOk()
        ->assertJsonPath('data.creator.id', $participantA->id);

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'created_by' => $participantA->id,
    ]);
    $this->assertDatabaseHas('organisation_users', [
        'organisation_id' => $orgA->id,
        'user_id' => $participantA->id,
        'role' => 'project_manager',
    ]);

    $this->getJson('/api/organisation/users', projectHeaders($participantA))
        ->assertOk()
        ->assertJsonFragment(['id' => $participantA->id, 'role' => 'project_manager']);
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

it('allows a project manager to publish a project they created after assigning its manager', function () {
    ['orgA' => $orgA, 'managerA' => $managerA, 'managerA2' => $managerA2] = makeProjectSetup();
    $project = makeOrgProject($orgA, $managerA2, Project::STATUS_DRAFT);
    $project->update(['originator_id' => $managerA->id]);

    $this->postJson("/api/projects/{$project->id}/publish", [], projectHeaders($managerA))
        ->assertOk()
        ->assertJsonPath('data.status', Project::STATUS_OPEN);
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
    $workingUser = User::factory()->create();
    $workingUser->assignRole('participant');
    $membership = ProjectParticipant::factory()->create([
        'project_id' => $open->id,
        'user_id' => $workingUser->id,
        'role' => 'Mentor',
        'status' => ProjectParticipant::STATUS_ACTIVE,
    ]);

    $this->postJson("/api/projects/{$open->id}/close", [], $headers)
        ->assertOk()
        ->assertJsonPath('data.status', Project::STATUS_COMPLETED)
        ->assertJsonPath('message', 'Project closed.');

    expect($membership->fresh()->status)->toBe(ProjectParticipant::STATUS_COMPLETED);
    expect($workingUser->fresh()->hasRole('candidate'))->toBeTrue();

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
