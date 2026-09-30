<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\ProjectApplication;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectApplicationAccepted extends Notification
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
            ->subject('Your application for '.$project->title.' was accepted')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Good news! Your application to participate in '.$project->title.' has been accepted.')
            ->action('View project', route('projects.show', $project))
            ->line('The project team will be in touch with next steps.');
    }
}
