import {
    ArrowLeft,
    Award,
    BriefcaseBusiness,
    CalendarRange,
    Check,
    Copy,
    Download,
    Eye,
    Globe2,
    GraduationCap,
    Link2,
    Mail,
    MapPin,
    Phone,
    Quote,
    Share2,
    Sparkles,
    Trash2,
    UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { dashboard } from '@/routes';
import { Head, Link, router, usePage } from '@inertiajs/react';

type Skill = { name: string };
type Education = {
    institution: string;
    qualification: string | null;
    field_of_study: string | null;
    start_year: number | null;
    end_year: number | null;
    description: string | null;
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
    credential_number: string | null;
    issue_date: string | null;
    expiry_date: string | null;
    does_not_expire: boolean;
    credential_url: string | null;
    related_skills: string[];
};

type Resume = {
    full_name: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    nationality: string | null;
    summary: string | null;
    photo_url: string | null;
    skills: Skill[];
    educations: Education[];
    experiences: Experience[];
    certifications: Certification[];
    profile_strength: number;
};

type ShareLink = {
    id: number;
    url: string;
    token: string;
    expires_at: string | null;
    created_at: string | null;
    view_count: number;
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
    children: ReactNode;
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

function SkillPill({ children }: { children: ReactNode }) {
    return (
        <span className="text-harbor-800 ring-harbor-100 dark:bg-harbor-950/40 dark:text-harbor-200 dark:ring-harbor-800/40 inline-flex items-center rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-sm ring-1">
            {children}
        </span>
    );
}

function SharePanel({ shareLink }: { shareLink: ShareLink | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [copied, setCopied] = useState(false);
    const [expiryDays, setExpiryDays] = useState<number>(30);

    const copy = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard blocked */
        }
    };

    const generate = () => {
        setIsBusy(true);
        router.post(
            '/dashboard/resume/share',
            { expires_in_days: expiryDays },
            {
                preserveScroll: true,
                onFinish: () => setIsBusy(false),
            },
        );
    };

    const revoke = () => {
        if (
            !confirm(
                'Revoke this link? Anyone with it will lose access immediately.',
            )
        )
            return;
        setIsBusy(true);
        router.delete('/dashboard/resume/share', {
            preserveScroll: true,
            onFinish: () => setIsBusy(false),
        });
    };

    return (
        <div className="border-border bg-background/60 border-b backdrop-blur-sm print:hidden">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
                <button
                    onClick={() => setIsOpen((v) => !v)}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                    aria-expanded={isOpen}
                    aria-controls="share-panel"
                >
                    <Share2 className="size-3.5" />
                    Share resume
                    {shareLink && (
                        <span className="bg-moss-50 text-moss-600 dark:bg-moss-900/30 dark:text-moss-300 ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                            <span className="bg-moss-500 size-1.5 rounded-full" />
                            Live
                        </span>
                    )}
                </button>
                {shareLink && (
                    <span className="text-muted-foreground hidden items-center gap-1.5 text-[11px] font-semibold sm:inline-flex">
                        <Eye className="size-3" />
                        {shareLink.view_count}{' '}
                        {shareLink.view_count === 1 ? 'view' : 'views'}
                    </span>
                )}
            </div>

            {isOpen && (
                <div
                    id="share-panel"
                    className="mx-auto max-w-5xl px-4 pb-4 sm:px-6"
                >
                    <div className="border-border/60 bg-card rounded-xl border p-4 shadow-sm">
                        {shareLink ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Link2 className="size-4 text-amber-500" />
                                    <p className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                                        Active share link
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <input
                                        readOnly
                                        value={shareLink.url}
                                        onFocus={(e) =>
                                            e.currentTarget.select()
                                        }
                                        className="border-border/60 bg-sand-50 text-foreground dark:bg-harbor-950/30 flex-1 rounded-lg border px-3 py-2 font-mono text-xs"
                                        aria-label="Share link"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copy(shareLink.url)}
                                            className="bg-harbor hover:bg-harbor-600 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white shadow-sm transition-all"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="size-3.5" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={revoke}
                                            disabled={isBusy}
                                            className="border-sienna-200 bg-card text-sienna-700 hover:bg-sienna-50 dark:border-sienna-800 dark:text-sienna-300 dark:hover:bg-sienna-900/30 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors disabled:opacity-60"
                                        >
                                            <Trash2 className="size-3.5" />
                                            Revoke
                                        </button>
                                    </div>
                                </div>
                                <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                                    <span className="inline-flex items-center gap-1">
                                        <Eye className="size-3" />
                                        {shareLink.view_count}{' '}
                                        {shareLink.view_count === 1
                                            ? 'view'
                                            : 'views'}
                                    </span>
                                    {shareLink.expires_at && (
                                        <span>
                                            Expires{' '}
                                            {new Date(
                                                shareLink.expires_at,
                                            ).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    )}
                                    {!shareLink.expires_at && (
                                        <span>Never expires</span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Share2 className="size-4 text-amber-500" />
                                    <p className="text-foreground text-sm font-bold">
                                        Generate a shareable link
                                    </p>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Anyone with the link can view your resume.
                                    You can revoke it at any time.
                                </p>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <label className="text-muted-foreground text-xs font-semibold">
                                        Expires in
                                    </label>
                                    <select
                                        value={expiryDays}
                                        onChange={(e) =>
                                            setExpiryDays(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="border-border/60 bg-sand-50 text-foreground dark:bg-harbor-950/30 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                                    >
                                        <option value={7}>7 days</option>
                                        <option value={30}>30 days</option>
                                        <option value={90}>90 days</option>
                                        <option value={365}>1 year</option>
                                    </select>
                                    <button
                                        onClick={generate}
                                        disabled={isBusy}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-600 disabled:opacity-60 sm:ml-auto"
                                    >
                                        <Share2 className="size-3.5" />
                                        {isBusy
                                            ? 'Generating…'
                                            : 'Generate link'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ResumeIndex() {
    const { resume, shareLink } = usePage<{
        resume: Resume;
        shareLink: ShareLink | null;
    }>().props;
    const fullName = resume.full_name || 'Your Name';
    const tagline =
        resume.summary?.split(/[.!?]/)[0]?.trim().slice(0, 100) ||
        'Open to opportunities';
    const location = [resume.city, resume.country].filter(Boolean).join(', ');

    return (
        <>
            <Head title={`Digital Resume · ${fullName}`} />

            {/* Toolbar */}
            <div className="border-border bg-background/85 sticky top-0 z-30 border-b backdrop-blur-lg print:hidden">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <Link
                        href={dashboard()}
                        className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="bg-sienna-50 text-sienna-700 dark:bg-sienna-900/30 dark:text-sienna-300 hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase sm:inline-flex">
                            <Sparkles className="size-3" />
                            Digital Resume
                        </span>
                        <a
                            href="/dashboard/resume/download"
                            className="bg-sienna-700 hover:bg-sienna-800 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-px hover:shadow-lg"
                        >
                            <Download className="size-4" />
                            Download PDF
                        </a>
                    </div>
                </div>
            </div>

            <SharePanel shareLink={shareLink ?? null} />

            <main className="from-sand-50 via-background to-sand-100 min-h-screen bg-gradient-to-br px-4 py-8 sm:px-6 sm:py-12 print:bg-white print:p-0">
                <article className="bg-card ring-border/50 mx-auto max-w-5xl overflow-hidden rounded-2xl shadow-xl ring-1 print:rounded-none print:shadow-none print:ring-0">
                    {/* Header band */}
                    <div className="from-harbor-800 via-harbor-700 to-sienna-800 print:from-harbor-800 print:via-harbor-700 print:to-sienna-800 relative bg-gradient-to-r px-8 py-8 text-white sm:px-12 sm:py-10">
                        <div
                            className="absolute inset-0 opacity-[0.04] print:hidden"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                backgroundSize: '32px 32px',
                            }}
                        />
                        <div className="relative flex items-center gap-6">
                            <div className="relative shrink-0">
                                {resume.photo_url ? (
                                    <img
                                        src={resume.photo_url}
                                        alt={fullName}
                                        className="size-24 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20 sm:size-28"
                                    />
                                ) : (
                                    <div className="to-sienna-200 text-harbor-900 flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-white text-2xl font-black shadow-2xl ring-4 ring-white/20 sm:size-28 sm:text-3xl">
                                        {initialsOf(fullName)}
                                    </div>
                                )}
                                <div className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-amber-400 shadow-lg">
                                    <Sparkles className="size-3 text-amber-900" />
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-extrabold tracking-[0.25em] text-amber-200/80 uppercase">
                                    Digital Resume
                                </p>
                                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                                    {fullName}
                                </h1>
                                <p className="text-harbor-100/90 mt-1.5 max-w-lg text-sm font-medium">
                                    {tagline}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                                    {resume.email && (
                                        <a
                                            href={`mailto:${resume.email}`}
                                            className="text-harbor-100/80 inline-flex items-center gap-1.5 transition-colors hover:text-white"
                                        >
                                            <Mail className="size-3.5" />
                                            {resume.email}
                                        </a>
                                    )}
                                    {resume.phone && (
                                        <a
                                            href={`tel:${resume.phone}`}
                                            className="text-harbor-100/80 inline-flex items-center gap-1.5 transition-colors hover:text-white"
                                        >
                                            <Phone className="size-3.5" />
                                            {resume.phone}
                                        </a>
                                    )}
                                    {location && (
                                        <span className="text-harbor-100/70 inline-flex items-center gap-1.5">
                                            <MapPin className="size-3.5" />
                                            {location}
                                        </span>
                                    )}
                                    {resume.nationality && (
                                        <span className="text-harbor-100/70 inline-flex items-center gap-1.5">
                                            <Globe2 className="size-3.5" />
                                            {resume.nationality}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="hidden shrink-0 sm:block">
                                <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-harbor-100/70 text-[9px] font-bold tracking-widest uppercase">
                                            Strength
                                        </span>
                                        <span className="text-sm font-black text-amber-300">
                                            {resume.profile_strength}%
                                        </span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/15">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
                                            style={{
                                                width: `${resume.profile_strength}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[280px_1fr]">
                        {/* Left sidebar */}
                        <aside className="border-border from-sand-50/80 to-sand-100/50 dark:from-sand-950/20 dark:to-background print:bg-sand-50 border-b bg-gradient-to-b p-6 sm:p-8 lg:border-r lg:border-b-0">
                            {/* Skills */}
                            <div className="mb-8">
                                <SectionHeader icon={Award}>
                                    Skills
                                </SectionHeader>
                                {resume.skills.length === 0 ? (
                                    <EmptyState message="No skills added yet." />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills.map((skill) => (
                                            <SkillPill key={skill.name}>
                                                {skill.name}
                                            </SkillPill>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Certifications */}
                            <div className="mb-8">
                                <SectionHeader icon={Award}>
                                    Certifications
                                </SectionHeader>
                                {resume.certifications.length === 0 ? (
                                    <EmptyState message="No certifications yet." />
                                ) : (
                                    <div className="space-y-3">
                                        {resume.certifications.map(
                                            (cert, idx) => (
                                                <div
                                                    key={`${cert.name}-${idx}`}
                                                    className="border-border/60 dark:bg-card/60 rounded-xl border bg-white/60 p-3.5 shadow-sm"
                                                >
                                                    <p className="text-foreground text-sm font-bold">
                                                        {cert.name}
                                                    </p>
                                                    <p className="text-sienna-600 dark:text-sienna-400 mt-0.5 text-xs">
                                                        {cert.issuer ?? '—'}
                                                    </p>
                                                    <p className="text-muted-foreground mt-1 text-[10px]">
                                                        {cert.issue_date && (
                                                            <>
                                                                Issued{' '}
                                                                {
                                                                    cert.issue_date
                                                                }
                                                            </>
                                                        )}
                                                        {cert.does_not_expire ? (
                                                            <>
                                                                {' '}
                                                                · Does not
                                                                expire
                                                            </>
                                                        ) : (
                                                            cert.expiry_date && (
                                                                <>
                                                                    {' '}
                                                                    · Expires{' '}
                                                                    {
                                                                        cert.expiry_date
                                                                    }
                                                                </>
                                                            )
                                                        )}
                                                    </p>
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
                                )}
                            </div>

                            {/* Education (compact sidebar version) */}
                            <div className="mb-8">
                                <SectionHeader icon={GraduationCap}>
                                    Education
                                </SectionHeader>
                                {resume.educations.length === 0 ? (
                                    <EmptyState message="No education entries yet." />
                                ) : (
                                    <div className="space-y-3">
                                        {resume.educations.map((edu, idx) => (
                                            <div
                                                key={`${edu.institution}-${idx}`}
                                                className="border-border/60 dark:bg-card/60 rounded-xl border bg-white/60 p-3.5 shadow-sm"
                                            >
                                                <p className="text-foreground text-sm font-bold">
                                                    {edu.qualification ?? '—'}
                                                </p>
                                                <p className="text-sienna-600 dark:text-sienna-400 mt-0.5 text-xs">
                                                    {edu.institution}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">
                                                    {edu.start_year ?? '—'} —{' '}
                                                    {edu.end_year ?? '—'}
                                                    {edu.field_of_study && (
                                                        <>
                                                            {' '}
                                                            ·{' '}
                                                            {edu.field_of_study}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* At a glance */}
                            <div className="from-harbor-50 to-sand-50 ring-harbor-100/60 dark:from-harbor-950/20 dark:to-background dark:ring-harbor-800/30 rounded-xl bg-gradient-to-br p-4 ring-1">
                                <div className="text-harbor-700 dark:text-harbor-300 mb-3 flex items-center gap-2">
                                    <UserRound className="size-4" />
                                    <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase">
                                        Profile
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        {
                                            label: 'Experiences',
                                            value: resume.experiences.length,
                                        },
                                        {
                                            label: 'Education',
                                            value: resume.educations.length,
                                        },
                                        {
                                            label: 'Skills',
                                            value: resume.skills.length,
                                        },
                                        {
                                            label: 'Certifications',
                                            value: resume.certifications.length,
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-muted-foreground">
                                                {item.label}
                                            </span>
                                            <span className="text-foreground font-bold">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Main content */}
                        <div className="p-6 sm:p-8 lg:p-10">
                            {/* Summary */}
                            {resume.summary ? (
                                <section className="mb-10">
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
                                <section className="mb-10">
                                    <SectionHeader icon={Quote}>
                                        About
                                    </SectionHeader>
                                    <EmptyState message="Add a professional summary in your profile to tell your story." />
                                </section>
                            )}

                            {/* Experience */}
                            <section className="mb-10">
                                <SectionHeader icon={BriefcaseBusiness}>
                                    Experience
                                </SectionHeader>
                                {resume.experiences.length === 0 ? (
                                    <EmptyState message="No work experience added yet." />
                                ) : (
                                    <div className="relative space-y-6">
                                        {/* Timeline line */}
                                        <div className="from-sienna-300 via-sienna-200 dark:from-sienna-800 dark:via-sienna-900 absolute top-2 bottom-2 left-[11px] w-px bg-gradient-to-b to-transparent" />
                                        {resume.experiences.map((exp, idx) => (
                                            <div
                                                key={`${exp.company}-${idx}`}
                                                className="relative pl-8"
                                            >
                                                {/* Timeline dot */}
                                                <div className="border-background from-sienna-400 to-sienna-600 absolute top-1.5 left-0 flex size-6 items-center justify-center rounded-full border-2 bg-gradient-to-br shadow-sm">
                                                    <BriefcaseBusiness className="size-2.5 text-white" />
                                                </div>
                                                <div className="border-border/60 bg-card rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md">
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

                            {/* Education (detailed main version) */}
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
                                                key={`main-${edu.institution}-${idx}`}
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
                                                {edu.description && (
                                                    <p className="text-foreground/75 mt-3 text-sm leading-6">
                                                        {edu.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="border-border bg-muted/30 border-t px-6 py-4 sm:px-10 print:hidden">
                        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-xs">
                            <p>Generated from your ProjectLink profile.</p>
                            <Link
                                href="/onboarding/build-profile"
                                className="text-sienna-600 hover:text-sienna-700 dark:text-sienna-400 inline-flex items-center gap-1.5 font-semibold transition-colors"
                            >
                                Edit profile
                                <Download className="size-3.5" />
                            </Link>
                        </div>
                    </footer>
                </article>
            </main>

            <style>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    main { padding: 0 !important; background: white !important; }
                    article { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
                    /* Ensure sidebar prints nicely */
                    aside { background: #faf8f5 !important; border-right: 1px solid #e5e0d8 !important; }
                }
            `}</style>
        </>
    );
}
