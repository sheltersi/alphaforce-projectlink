<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectManagerAssigned extends Notification
{
    public function __construct(
        public Project $project,
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
        return [
            'title' => 'Project manager assignment',
            'message' => 'You were assigned as project manager for '.$this->project->title.' at '.$this->project->organisation->name.'.',
            'body' => [
                'An organisation administrator assigned you the Project Manager role for '.$this->project->title.'.',
                'Organisation: '.$this->project->organisation->name,
                'You can now manage this project in OrangePie.',
            ],
            'action_label' => 'View your projects',
            'action_url' => '/projects',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $projectsUrl = rtrim((string) config('app.organisation_app_url', config('app.url')), '/').'/projects';
        $recipientName = $notifiable instanceof User ? $notifiable->name : 'there';

        return (new MailMessage)
            ->from(config('mail.from.address'), 'OrangePie')
            ->subject('You’ve been assigned as project manager for '.$this->project->title)
            ->greeting('Hello '.$recipientName.',')
            ->line('An organisation administrator assigned you the Project Manager role for '.$this->project->title.'.')
            ->line('Organisation: '.$this->project->organisation->name)
            ->action('View your projects', $projectsUrl)
            ->line('You can now manage this project in OrangePie.');
    }
}
