<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectMemberInvitation extends Notification
{
    public function __construct(
        public Project $project,
        public User $inviter,
        public string $token,
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
            'title' => 'Project invitation',
            'message' => $this->inviter->name.' invited you to join '.$this->project->title.'.',
            'body' => [
                $this->inviter->name.' invited you to join '.$this->project->title.'.',
                'Organisation: '.$this->project->organisation->name,
                'Accept the invitation to see the project in your projects list.',
            ],
            'action_label' => 'Accept invitation',
            'action_url' => $this->acceptanceUrl(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $recipientName = $notifiable instanceof User ? $notifiable->name : 'there';
        $this->project->loadMissing('organisation');

        return (new MailMessage)
            ->from(config('mail.from.address'), 'OrangePie')
            ->subject('You’re invited to join '.$this->project->title)
            ->view('emails.project-member-invitation', [
                'recipientName' => $recipientName,
                'projectTitle' => $this->project->title,
                'organisationName' => $this->project->organisation->name,
                'inviterName' => $this->inviter->name,
                'invitationUrl' => $this->acceptanceUrl(),
            ])
            ->text('emails.project-member-invitation-text', [
                'recipientName' => $recipientName,
                'projectTitle' => $this->project->title,
                'organisationName' => $this->project->organisation->name,
                'inviterName' => $this->inviter->name,
                'invitationUrl' => $this->acceptanceUrl(),
            ]);
    }

    private function acceptanceUrl(): string
    {
        return rtrim((string) config('app.organisation_app_url', config('app.url')), '/')
            .'/projects/invitations/accept?token='.urlencode($this->token);
    }
}
