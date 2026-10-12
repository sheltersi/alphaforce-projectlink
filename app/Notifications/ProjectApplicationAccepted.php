<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\User;
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
        return ['database', 'mail'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $project = $this->application->project;

        return [
            'title' => 'Application accepted',
            'message' => 'Your application to participate in '.$project->title.' has been accepted.',
            'body' => [
                'Good news! Your application to participate in '.$project->title.' has been accepted.',
                'The project team will be in touch with next steps.',
            ],
            'action_label' => 'View projects',
            'action_url' => '/projects',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var Project $project */
        $project = $this->application->project;
        $recipientName = $notifiable instanceof User ? $notifiable->name : 'there';

        return (new MailMessage)
            ->subject('Your application for '.$project->title.' was accepted')
            ->greeting('Hello '.$recipientName.',')
            ->line('Good news! Your application to participate in '.$project->title.' has been accepted.')
            ->action('View project', route('projects.show', $project))
            ->line('The project team will be in touch with next steps.');
    }
}
