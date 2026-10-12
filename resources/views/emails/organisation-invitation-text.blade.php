You’re invited to join {{ $organisationName }} on OrangePie.

Hello,

You’ve been invited to join {{ $organisationName }} as a member. Accept your invitation to access the organisation’s projects and workspace in OrangePie.

@if ($temporaryPassword !== null)
Your sign-in details:
@if ($recipientEmail)
Email: {{ $recipientEmail }}
@endif
Temporary password: {{ $temporaryPassword }}

To copy it, select the password and use your device’s Copy command. After signing in, you’ll be asked to choose a new password.
@else
Sign in with your existing OrangePie password to accept the invitation.
@endif

Accept your invitation:
{{ $invitationUrl }}

This invitation expires in 7 days. If you weren’t expecting this invitation, you can safely ignore this email.

OrangePie · Project and participant management
