<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\ProjectApplication;
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
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        /** @var Project $project */
        $project = $this->application->project;

        return (new MailMessage)
            ->subject('Update on your application for '.$project->title)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Thank you for applying to participate in '.$project->title.'. On this occasion your application was not successful.')
            ->when($this->application->rejection_reason, function (MailMessage $mail, string $reason): void {
                $mail->line('Feedback from the reviewer:')->line($reason);
            })
            ->action('Browse other projects', route('projects.index'))
            ->line('We encourage you to apply to other projects that match your skills.');
    }
}
