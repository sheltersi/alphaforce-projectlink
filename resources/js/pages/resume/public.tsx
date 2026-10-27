import {
    Award,
    BriefcaseBusiness,
    CalendarRange,
    GraduationCap,
    Mail,
    MapPin,
    Quote,
    Shield,
    Sparkles,
} from 'lucide-react';

import { Head } from '@inertiajs/react';

type Skill = { name: string };
type Education = {
    institution: string;
    qualification: string | null;
    field_of_study: string | null;
    start_year: number | null;
    end_year: number | null;
};
type Experience = {
    company: string;
    role: string | null;
    location: string | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    currently_working: boolean;
};
type Certification = {
    name: string;
    issuer: string | null;
    issue_date: string | null;
    expiry_date: string | null;
    does_not_expire: boolean;
    credential_url: string | null;
    related_skills: string[];
};

type PublicResume = {
    full_name: string;
    photo_url: string | null;
    summary: string | null;
    city: string | null;
    country: string | null;
    email: string | null;
    skills: Skill[];
    educations: Education[];
    experiences: Experience[];
    certifications: Certification[];
    profile_owner_name: string | null;
};

type Props = {
    resume: PublicResume;
    expires_at: string | null;
    last_viewed_at: string | null;
};

function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="border-border/60 bg-muted/20 text-muted-foreground rounded-xl border border-dashed p-5 text-center text-xs">
            {message}
        </div>
    );
}

function SectionHeader({
    children,
    icon: Icon,
}: {
    children: React.ReactNode;
    icon?: typeof Award;
}) {
    return (
        <div className="mb-5 flex items-center gap-3">
            {Icon && (
                <div className="bg-sienna-100 text-sienna-700 dark:bg-sienna-900/40 dark:text-sienna-300 flex size-8 items-center justify-center rounded-lg">
                    <Icon className="size-4" />
                </div>
            )}
            <div className="from-border via-border h-px flex-1 bg-gradient-to-r to-transparent" />
            <span className="text-muted-foreground text-[10px] font-extrabold tracking-[0.2em] uppercase">
                {children}
            </span>
            <div className="from-border via-border h-px flex-1 bg-gradient-to-l to-transparent" />
        </div>
    );
}

export default function PublicResume({ resume, expires_at }: Props) {
    const fullName = resume.full_name || 'Anonymous Participant';
    const tagline =
        resume.summary?.split(/[.!?]/)[0]?.trim().slice(0, 100) ||
        'Building impact through projects';
    const location = [resume.city, resume.country].filter(Boolean).join(', ');

    return (
        <>
            <Head title={`${fullName} — Resume`} />

            <main className="from-sand-50 via-background to-sand-100 min-h-screen bg-gradient-to-br px-4 py-8 sm:px-6 sm:py-12">
                <div className="mx-auto max-w-3xl space-y-4">
                    {/* Privacy banner */}
                    <div className="border-border/60 bg-card animate-fade-in-up flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-[11px] shadow-sm">
                        <div className="text-muted-foreground flex items-center gap-2">
                            <Shield className="text-moss-500 size-3.5" />
                            <span>
                                Shared via a private link — only people with
                                this URL can see this resume.
                            </span>
                        </div>
                        <span className="hidden items-center gap-1 font-semibold text-amber-600 sm:inline-flex dark:text-amber-400">
                            <Sparkles className="size-3" />
                            ProjectLink
                        </span>
                    </div>

                    <article className="border-border/60 bg-card animate-fade-in-up stagger-1 overflow-hidden rounded-2xl border shadow-xl">
                        {/* Header */}
                        <header className="from-harbor-700 via-harbor-600 to-sienna-700 relative bg-gradient-to-r px-6 py-8 text-white sm:px-10 sm:py-10">
                            <div
                                className="absolute inset-0 opacity-[0.04]"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                    backgroundSize: '32px 32px',
                                }}
                            />
                            <div className="relative flex items-center gap-5">
                                <div className="shrink-0">
                                    {resume.photo_url ? (
                                        <img
                                            src={resume.photo_url}
                                            alt={fullName}
                                            className="size-20 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20 sm:size-24"
                                        />
                                    ) : (
                                        <div className="to-sienna-200 text-harbor-900 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-white text-2xl font-black shadow-2xl ring-4 ring-white/20 sm:size-24 sm:text-3xl">
                                            {initialsOf(fullName)}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-extrabold tracking-[0.22em] text-amber-200/80 uppercase">
                                        Shared Resume
                                    </p>
                                    <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                                        {fullName}
                                    </h1>
                                    <p className="text-harbor-100/90 mt-1.5 text-sm font-medium">
                                        {tagline}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                                        {resume.email && (
                                            <a
                                                href={`mailto:${resume.email}`}
                                                className="text-harbor-100/80 inline-flex items-center gap-1.5 transition-colors hover:text-white"
                                            >
                                                <Mail className="size-3.5" />
                                                {resume.email}
                                            </a>
                                        )}
                                        {location && (
                                            <span className="text-harbor-100/70 inline-flex items-center gap-1.5">
                                                <MapPin className="size-3.5" />
                                                {location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Body */}
                        <div className="space-y-10 p-6 sm:p-10">
                            {resume.summary ? (
                                <section>
                                    <SectionHeader icon={Quote}>
                                        About
                                    </SectionHeader>
                                    <div className="border-sienna-400 bg-sand-50/50 dark:bg-sand-950/20 relative rounded-xl border-l-4 p-5">
                                        <Quote className="text-sienna-200/50 dark:text-sienna-800/30 absolute top-4 right-4 size-6" />
                                        <p className="text-foreground/85 relative text-sm leading-7">
                                            {resume.summary}
                                        </p>
                                    </div>
                                </section>
                            ) : (
                                <section>
                                    <SectionHeader icon={Quote}>
                                        About
                                    </SectionHeader>
                                    <EmptyState message="No summary provided yet." />
                                </section>
                            )}

                            <section>
                                <SectionHeader icon={BriefcaseBusiness}>
                                    Experience
                                </SectionHeader>
                                {resume.experiences.length === 0 ? (
                                    <EmptyState message="No work experience added yet." />
                                ) : (
                                    <div className="relative space-y-6">
                                        <div className="from-sienna-300 via-sienna-200 dark:from-sienna-800 dark:via-sienna-900 absolute top-2 bottom-2 left-[11px] w-px bg-gradient-to-b to-transparent" />
                                        {resume.experiences.map((exp, idx) => (
                                            <div
                                                key={`${exp.company}-${idx}`}
                                                className="relative pl-8"
                                            >
                                                <div className="border-background from-sienna-400 to-sienna-600 absolute top-1.5 left-0 flex size-6 items-center justify-center rounded-full border-2 bg-gradient-to-br shadow-sm">
                                                    <BriefcaseBusiness className="size-2.5 text-white" />
                                                </div>
                                                <div className="border-border/60 bg-card rounded-xl border p-5 shadow-sm">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-foreground text-base font-bold">
                                                                {exp.role ??
                                                                    'Role'}
                                                            </h3>
                                                            <p className="text-sienna-600 dark:text-sienna-400 mt-0.5 text-sm font-semibold">
                                                                {exp.company}
                                                            </p>
                                                        </div>
                                                        <span className="bg-harbor-50 text-harbor-700 dark:bg-harbor-900/30 dark:text-harbor-300 inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">
                                                            <CalendarRange className="size-3" />
                                                            {exp.start_date ??
                                                                '—'}{' '}
                                                            —{' '}
                                                            {exp.currently_working
                                                                ? 'Present'
                                                                : (exp.end_date ??
                                                                  '—')}
                                                        </span>
                                                    </div>
                                                    {exp.location && (
                                                        <p className="text-muted-foreground mt-2 inline-flex items-center gap-1 text-xs">
                                                            <MapPin className="size-3" />
                                                            {exp.location}
                                                        </p>
                                                    )}
                                                    {exp.description && (
                                                        <p className="text-foreground/75 mt-3 text-sm leading-6">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section>
                                <SectionHeader icon={Award}>
                                    Skills
                                </SectionHeader>
                                {resume.skills.length === 0 ? (
                                    <EmptyState message="No skills added yet." />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills.map((skill) => (
                                            <span
                                                key={skill.name}
                                                className="text-harbor-800 ring-harbor-100 dark:bg-harbor-950/40 dark:text-harbor-200 dark:ring-harbor-800/40 inline-flex items-center rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-sm ring-1"
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section>
                                <SectionHeader icon={GraduationCap}>
                                    Education
                                </SectionHeader>
                                {resume.educations.length === 0 ? (
                                    <EmptyState message="No education entries yet." />
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {resume.educations.map((edu, idx) => (
                                            <div
                                                key={`${edu.institution}-${idx}`}
                                                className="border-border/60 bg-card rounded-xl border p-5 shadow-sm"
                                            >
                                                <h3 className="text-foreground text-base font-bold">
                                                    {edu.qualification ??
                                                        'Qualification'}
                                                </h3>
                                                <p className="text-sienna-600 dark:text-sienna-400 mt-0.5 text-sm font-semibold">
                                                    {edu.institution}
                                                </p>
                                                <p className="text-muted-foreground mt-2 inline-flex items-center gap-1 text-xs">
                                                    <CalendarRange className="size-3" />
                                                    {edu.start_year ?? '—'} —{' '}
                                                    {edu.end_year ?? '—'}
                                                </p>
                                                {edu.field_of_study && (
                                                    <p className="text-muted-foreground mt-1 text-xs">
                                                        {edu.field_of_study}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {resume.certifications.length > 0 && (
                                <section>
                                    <SectionHeader icon={Award}>
                                        Certifications
                                    </SectionHeader>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {resume.certifications.map(
                                            (cert, idx) => (
                                                <div
                                                    key={`${cert.name}-${idx}`}
                                                    className="border-border/60 bg-card rounded-xl border p-4 shadow-sm"
                                                >
                                                    <p className="text-foreground text-sm font-bold">
                                                        {cert.name}
                                                    </p>
                                                    <p className="text-sienna-600 dark:text-sienna-400 mt-0.5 text-xs">
                                                        {cert.issuer ?? '—'}
                                                    </p>
                                                    {cert.issue_date && (
                                                        <p className="text-muted-foreground mt-1 text-[10px]">
                                                            Issued{' '}
                                                            {cert.issue_date}
                                                            {cert.does_not_expire
                                                                ? ' · Does not expire'
                                                                : cert.expiry_date
                                                                  ? ` · Expires ${cert.expiry_date}`
                                                                  : ''}
                                                        </p>
                                                    )}
                                                    {cert.credential_url && (
                                                        <a
                                                            href={
                                                                cert.credential_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-sienna-600 dark:text-sienna-400 mt-1 block text-xs font-semibold hover:underline"
                                                        >
                                                            Verify credential
                                                        </a>
                                                    )}
                                                    {cert.related_skills
                                                        .length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {cert.related_skills.map(
                                                                (skill) => (
                                                                    <span
                                                                        key={
                                                                            skill
                                                                        }
                                                                        className="bg-moss-100 text-moss-700 dark:bg-moss-900/30 dark:text-moss-300 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                                                    >
                                                                        {skill}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        <footer className="border-border/60 bg-sand-50/40 border-t px-6 py-4 sm:px-10">
                            <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                <span>
                                    Shared by{' '}
                                    {resume.profile_owner_name ??
                                        'a ProjectLink participant'}
                                </span>
                                {expires_at && (
                                    <span>
                                        Link expires{' '}
                                        {new Date(
                                            expires_at,
                                        ).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                )}
                            </div>
                        </footer>
                    </article>
                </div>
            </main>
        </>
    );
}
