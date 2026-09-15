<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\ProjectApplication;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectApplicationSubmitted extends Notification
{
    public function __construct(
        public ProjectApplication $application,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var Project $project */
        $project = $this->application->project;

        return (new MailMessage)
            ->subject('New application for '.$project->title)
            ->greeting('Hello '.$notifiable->name.',')
            ->line($this->application->user->name.' has applied to participate in your project, '.$project->title.'.')
            ->when($this->application->cover_letter, function (MailMessage $mail, string $coverLetter): void {
                $mail->line('Cover letter:')->line($coverLetter);
            })
            ->action('Review applicant', route('projects.applications.show', [
                'project' => $project,
                'application' => $this->application,
            ]))
            ->line('Please review the application when you have a moment.');
    }
}
