<?php

namespace App\Notifications;

use App\Models\Organisation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrganisationInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Organisation $organisation,
        public string $token,
        public ?string $temporaryPassword = null,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $invitationUrl = rtrim((string) config('app.organisation_app_url', config('app.url')), '/').'/invitations/accept?invitation_token='.urlencode($this->token);
        $organisationName = $this->organisation->name;
        $recipientEmail = $notifiable->routes['mail'] ?? null;
        $viewData = [
            'organisationName' => $organisationName,
            'invitationUrl' => $invitationUrl,
            'recipientEmail' => $recipientEmail,
            'temporaryPassword' => $this->temporaryPassword,
        ];

        $mail = (new MailMessage)
            ->from(config('mail.from.address'), 'OrangePie')
            ->subject('You’re invited to join '.$organisationName.' on OrangePie');

        return $mail
            ->view('emails.organisation-invitation', $viewData)
            ->text('emails.organisation-invitation-text', $viewData);
    }
}
