<?php

use App\Models\Organisation;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectParticipant;
use App\Models\User;
use App\Notifications\ProjectApplicationAccepted;
use App\Notifications\ProjectApplicationRejected;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function reviewSetup(): array
{
    $org = Organisation::factory()->create();
    $admin = User::factory()->create();
    $admin->assignRole('technical_admin');
    $org->users()->attach($admin->id, ['role' => 'admin']);

    $manager = User::factory()->create();
    $manager->assignRole('project_manager');
    $org->users()->attach($manager->id, ['role' => 'manager']);

    $project = Project::factory()->create([
        'organisation_id' => $org->id,
        'created_by' => $manager->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $applicant = User::factory()->create(['name' => 'Zara Almeida', 'email' => 'zara@example.com']);
    $applicant->assignRole('participant');

    $application = ProjectApplication::factory()->create([
        'project_id' => $project->id,
        'user_id' => $applicant->id,
        'status' => ProjectApplication::STATUS_SUBMITTED,
    ]);

    return compact('org', 'admin', 'manager', 'project', 'applicant', 'application');
}

function reviewHeaders(User $user): array
{
    return ['Authorization' => 'Bearer '.$user->createToken('t')->plainTextToken];
}

it('accepts an application with participant creation and notification', function () {
    Notification::fake();
    ['manager' => $manager, 'project' => $project, 'application' => $application, 'applicant' => $applicant] = reviewSetup();

    $res = $this->patchJson("/api/projects/{$project->id}/applications/{$application->id}", [
        'status' => 'accepted',
    ], reviewHeaders($manager))->assertOk();

    $res->assertJsonPath('data.status', 'accepted')
        ->assertJsonPath('message', 'Application accepted.')
        ->assertJsonStructure(['data' => ['id', 'reviewed_at', 'reviewed_by', 'rejection_reason', 'applicant', 'assignment']]);

    expect($application->fresh()->reviewed_by)->toBe($manager->id);
    $this->assertDatabaseHas('project_participants', ['project_id' => $project->id, 'user_id' => $applicant->id]);
    Notification::assertSentTo($applicant, ProjectApplicationAccepted::class);
});

it('rejects with reason and blocks illegal transitions', function () {
    Notification::fake();
    ['manager' => $manager, 'project' => $project, 'application' => $application, 'applicant' => $applicant] = reviewSetup();

    $this->patchJson("/api/projects/{$project->id}/applications/{$application->id}", [
        'status' => 'rejected', 'rejection_reason' => 'Not enough capacity.',
    ], reviewHeaders($manager))->assertOk()->assertJsonPath('data.rejection_reason', 'Not enough capacity.');
    Notification::assertSentTo($applicant, ProjectApplicationRejected::class);

    // rejected -> accepted blocked
    $this->patchJson("/api/projects/{$project->id}/applications/{$application->id}", [
        'status' => 'accepted',
    ], reviewHeaders($manager))->assertStatus(422)->assertJsonValidationErrors('status');

    // accepted terminal
    $app2 = ProjectApplication::factory()->create(['project_id' => $project->id, 'status' => 'accepted']);
    $this->patchJson("/api/projects/{$project->id}/applications/{$app2->id}", [
        'status' => 'rejected',
    ], reviewHeaders($manager))->assertStatus(422);

    // withdrawn terminal
    $app3 = ProjectApplication::factory()->create(['project_id' => $project->id, 'status' => 'withdrawn']);
    $this->patchJson("/api/projects/{$project->id}/applications/{$app3->id}", [
        'status' => 'accepted',
    ], reviewHeaders($manager))->assertStatus(422);

    // rejection_reason prohibited unless rejected
    $app4 = ProjectApplication::factory()->create(['project_id' => $project->id, 'status' => 'submitted']);
    $this->patchJson("/api/projects/{$project->id}/applications/{$app4->id}", [
        'status' => 'accepted', 'rejection_reason' => 'nope',
    ], reviewHeaders($manager))->assertStatus(422)->assertJsonValidationErrors('rejection_reason');
});

it('searches the queue and shows full detail', function () {
    ['manager' => $manager, 'project' => $project] = reviewSetup();
    $headers = reviewHeaders($manager);

    $this->getJson("/api/projects/{$project->id}/applications?search=zara", $headers)
        ->assertOk()->assertJsonCount(1, 'data');
    $this->getJson("/api/projects/{$project->id}/applications?search=nomatchxyz", $headers)
        ->assertOk()->assertJsonCount(0, 'data');

    $app = ProjectApplication::where('project_id', $project->id)->first();
    $this->getJson("/api/projects/{$project->id}/applications/{$app->id}", $headers)
        ->assertOk()->assertJsonStructure(['data' => ['applicant', 'assignment', 'reviewed_at', 'reviewed_by', 'rejection_reason']]);
});

it('returns 404 cross-org and 403 for non-managers', function () {
    ['org' => $org, 'project' => $project, 'application' => $application] = reviewSetup();
    $orgB = Organisation::factory()->create();
    $adminB = User::factory()->create();
    $adminB->assignRole('technical_admin');
    $orgB->users()->attach($adminB->id, ['role' => 'admin']);

    $participant = User::factory()->create();
    $participant->assignRole('participant');
    $org->users()->attach($participant->id, ['role' => 'member']);

    $this->getJson("/api/projects/{$project->id}/applications/{$application->id}", reviewHeaders($adminB))->assertNotFound();
    $this->patchJson("/api/projects/{$project->id}/applications/{$application->id}", ['status' => 'accepted'], reviewHeaders($adminB))->assertNotFound();

    $this->patchJson("/api/projects/{$project->id}/applications/{$application->id}", ['status' => 'accepted'], reviewHeaders($participant))->assertForbidden();
});
