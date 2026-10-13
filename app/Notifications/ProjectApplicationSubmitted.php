<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\User;
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
        return ['database', 'mail'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $project = $this->application->project;

        return [
            'title' => 'New project application',
            'message' => $this->application->user->name.' applied to '.$project->title.'.',
            'body' => array_values(array_filter([
                $this->application->user->name.' applied to participate in '.$project->title.'.',
                $this->application->cover_letter ? 'Cover letter: '.$this->application->cover_letter : null,
                'Please review the application when you have a moment.',
            ])),
            'action_label' => 'Review application',
            'action_url' => route('projects.applications.show', [
                'project' => $project,
                'application' => $this->application,
            ], false),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var Project $project */
        $project = $this->application->project;
        $recipientName = $notifiable instanceof User ? $notifiable->name : 'there';

        return (new MailMessage)
            ->subject('New application for '.$project->title)
            ->greeting('Hello '.$recipientName.',')
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
