<?php

use App\Models\Organisation;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectLike;
use App\Models\ProjectParticipant;
use App\Models\User;

it('renders the project details page with a rich payload', function () {
    $organiser = User::factory()->create();
    $participant = User::factory()->create();
    $participant->markEmailAsVerified();

    $organisation = Organisation::factory()->create(['created_by' => $organiser->id]);
    $project = Project::factory()->create([
        'organisation_id' => $organisation->id,
        'created_by' => $organiser->id,
        'status' => 'open',
    ]);

    ProjectParticipant::create([
        'project_id' => $project->id,
        'user_id' => $participant->id,
        'role' => 'Designer',
        'status' => 'active',
        'joined_at' => now(),
    ]);

    ProjectLike::create(['project_id' => $project->id, 'user_id' => $participant->id]);
    ProjectApplication::create([
        'project_id' => $project->id,
        'user_id' => $participant->id,
        'status' => 'under_review',
        'cover_letter' => 'I would love to join.',
        'submitted_at' => now(),
    ]);

    $response = $this->actingAs($participant)
        ->get(route('projects.show', $project));

    $response->assertOk();
    $response->assertInertia(function ($inertia) use ($project) {
        $inertia->component('projects/show')
            ->has('project')
            ->where('project.title', $project->title)
            ->where('project.is_own_project', false)
            ->where('project.liked_by_me', true)
            ->where('project.application_status', 'under_review')
            ->where('project.positions_filled', 1);
    });
});

it('renders the my applications page for the current user', function () {
    $organiser = User::factory()->create();
    $participant = User::factory()->create();
    $participant->markEmailAsVerified();

    $organisation = Organisation::factory()->create(['created_by' => $organiser->id]);
    $project = Project::factory()->create([
        'organisation_id' => $organisation->id,
        'created_by' => $organiser->id,
        'status' => 'open',
    ]);

    ProjectApplication::create([
        'project_id' => $project->id,
        'user_id' => $participant->id,
        'status' => 'shortlisted',
        'cover_letter' => 'I am a strong match.',
        'submitted_at' => now(),
    ]);

    $response = $this->actingAs($participant)
        ->get(route('applications.index'));

    $response->assertOk();
    $response->assertInertia(function ($inertia) use ($project) {
        $inertia->component('applications/index')
            ->has('applications', 1)
            ->where('applications.0.title', $project->title)
            ->where('applications.0.status', 'shortlisted');
    });
});

it('shows the authenticated user current and past projects on the dedicated my projects page', function () {
    $participant = User::factory()->create();
    $participant->markEmailAsVerified();
    $otherUser = User::factory()->create();
    $organisation = Organisation::factory()->create();

    $currentProject = Project::factory()->create([
        'organisation_id' => $organisation->id,
        'status' => 'in_progress',
    ]);
    $pastProject = Project::factory()->create([
        'organisation_id' => $organisation->id,
        'status' => 'completed',
    ]);
    $otherProject = Project::factory()->create([
        'organisation_id' => $organisation->id,
        'status' => 'in_progress',
    ]);

    ProjectParticipant::create([
        'project_id' => $currentProject->id,
        'user_id' => $participant->id,
        'role' => 'Mentor',
        'status' => 'active',
    ]);
    ProjectParticipant::create([
        'project_id' => $pastProject->id,
        'user_id' => $participant->id,
        'role' => 'Mentor',
        'status' => 'completed',
    ]);
    ProjectParticipant::create([
        'project_id' => $otherProject->id,
        'user_id' => $otherUser->id,
        'role' => 'Developer',
        'status' => 'active',
    ]);

    $this->actingAs($participant)
        ->get(route('my-projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/my-projects')
            ->has('myProjects.current', 1)
            ->where('myProjects.current.0.id', $currentProject->id)
            ->has('myProjects.past', 1)
            ->where('myProjects.past.0.id', $pastProject->id));

    // Discover stays discover-only: no myProjects payload mixed in.
    $this->actingAs($participant)
        ->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/discover')
            ->has('projects')
            ->missing('myProjects'));
});

it('lists active assignments even when the membership role is empty', function () {
    $participant = User::factory()->create();
    $participant->markEmailAsVerified();
    $organisation = Organisation::factory()->create();

    $project = Project::factory()->create([
        'organisation_id' => $organisation->id,
        'status' => 'open',
    ]);

    ProjectParticipant::create([
        'project_id' => $project->id,
        'user_id' => $participant->id,
        'role' => null,
        'status' => 'active',
    ]);

    $this->actingAs($participant)
        ->get(route('my-projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/my-projects')
            ->has('myProjects.current', 1)
            ->where('myProjects.current.0.id', $project->id)
            ->has('myProjects.past', 0));
});

it('moves active memberships on finished projects to past instead of dropping them', function () {
    $participant = User::factory()->create();
    $participant->markEmailAsVerified();
    $organisation = Organisation::factory()->create();

    $project = Project::factory()->create([
        'organisation_id' => $organisation->id,
        'status' => 'completed',
    ]);

    ProjectParticipant::create([
        'project_id' => $project->id,
        'user_id' => $participant->id,
        'role' => 'Developer',
        'status' => 'active',
    ]);

    $this->actingAs($participant)
        ->get(route('my-projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/my-projects')
            ->has('myProjects.current', 0)
            ->has('myProjects.past', 1)
            ->where('myProjects.past.0.id', $project->id));
});
