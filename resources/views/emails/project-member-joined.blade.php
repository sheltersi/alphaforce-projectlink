<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>A new member joined {{ $projectTitle }}</title>
    <style>
        @media only screen and (max-width: 620px) {
            .email-shell { width: 100% !important; }
            .email-content { padding: 30px 22px !important; }
            .email-footer { padding: 22px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f2ed; color:#30271f; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
        {{ $memberName }} accepted your invitation to {{ $projectTitle }}.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f2ed;">
        <tr>
            <td align="center" style="padding:32px 14px;">
                <table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px; max-width:600px; overflow:hidden; border:1px solid #e9e4db; border-radius:22px; background-color:#ffffff;">
                    <tr>
                        <td style="padding:23px 34px; border-bottom:1px solid #f0ece5;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td valign="middle" style="width:38px; height:38px; border-radius:12px; background-color:#e98248; color:#ffffff; text-align:center; font-size:13px; font-weight:700;">OP</td>
                                    <td valign="middle" style="padding-left:11px; color:#30271f; font-size:19px; font-weight:700; letter-spacing:-.3px;">OrangePie</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="email-content" style="padding:38px 42px 36px;">
                            <p style="margin:0 0 13px; color:#71866d; font-size:11px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase;">Invitation accepted</p>
                            <h1 style="margin:0 0 14px; color:#30271f; font-size:29px; line-height:1.22; letter-spacing:-.7px;">Your team is growing.</h1>
                            <p style="margin:0 0 24px; color:#71675b; font-size:15px; line-height:1.7;">Hello {{ $recipientName }}, {{ $memberName }} accepted your invitation and is now part of the project.</p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px; border:1px solid #e9e9df; border-radius:17px; background-color:#f7f7f1;">
                                <tr>
                                    <td style="padding:21px 23px;">
                                        <p style="margin:0 0 7px; color:#85917d; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;">New project member</p>
                                        <p style="margin:0 0 5px; color:#30271f; font-size:18px; font-weight:700;">{{ $memberName }}</p>
                                        <p style="margin:0 0 18px; color:#81776a; font-size:13px;">{{ $memberEmail }}</p>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td valign="middle" style="width:26px; height:26px; border-radius:9px; background-color:#eee5d9; color:#a85e38; text-align:center; font-size:13px; font-weight:700;">⌂</td>
                                                <td valign="middle" style="padding-left:9px; color:#71675b; font-size:13px;">{{ $projectTitle }} · {{ $organisationName }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 22px; color:#71675b; font-size:14px; line-height:1.7;">They’re now in the project roster. You can assign their project role and add any team or schedule details.</p>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 22px;">
                                <tr>
                                    <td align="center" style="border-radius:999px; background-color:#c86f43;">
                                        <a href="{{ $projectTeamUrl }}" target="_blank" style="display:inline-block; padding:15px 27px; border:1px solid #c86f43; border-radius:999px; color:#ffffff; font-size:14px; font-weight:700; text-decoration:none;">View project team&nbsp;&nbsp;→</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0; overflow-wrap:anywhere; color:#8b8175; font-size:12px; line-height:1.65;">If the button doesn’t work, copy this link into your browser:<br>
                                <a href="{{ $projectTeamUrl }}" style="color:#a85e38; text-decoration:underline;">{{ $projectTeamUrl }}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="email-footer" style="padding:21px 34px; border-top:1px solid #f0ece5; background-color:#fbfaf7;">
                            <p style="margin:0; color:#a59b8e; font-size:11px; line-height:1.6;">Sent by OrangePie · Projects and people, in one place</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
