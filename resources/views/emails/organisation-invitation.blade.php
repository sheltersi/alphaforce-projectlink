<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Your OrangePie invitation</title>
    <style>
        @media only screen and (max-width: 620px) {
            .email-shell { width: 100% !important; }
            .email-content { padding: 30px 22px !important; }
            .email-footer { padding: 22px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#f7f3ed; color:#2b2118; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
        You’ve been invited to join {{ $organisationName }} on OrangePie.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f7f3ed;">
        <tr>
            <td align="center" style="padding:36px 14px;">
                <table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px; max-width:600px; border:1px solid #eadfD2; border-radius:16px; overflow:hidden; background-color:#ffffff;">
                    <tr>
                        <td style="padding:24px 34px; border-bottom:1px solid #f0e8de;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td valign="middle" style="width:38px; height:38px; border-radius:11px; background-color:#f07800; color:#ffffff; text-align:center; font-size:14px; font-weight:700;">OP</td>
                                    <td valign="middle" style="padding-left:11px; color:#2b2118; font-size:19px; font-weight:700; letter-spacing:-0.3px;">OrangePie</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="email-content" style="padding:42px 46px 40px;">
                            <p style="margin:0 0 12px; color:#c76000; font-size:12px; font-weight:700; letter-spacing:1.3px; text-transform:uppercase;">You’re invited</p>
                            <h1 style="margin:0 0 18px; color:#2b2118; font-size:29px; line-height:1.25; letter-spacing:-0.6px;">Join {{ $organisationName }}’s workspace</h1>
                            <p style="margin:0 0 16px; color:#5e5145; font-size:16px; line-height:1.65;">Hello,</p>
                            <p style="margin:0 0 26px; color:#5e5145; font-size:16px; line-height:1.65;">
                                You’ve been invited to join <strong style="color:#2b2118;">{{ $organisationName }}</strong> as a member. Accept your invitation to access the organisation’s projects and workspace in OrangePie.
                            </p>

                            @if ($temporaryPassword !== null)
                                <div style="margin:0 0 26px; padding:18px 20px; border:1px solid #f1d6b6; border-radius:12px; background-color:#fff8ef;">
                                    <p style="margin:0 0 10px; color:#6b4a28; font-size:13px; font-weight:700;">Your sign-in details</p>
                                    @if ($recipientEmail)
                                        <p style="margin:0 0 8px; color:#5e5145; font-size:14px; line-height:1.5;">Email: <strong style="color:#2b2118;">{{ $recipientEmail }}</strong></p>
                                    @endif
                                    <p style="margin:0 0 8px; color:#5e5145; font-size:14px; line-height:1.5;">Temporary password:</p>
                                    <p style="margin:0 0 10px;">
                                        <code style="display:inline-block; padding:9px 12px; border:1px solid #eadfD2; border-radius:7px; background-color:#ffffff; color:#2b2118; font-family:Consolas, Monaco, monospace; font-size:15px;">{{ $temporaryPassword }}</code>
                                    </p>
                                    <p style="margin:0; color:#75675a; font-size:13px; line-height:1.55;">To copy it, select the password and use your device’s Copy command. After signing in, you’ll be asked to choose a new password.</p>
                                </div>
                            @else
                                <p style="margin:0 0 26px; color:#5e5145; font-size:14px; line-height:1.6;">Sign in with your existing OrangePie password to accept the invitation.</p>
                            @endif

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                                <tr>
                                    <td align="center" style="border-radius:9px; background-color:#f07800;">
                                        <a href="{{ $invitationUrl }}" target="_blank" style="display:inline-block; padding:15px 25px; border:1px solid #f07800; border-radius:9px; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none;">Accept invitation</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 8px; color:#75675a; font-size:13px; line-height:1.6;">This invitation expires in 7 days. If the button doesn’t work, copy and paste this link into your browser:</p>
                            <p style="margin:0; overflow-wrap:anywhere; color:#b85c00; font-size:12px; line-height:1.6;">
                                <a href="{{ $invitationUrl }}" style="color:#b85c00; text-decoration:underline;">{{ $invitationUrl }}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="email-footer" style="padding:22px 34px; border-top:1px solid #f0e8de; background-color:#fcfaf7;">
                            <p style="margin:0 0 6px; color:#75675a; font-size:12px; line-height:1.6;">If you weren’t expecting this invitation, you can safely ignore this email.</p>
                            <p style="margin:0; color:#9a8b7d; font-size:11px; line-height:1.6;">Sent by OrangePie · Project and participant management</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
