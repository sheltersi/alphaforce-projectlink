<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectMemberJoined extends Notification
{
    public function __construct(
        public User $member,
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
        $this->project->loadMissing('organisation');

        return [
            'title' => 'A member joined your project',
            'message' => $this->member->name.' accepted your invitation to join '.$this->project->title.'.',
            'body' => [
                $this->member->name.' accepted your invitation.',
                'Project: '.$this->project->title,
                'Organisation: '.$this->project->organisation->name,
            ],
            'action_label' => 'View project team',
            'action_url' => $this->projectTeamUrl(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->project->loadMissing('organisation');
        $recipientName = $notifiable instanceof User ? $notifiable->name : 'there';

        return (new MailMessage)
            ->from(config('mail.from.address'), 'OrangePie')
            ->subject($this->member->name.' joined '.$this->project->title)
            ->view('emails.project-member-joined', [
                'recipientName' => $recipientName,
                'memberName' => $this->member->name,
                'memberEmail' => $this->member->email,
                'projectTitle' => $this->project->title,
                'organisationName' => $this->project->organisation->name,
                'projectTeamUrl' => $this->projectTeamUrl(),
            ])
            ->text('emails.project-member-joined-text', [
                'recipientName' => $recipientName,
                'memberName' => $this->member->name,
                'memberEmail' => $this->member->email,
                'projectTitle' => $this->project->title,
                'organisationName' => $this->project->organisation->name,
                'projectTeamUrl' => $this->projectTeamUrl(),
            ]);
    }

    private function projectTeamUrl(): string
    {
        return rtrim((string) config('app.organisation_app_url', config('app.url')), '/').'/participants/accepted';
    }
}
