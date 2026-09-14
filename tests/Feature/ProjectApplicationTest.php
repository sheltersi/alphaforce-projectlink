<?php

use App\Models\Project;
use App\Models\User;
use App\Notifications\ProjectApplicationSubmitted;
use Illuminate\Support\Facades\Notification;

it('emails the project manager when a participant applies', function () {
    Notification::fake();

    $manager = User::factory()->create();
    $participant = User::factory()->create();
    $project = Project::factory()->create([
        'created_by' => $manager->id,
        'status' => Project::STATUS_OPEN,
    ]);

    $response = $this->actingAs($participant)->post(route('projects.apply', $project), [
        'cover_letter' => 'I would love to contribute.',
    ]);

    $response->assertRedirect();
    Notification::assertSentTo($manager, ProjectApplicationSubmitted::class, function (ProjectApplicationSubmitted $notification) use ($participant, $project): bool {
        $mail = $notification->toMail($project->creator);

        return $notification->application->user_id === $participant->id
            && $notification->application->project_id === $project->id
            && $mail->subject === 'New application for '.$project->title
            && collect($mail->introLines)->contains(fn (string $line): bool => str_contains($line, $participant->name));
    });
});
