import {
    ArrowLeft,
    Award,
    BadgeCheck,
    BriefcaseBusiness,
    CalendarDays,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    User as UserIcon,
} from 'lucide-react';

import { Head, Link, usePage } from '@inertiajs/react';

type ApplicationPayload = {
    application: {
        id: number;
        status: string;
        cover_letter: string | null;
        submitted_at: string | null;
    };
    project: {
        id: number;
        slug: string | null;
        title: string;
        organisation: string | null;
    };
    applicant: {
        id: number | null;
        name: string | null;
        email: string | null;
        profile: null | {
            first_name: string | null;
            last_name: string | null;
            phone: string | null;
            city: string | null;
            country: string | null;
            nationality: string | null;
            summary: string | null;
            photo_url: string | null;
            skills: { name: string }[];
            educations: {
                institution: string;
                qualification: string | null;
                field_of_study: string | null;
                start_year: number | null;
                end_year: number | null;
            }[];
            experiences: {
                company: string;
                role: string | null;
                location: string | null;
                description: string | null;
                start_date: string | null;
                end_date: string | null;
                currently_working: boolean;
            }[];
            certifications: {
                name: string;
                issuer: string | null;
                credential_number: string | null;
                issue_date: string | null;
                expiry_date: string | null;
                does_not_expire: boolean;
                credential_url: string | null;
                related_skills: string[];
            }[];
        };
    };
};

function applicationStatusLabel(status: string): string {
    switch (status) {
        case 'submitted':
            return 'Submitted';
        case 'under_review':
            return 'Under review';
        case 'shortlisted':
            return 'Shortlisted';
        case 'accepted':
            return 'Accepted';
        case 'rejected':
            return 'Not selected';
        case 'withdrawn':
            return 'Withdrawn';
        default:
            return status.replace(/_/g, ' ');
    }
}

function applicationStatusClasses(status: string): string {
    switch (status) {
        case 'submitted':
            return 'border-harbor-600 bg-harbor-100 text-harbor-700';
        case 'under_review':
            return 'border-amber-500 bg-amber-100 text-amber-700';
        case 'shortlisted':
        case 'accepted':
            return 'border-moss-600 bg-moss-100 text-moss-700';
        case 'rejected':
            return 'border-sienna-600 bg-sienna-100 text-sienna-700';
        case 'withdrawn':
            return 'border-border bg-muted text-muted-foreground';
        default:
            return 'border-border bg-secondary text-secondary-foreground';
    }
}

function applicantInitials(name: string | null): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return (
        (parts[0]?.[0] ?? '') +
        (parts.length > 1 ? parts[parts.length - 1][0] : '')
    ).toUpperCase();
}

export default function ApplicationShow() {
    const { application } = usePage<{ application: ApplicationPayload }>()
        .props;

    const applicant = application.applicant;
    const profile = applicant?.profile;
    const fullName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
        : (applicant?.name ?? 'Unknown applicant');

    return (
        <>
            <Head title={`Application · ${applicant?.name ?? 'Applicant'}`} />

            <main className="bg-background min-h-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3">
                        <Link
                            href={`/projects/${application.project.slug ?? application.project.id}`}
                            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-bold transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                            Back to {application.project.title}
                        </Link>
                        <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold tracking-[0.08em] uppercase ${applicationStatusClasses(application.application.status)}`}
                        >
                            {applicationStatusLabel(
                                application.application.status,
                            )}
                        </span>
                    </div>

                    <header className="glass-card animate-fade-in-up rounded-2xl p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            {profile?.photo_url ? (
                                <img
                                    src={profile.photo_url}
                                    alt={fullName}
                                    className="size-20 rounded-2xl object-cover shadow-md"
                                />
                            ) : (
                                <div className="from-sienna-500 to-sienna-700 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-extrabold text-white shadow-md">
                                    {applicantInitials(fullName)}
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-sienna dark:text-sienna-300 text-xs font-bold tracking-[0.08em] uppercase">
                                    Applicant
                                </p>
                                <h1 className="text-foreground mt-1 text-3xl font-extrabold tracking-tight">
                                    {fullName}
                                </h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Applying for{' '}
                                    <span className="text-foreground/80 font-bold">
                                        {application.project.title}
                                    </span>
                                    {application.project.organisation ? (
                                        <>
                                            {' '}
                                            ·{' '}
                                            <span className="text-foreground/80 font-bold">
                                                {
                                                    application.project
                                                        .organisation
                                                }
                                            </span>
                                        </>
                                    ) : null}
                                </p>
                                <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                    {applicant?.email ? (
                                        <a
                                            href={`mailto:${applicant.email}`}
                                            className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                                        >
                                            <Mail className="size-4" />
                                            {applicant.email}
                                        </a>
                                    ) : null}
                                    {profile?.phone ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone className="size-4" />
                                            {profile.phone}
                                        </span>
                                    ) : null}
                                    {profile?.city || profile?.country ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="size-4" />
                                            {[profile?.city, profile?.country]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </span>
                                    ) : null}
                                    {application.application.submitted_at ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="size-4" />
                                            Applied{' '}
                                            {
                                                application.application
                                                    .submitted_at
                                            }
                                        </span>
                                    ) : null}
                                </div>
                                {profile?.nationality ? (
                                    <p className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-xs">
                                        <UserIcon className="size-3.5" />
                                        {profile.nationality}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </header>

                    {profile?.summary ? (
                        <section className="glass-card animate-fade-in-up rounded-2xl p-6">
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="text-sienna size-5" />
                                <h2 className="text-foreground text-lg font-extrabold">
                                    About
                                </h2>
                            </div>
                            <p className="text-foreground/80 mt-3 text-sm leading-7">
                                {profile.summary}
                            </p>
                        </section>
                    ) : null}

                    {profile?.skills?.length ? (
                        <section className="glass-card animate-fade-in-up rounded-2xl p-6">
                            <div className="flex items-center gap-2">
                                <Award className="text-sienna size-5" />
                                <h2 className="text-foreground text-lg font-extrabold">
                                    Skills
                                </h2>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {profile.skills.map((skill) => (
                                    <span
                                        key={skill.name}
                                        className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-bold"
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {profile?.experiences?.length ? (
                        <section className="glass-card animate-fade-in-up rounded-2xl p-6">
                            <div className="flex items-center gap-2">
                                <BriefcaseBusiness className="text-sienna size-5" />
                                <h2 className="text-foreground text-lg font-extrabold">
                                    Experience
                                </h2>
                            </div>
                            <ul className="mt-4 space-y-4">
                                {profile.experiences.map((exp, idx) => (
                                    <li
                                        key={`${exp.company}-${idx}`}
                                        className="border-border bg-card/50 rounded-xl border p-4"
                                    >
                                        <p className="text-foreground text-sm font-extrabold">
                                            {exp.role ?? 'Role'} ·{' '}
                                            <span className="text-muted-foreground">
                                                {exp.company}
                                            </span>
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {exp.start_date ?? '—'} →{' '}
                                            {exp.currently_working
                                                ? 'Present'
                                                : (exp.end_date ?? '—')}
                                            {exp.location
                                                ? ` · ${exp.location}`
                                                : ''}
                                        </p>
                                        {exp.description ? (
                                            <p className="text-foreground/80 mt-2 text-sm leading-6">
                                                {exp.description}
                                            </p>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {profile?.educations?.length ? (
                        <section className="glass-card animate-fade-in-up rounded-2xl p-6">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="text-sienna size-5" />
                                <h2 className="text-foreground text-lg font-extrabold">
                                    Education
                                </h2>
                            </div>
                            <ul className="mt-4 space-y-4">
                                {profile.educations.map((edu, idx) => (
                                    <li
                                        key={`${edu.institution}-${idx}`}
                                        className="border-border bg-card/50 rounded-xl border p-4"
                                    >
                                        <p className="text-foreground text-sm font-extrabold">
                                            {edu.qualification ??
                                                'Qualification'}{' '}
                                            ·{' '}
                                            <span className="text-muted-foreground">
                                                {edu.institution}
                                            </span>
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {edu.start_year ?? '—'} →{' '}
                                            {edu.end_year ?? '—'}
                                            {edu.field_of_study
                                                ? ` · ${edu.field_of_study}`
                                                : ''}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {profile?.certifications?.length ? (
                        <section className="glass-card animate-fade-in-up rounded-2xl p-6">
                            <div className="flex items-center gap-2">
                                <Award className="text-sienna size-5" />
                                <h2 className="text-foreground text-lg font-extrabold">
                                    Certifications
                                </h2>
                            </div>
                            <ul className="mt-4 space-y-3">
                                {profile.certifications.map((cert, idx) => (
                                    <li
                                        key={`${cert.name}-${idx}`}
                                        className="border-border bg-card/50 rounded-xl border p-4"
                                    >
                                        <p className="text-foreground text-sm font-extrabold">
                                            {cert.name}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {cert.issuer ?? 'Issuer unknown'}{' '}
                                            {cert.issue_date
                                                ? ` · Issued ${cert.issue_date}`
                                                : ''}
                                            {cert.expiry_date
                                                ? ` · Expires ${cert.expiry_date}`
                                                : cert.does_not_expire
                                                  ? ' · Does not expire'
                                                  : ''}
                                        </p>
                                        {cert.credential_number ? (
                                            <p className="text-muted-foreground mt-1 text-[11px]">
                                                Credential #
                                                {cert.credential_number}
                                            </p>
                                        ) : null}
                                        {cert.credential_url ? (
                                            <a
                                                href={cert.credential_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sienna mt-1 block text-xs font-semibold hover:underline"
                                            >
                                                Verify credential
                                            </a>
                                        ) : null}
                                        {cert.related_skills.length > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {cert.related_skills.map(
                                                    (skill) => (
                                                        <span
                                                            key={skill}
                                                            className="bg-moss/10 text-moss-700 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {application.application.cover_letter ? (
                        <section className="glass-card animate-fade-in-up rounded-2xl p-6">
                            <div className="flex items-center gap-2">
                                <FileText className="text-sienna size-5" />
                                <h2 className="text-foreground text-lg font-extrabold">
                                    Cover letter
                                </h2>
                            </div>
                            <p className="text-foreground/80 mt-3 text-sm leading-7 whitespace-pre-line">
                                {application.application.cover_letter}
                            </p>
                        </section>
                    ) : null}
                </div>
            </main>
        </>
    );
}
