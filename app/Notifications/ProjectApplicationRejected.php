<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectApplicationRejected extends Notification
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
            'title' => 'Application update',
            'message' => 'Your application to participate in '.$project->title.' was not successful.',
            'body' => array_values(array_filter([
                'Thank you for applying to participate in '.$project->title.'. On this occasion your application was not successful.',
                $this->application->rejection_reason ? 'Feedback from the reviewer: '.$this->application->rejection_reason : null,
                'We encourage you to apply to other projects that match your skills.',
            ])),
            'action_label' => 'Browse projects',
            'action_url' => '/projects',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var Project $project */
        $project = $this->application->project;
        $recipientName = $notifiable instanceof User ? $notifiable->name : 'there';

        return (new MailMessage)
            ->subject('Update on your application for '.$project->title)
            ->greeting('Hello '.$recipientName.',')
            ->line('Thank you for applying to participate in '.$project->title.'. On this occasion your application was not successful.')
            ->when($this->application->rejection_reason, function (MailMessage $mail, string $reason): void {
                $mail->line('Feedback from the reviewer:')->line($reason);
            })
            ->action('Browse other projects', route('projects.index'))
            ->line('We encourage you to apply to other projects that match your skills.');
    }
}
