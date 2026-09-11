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