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
        $mail = (new MailMessage)
            ->subject('Invitation to join '.$this->organisation->name)
            ->greeting('Hello,')
            ->line('You have been invited to join '.$this->organisation->name.' as a member.');

        if ($this->temporaryPassword !== null) {
            $mail
                ->line('Your login email is '.$notifiable->routes['mail'].'.')
                ->line('Your temporary password is: '.$this->temporaryPassword)
                ->line('Use this temporary password to sign in. You will be prompted to choose a new password before accessing the workspace.');
        } else {
            $mail->line('Sign in with your existing account password to accept this invitation.');
        }

        return $mail
            ->action('Accept invitation', $invitationUrl)
            ->line('This invitation expires in 7 days.');
    }
}
