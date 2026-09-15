<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $resume['full_name'] }} — Digital Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Segoe UI", Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.5;
            color: #1e2f44;
            background: #ffffff;
        }
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 0;
            margin: 0 auto;
            background: #ffffff;
        }
        .header {
            background: #1e3a5f;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 50%, #5a3a2a 100%);
            color: #ffffff;
            padding: 28px 32px;
        }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: middle; padding: 0; }
        .avatar {
            width: 80px;
            height: 80px;
            border-radius: 12px;
            object-fit: cover;
            display: block;
            border: 3px solid rgba(255,255,255,0.2);
        }
        .avatar-fallback {
            width: 80px;
            height: 80px;
            border-radius: 12px;
            background: #e8ddd0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22pt;
            font-weight: 900;
            color: #1e3a5f;
            border: 3px solid rgba(255,255,255,0.2);
        }
        .name {
            font-size: 24pt;
            font-weight: 900;
            letter-spacing: -0.5px;
            margin-bottom: 4px;
        }
        .tagline {
            font-size: 10.5pt;
            font-weight: 500;
            color: #e8ddd0;
            opacity: 0.9;
        }
        .contact-row {
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid rgba(255,255,255,0.15);
        }
        .contact-table { width: 100%; border-collapse: collapse; }
        .contact-table td {
            font-size: 9pt;
            color: #e8ddd0;
            padding: 2px 0;
            width: 25%;
        }
        .contact-label {
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #b8a99a;
            display: block;
            margin-bottom: 1px;
        }

        .body-table { width: 100%; border-collapse: collapse; }
        .sidebar {
            width: 34%;
            background: #faf8f5;
            vertical-align: top;
            padding: 24px;
            border-right: 1px solid #e9e0d5;
        }
        .main {
            width: 66%;
            vertical-align: top;
            padding: 24px 28px;
        }

        .section-title {
            font-size: 8pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #8b7355;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 1px solid #e9e0d5;
        }
        .section-title-accent {
            color: #8b4513;
            border-bottom-color: #c4a882;
        }

        .skill-chip {
            display: inline-block;
            background: #ffffff;
            border: 1px solid #d4c4b0;
            border-radius: 4px;
            padding: 3px 8px;
            font-size: 8.5pt;
            font-weight: 600;
            color: #2d4a6f;
            margin: 0 4px 4px 0;
        }

        .sidebar-item {
            margin-bottom: 14px;
        }
        .sidebar-item-title {
            font-size: 9.5pt;
            font-weight: 700;
            color: #1e2f44;
            margin-bottom: 1px;
        }
        .sidebar-item-sub {
            font-size: 8.5pt;
            color: #8b4513;
            font-weight: 600;
        }
        .sidebar-item-meta {
            font-size: 8pt;
            color: #8b7355;
            margin-top: 2px;
        }

        .exp-item {
            margin-bottom: 18px;
            padding-left: 16px;
            border-left: 2px solid #c4a882;
        }
        .exp-header {
            margin-bottom: 3px;
        }
        .exp-role {
            font-size: 11pt;
            font-weight: 800;
            color: #1e2f44;
        }
        .exp-company {
            font-size: 9.5pt;
            font-weight: 700;
            color: #8b4513;
        }
        .exp-date {
            font-size: 8pt;
            font-weight: 700;
            color: #8b7355;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            float: right;
        }
        .exp-location {
            font-size: 8pt;
            color: #8b7355;
            margin-top: 2px;
        }
        .exp-desc {
            font-size: 9.5pt;
            color: #3a4a5a;
            margin-top: 5px;
            line-height: 1.55;
        }

        .edu-item {
            margin-bottom: 12px;
            padding: 10px 12px;
            background: #faf8f5;
            border-radius: 6px;
            border: 1px solid #e9e0d5;
        }
        .edu-qual {
            font-size: 10pt;
            font-weight: 800;
            color: #1e2f44;
        }
        .edu-inst {
            font-size: 9pt;
            font-weight: 700;
            color: #8b4513;
        }
        .edu-meta {
            font-size: 8pt;
            color: #8b7355;
            margin-top: 2px;
        }

        .summary-box {
            background: #faf8f5;
            border-left: 3px solid #c4a882;
            padding: 14px 16px;
            border-radius: 0 6px 6px 0;
            margin-bottom: 20px;
        }
        .summary-text {
            font-size: 10pt;
            line-height: 1.65;
            color: #3a4a5a;
        }

        .stats-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }
        .stats-table td {
            font-size: 9pt;
            padding: 3px 0;
        }
        .stats-table td:first-child { color: #8b7355; }
        .stats-table td:last-child {
            text-align: right;
            font-weight: 800;
            color: #1e2f44;
        }

        .strength-bar {
            width: 100%;
            height: 6px;
            background: #e9e0d5;
            border-radius: 3px;
            margin-top: 6px;
            overflow: hidden;
        }
        .strength-fill {
            height: 100%;
            background: #c4a882;
            border-radius: 3px;
        }

        .footer {
            text-align: center;
            font-size: 7.5pt;
            color: #b8a99a;
            padding: 16px;
            border-top: 1px solid #e9e0d5;
        }

        .clear { clear: both; }
    </style>
</head>
<body>
    <div class="page">
        <!-- Header -->
        <div class="header">
            <table class="header-table">
                <tr>
                    <td style="width: 100px;">
                        @if($resume['photo_url'])
                            <img src="{{ $resume['photo_url'] }}" alt="{{ $resume['full_name'] }}" class="avatar">
                        @else
                            <div class="avatar-fallback">{{ $initials }}</div>
                        @endif
                    </td>
                    <td style="padding-left: 20px;">
                        <div class="name">{{ $resume['full_name'] }}</div>
                        <div class="tagline">{{ $tagline }}</div>
                    </td>
                    <td style="width: 140px; text-align: right; vertical-align: top;">
                        <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #b8a99a;">Profile Strength</div>
                        <div style="font-size: 16pt; font-weight: 900; color: #e8c97a; margin-top: 2px;">{{ $resume['profile_strength'] }}%</div>
                        <div class="strength-bar" style="margin-top: 6px;">
                            <div class="strength-fill" style="width: {{ $resume['profile_strength'] }}%;"></div>
                        </div>
                    </td>
                </tr>
            </table>
            <div class="contact-row">
                <table class="contact-table">
                    <tr>
                        @if($resume['email'])
                            <td>
                                <span class="contact-label">Email</span>
                                {{ $resume['email'] }}
                            </td>
                        @endif
                        @if($resume['phone'])
                            <td>
                                <span class="contact-label">Phone</span>
                                {{ $resume['phone'] }}
                            </td>
                        @endif
                        @if($location)
                            <td>
                                <span class="contact-label">Location</span>
                                {{ $location }}
                            </td>
                        @endif
                        @if($resume['nationality'])
                            <td>
                                <span class="contact-label">Nationality</span>
                                {{ $resume['nationality'] }}
                            </td>
                        @endif
                    </tr>
                </table>
            </div>
        </div>

        <!-- Body -->
        <table class="body-table">
            <tr>
                <!-- Sidebar -->
                <td class="sidebar">
                    <div class="section-title">Skills</div>
                    @if(count($resume['skills']) === 0)
                        <p style="font-size: 8.5pt; color: #b8a99a; font-style: italic;">No skills added yet.</p>
                    @else
                        <div>
                            @foreach($resume['skills'] as $skill)
                                <span class="skill-chip">{{ $skill['name'] }}</span>
                            @endforeach
                        </div>
                    @endif

                    <div class="section-title" style="margin-top: 20px;">Certifications</div>
                    @if(count($resume['certifications']) === 0)
                        <p style="font-size: 8.5pt; color: #b8a99a; font-style: italic;">No certifications yet.</p>
                    @else
                        @foreach($resume['certifications'] as $cert)
                            <div class="sidebar-item">
                                <div class="sidebar-item-title">{{ $cert['name'] }}</div>
                                <div class="sidebar-item-sub">{{ $cert['issuer'] ?? '—' }}</div>
                                <div class="sidebar-item-meta">
                                    @if($cert['issue_date']) Issued {{ $cert['issue_date'] }} @endif
                                    @if($cert['expiry_date']) · Expires {{ $cert['expiry_date'] }} @endif
                                </div>
                            </div>
                        @endforeach
                    @endif

                    <div class="section-title" style="margin-top: 20px;">Education</div>
                    @if(count($resume['educations']) === 0)
                        <p style="font-size: 8.5pt; color: #b8a99a; font-style: italic;">No education entries yet.</p>
                    @else
                        @foreach($resume['educations'] as $edu)
                            <div class="sidebar-item">
                                <div class="sidebar-item-title">{{ $edu['qualification'] ?? 'Qualification' }}</div>
                                <div class="sidebar-item-sub">{{ $edu['institution'] }}</div>
                                <div class="sidebar-item-meta">
                                    {{ $edu['start_year'] ?? '—' }} — {{ $edu['end_year'] ?? '—' }}
                                    @if($edu['field_of_study']) · {{ $edu['field_of_study'] }} @endif
                                </div>
                            </div>
                        @endforeach
                    @endif

                    <div style="margin-top: 20px; padding: 12px; background: #f0ebe3; border-radius: 6px; border: 1px solid #e0d5c8;">
                        <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #8b7355; margin-bottom: 8px;">At a glance</div>
                        <table class="stats-table">
                            <tr><td>Experiences</td><td>{{ count($resume['experiences']) }}</td></tr>
                            <tr><td>Education</td><td>{{ count($resume['educations']) }}</td></tr>
                            <tr><td>Skills</td><td>{{ count($resume['skills']) }}</td></tr>
                            <tr><td>Certifications</td><td>{{ count($resume['certifications']) }}</td></tr>
                        </table>
                    </div>
                </td>

                <!-- Main -->
                <td class="main">
                    @if($resume['summary'])
                        <div class="section-title section-title-accent">About</div>
                        <div class="summary-box">
                            <div class="summary-text">{{ $resume['summary'] }}</div>
                        </div>
                    @endif

                    <div class="section-title section-title-accent">Experience</div>
                    @if(count($resume['experiences']) === 0)
                        <p style="font-size: 9pt; color: #b8a99a; font-style: italic;">No work experience added yet.</p>
                    @else
                        @foreach($resume['experiences'] as $exp)
                            <div class="exp-item">
                                <div class="exp-header">
                                    <span class="exp-date">
                                        {{ $exp['start_date'] ?? '—' }} — {{ $exp['currently_working'] ? 'Present' : ($exp['end_date'] ?? '—') }}
                                    </span>
                                    <div class="exp-role">{{ $exp['role'] ?? 'Role' }}</div>
                                    <div class="exp-company">{{ $exp['company'] }}</div>
                                    <div class="clear"></div>
                                </div>
                                @if($exp['location'])
                                    <div class="exp-location">{{ $exp['location'] }}</div>
                                @endif
                                @if($exp['description'])
                                    <div class="exp-desc">{{ $exp['description'] }}</div>
                                @endif
                            </div>
                        @endforeach
                    @endif

                    <div class="section-title section-title-accent" style="margin-top: 24px;">Education</div>
                    @if(count($resume['educations']) === 0)
                        <p style="font-size: 9pt; color: #b8a99a; font-style: italic;">No education entries yet.</p>
                    @else
                        @foreach($resume['educations'] as $edu)
                            <div class="edu-item">
                                <div class="edu-qual">{{ $edu['qualification'] ?? 'Qualification' }}</div>
                                <div class="edu-inst">{{ $edu['institution'] }}</div>
                                <div class="edu-meta">
                                    {{ $edu['start_year'] ?? '—' }} — {{ $edu['end_year'] ?? '—' }}
                                    @if($edu['field_of_study']) · {{ $edu['field_of_study'] }} @endif
                                </div>
                                @if($edu['description'])
                                    <div style="font-size: 9pt; color: #3a4a5a; margin-top: 4px; line-height: 1.5;">{{ $edu['description'] }}</div>
                                @endif
                            </div>
                        @endforeach
                    @endif
                </td>
            </tr>
        </table>

        <div class="footer">
            Generated from ProjectLink · {{ date('F Y') }}
        </div>
    </div>
</body>
</html>
