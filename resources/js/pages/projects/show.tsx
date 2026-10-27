import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowLeft,
    BookOpen,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Globe,
    Heart,
    Mail,
    MapPin,
    Send,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { dashboard } from '@/routes';
import {
    index as projectsIndex,
    like as projectsLike,
    apply as projectsApply,
} from '@/routes/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ShowProject = {
    id: number;
    title: string;
    slug: string | null;
    description: string | null;
    location: string | null;
    status: 'open' | 'in_progress' | 'completed' | 'draft' | 'cancelled';
    start_date: string | null;
    end_date: string | null;
    positions: number;
    positions_filled: number;
    duration_days: number | null;
    match: number;
    organisation: {
        id: number;
        name: string;
        description: string | null;
        email: string | null;
        website: string | null;
    };
    skills: string[];
    likes_count: number;
    liked_by_me: boolean;
    application_status: string | null;
    cover_letter: string | null;
    is_own_project: boolean;
    participants: {
        id: number;
        name: string;
        role: string | null;
        joined_at: string | null;
    }[];
    creator: {
        id: number;
        name: string;
    };
};

const gradients = [
    'bg-gradient-to-br from-sienna-500 to-sienna-700 dark:from-sienna-600 dark:to-sienna-800',
    'bg-gradient-to-br from-moss-500 to-moss-700 dark:from-moss-600 dark:to-moss-800',
    'bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800',
    'bg-gradient-to-br from-harbor-500 to-harbor-700 dark:from-harbor-600 dark:to-harbor-800',
    'bg-gradient-to-br from-clay-400 to-clay-600 dark:from-clay-600 dark:to-clay-800',
];

const statusMeta: Record<
    'open' | 'in_progress' | 'completed' | 'draft' | 'cancelled',
    { label: string; className: string; dot: string }
> = {
    open: {
        label: 'Open for applications',
        className:
            'border-sandy-600 bg-amber-100 text-sienna-700 dark:border-amber-600/40 dark:bg-amber-950/40 dark:text-amber-300',
        dot: 'bg-sienna-500 dark:bg-amber-400',
    },
    in_progress: {
        label: 'In progress',
        className:
            'border-harbor-600 bg-harbor-100 text-harbor-700 dark:border-harbor-500/40 dark:bg-harbor-900/40 dark:text-harbor-300',
        dot: 'bg-harbor-500',
    },
    completed: {
        label: 'Completed',
        className:
            'border-moss-600 bg-moss-100 text-moss-700 dark:border-moss-500/40 dark:bg-moss-900/40 dark:text-moss-300',
        dot: 'bg-moss-500',
    },
    draft: {
        label: 'Draft',
        className:
            'border-clay-600 bg-clay-100 text-clay-700 dark:border-clay-500/40 dark:bg-clay-900/40 dark:text-clay-300',
        dot: 'bg-clay-500',
    },
    cancelled: {
        label: 'Cancelled',
        className:
            'border-sienna-600 bg-sienna-100 text-sienna-800 dark:border-sienna-500/40 dark:bg-sienna-900/40 dark:text-sienna-300',
        dot: 'bg-sienna-600',
    },
};

const applicationMeta: Record<string, { label: string; className: string }> = {
    submitted: {
        label: 'Application submitted',
        className:
            'border-harbor-600 bg-harbor-100 text-harbor-700 dark:border-harbor-500/40 dark:bg-harbor-900/40 dark:text-harbor-300',
    },
    under_review: {
        label: 'Under review',
        className:
            'border-amber-500 bg-amber-100 text-sienna-700 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300',
    },
    shortlisted: {
        label: 'Shortlisted',
        className:
            'border-moss-600 bg-moss-100 text-moss-700 dark:border-moss-500/40 dark:bg-moss-900/40 dark:text-moss-300',
    },
    accepted: {
        label: 'Accepted',
        className:
            'border-moss-600 bg-moss-100 text-moss-700 dark:border-moss-500/40 dark:bg-moss-900/40 dark:text-moss-300',
    },
    rejected: {
        label: 'Not selected this time',
        className:
            'border-sienna-600 bg-sienna-100 text-sienna-800 dark:border-sienna-500/40 dark:bg-sienna-900/40 dark:text-sienna-300',
    },
};

function SectionHeader({
    eyebrow,
    title,
    description,
    icon: Icon,
    tone = 'text-sienna dark:text-sienna-300',
}: {
    eyebrow: string;
    title: string;
    description?: string;
    icon: typeof BookOpen;
    tone?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <span
                className={cn(
                    'bg-secondary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl',
                    tone,
                )}
            >
                <Icon className="size-[18px]" />
            </span>
            <div>
                <p
                    className={cn(
                        'text-xs font-bold tracking-widest uppercase',
                        tone,
                    )}
                >
                    {eyebrow}
                </p>
                <h2 className="text-foreground mt-0.5 text-lg font-extrabold">
                    {title}
                </h2>
                {description && (
                    <p className="text-muted-foreground mt-0.5 text-xs">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function MatchRing({ match }: { match: number }) {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const filled = (match / 100) * circumference;

    return (
        <div className="flex items-center gap-4">
            <div className="relative size-22">
                <svg viewBox="0 0 80 80" className="size-22 -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="none"
                        strokeWidth="7"
                        className="stroke-border"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="none"
                        strokeWidth="7"
                        strokeLinecap="round"
                        className="stroke-sienna-500 dark:stroke-sienna-400"
                        strokeDasharray={`${filled} ${circumference}`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-foreground text-xl font-extrabold">
                        {match}%
                    </span>
                </div>
            </div>
            <div>
                <p className="text-foreground text-sm font-bold">Skill match</p>
                <p className="text-muted-foreground mt-1 max-w-45 text-xs leading-relaxed">
                    {match >= 70
                        ? 'Your profile aligns strongly with what this project needs.'
                        : match >= 40
                          ? "You've got some of the skills this project is after."
                          : "A few of your skills map to this project's requirements."}
                </p>
            </div>
        </div>
    );
}

function Timeline({
    start,
    end,
    duration,
}: {
    start: string | null;
    end: string | null;
    duration: number | null;
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                    <div className="bg-sienna-100 text-sienna-600 dark:bg-sienna-900/40 dark:text-sienna-300 flex size-11 shrink-0 items-center justify-center rounded-xl">
                        <CalendarDays className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sienna dark:text-sienna-300 text-xs font-extrabold tracking-wider uppercase">
                                Starts
                            </p>
                        </div>
                        <p className="text-foreground mt-0.5 truncate text-sm font-bold">
                            {start ?? 'TBC'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="hidden flex-col items-center px-1 sm:flex">
                <div className="bg-border h-px w-14" />
                {duration && (
                    <span className="bg-secondary text-muted-foreground mt-1.5 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                        {duration} {duration === 1 ? 'day' : 'days'}
                    </span>
                )}
                <div className="bg-border mt-1.5 h-px w-14" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 sm:justify-end">
                    <div className="min-w-0 text-right">
                        <p className="text-moss dark:text-moss-500 text-xs font-extrabold tracking-wider uppercase">
                            Ends
                        </p>
                        <p className="text-foreground mt-0.5 truncate text-sm font-bold">
                            {end ?? 'TBC'}
                        </p>
                    </div>
                    <div className="bg-moss-100 text-moss-600 dark:bg-moss-900/40 dark:text-moss-300 flex size-11 shrink-0 items-center justify-center rounded-xl">
                        <FlagMini />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FlagMini() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
        >
            <path d="M4 22V4c0-.6.4-1 1-1h10l-2 4 2 4H5" />
        </svg>
    );
}

function Avatar({ name, className }: { name: string; className?: string }) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <span
            className={cn(
                'from-harbor-500 to-harbor-700 dark:from-harbor-600 dark:to-harbor-800 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-extrabold text-white',
                className,
            )}
        >
            {initials}
        </span>
    );
}

export default function ShowProject() {
    const { project } = usePage().props as unknown as { project: ShowProject };
    const [applyOpen, setApplyOpen] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [liking, setLiking] = useState(false);

    const gradient = gradients[project.id % gradients.length];
    const status = statusMeta[project.status];
    const filledPercent = Math.min(
        100,
        Math.round((project.positions_filled / project.positions) * 100),
    );

    const application = project.application_status
        ? applicationMeta[project.application_status]
        : null;

    const applyingTo = useForm({
        cover_letter: project.cover_letter ?? '',
    });

    const canApply =
        !project.is_own_project &&
        (project.status === 'open' || project.status === 'in_progress') &&
        (!project.application_status ||
            project.application_status === 'rejected');

    const submitApplication = () => {
        const url = projectsApply({ project: project.id }).url;
        applyingTo.post(url, {
            preserveScroll: true,
            onSuccess: () => {
                setApplyOpen(false);
            },
        });
    };

    const toggleLike = () => {
        setLiking(true);
        router.post(
            projectsLike({ project: project.id }).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setLiking(false),
            },
        );
    };

    const description = useMemo(
        () => project.description ?? 'No description yet.',
        [project],
    );
    const descriptionTruncated =
        showFullDescription || description.length <= 420
            ? description
            : `${description.slice(0, 420)}⋯`;

    return (
        <>
            <Head title={project.title} />
            <main className="bg-background min-h-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Back link */}
                    <Link
                        href={projectsIndex({}).url}
                        className="group text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-bold"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                        Back to projects
                    </Link>

                    {/* Hero */}
                    <div className="premium-shadow animate-fade-in-up relative mt-4 overflow-hidden rounded-3xl">
                        <div className={cn('absolute inset-0', gradient)}>
                            <div className="absolute -top-16 -right-10 size-64 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute -bottom-24 -left-12 size-80 rounded-full bg-black/10 blur-3xl" />
                        </div>

                        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'gap-1.5 border-white/25 bg-white/10 text-white backdrop-blur-sm',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'size-1.5 rounded-full',
                                            status.dot,
                                        )}
                                    />
                                    {status.label}
                                </Badge>
                                {project.organisation.name && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/15 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                                        <BriefcaseBusiness className="size-3.5" />
                                        {project.organisation.name}
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                {project.title}
                            </h1>

                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-white/85">
                                {project.location && (
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                                        <MapPin className="size-4" />
                                        {project.location}
                                    </span>
                                )}
                                {project.start_date && (
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                                        <CalendarDays className="size-4" />
                                        {project.start_date}
                                        {project.end_date
                                            ? ` — ${project.end_date}`
                                            : ''}
                                    </span>
                                )}
                                {project.positions > 0 && (
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                                        <UsersRound className="size-4" />
                                        {project.positions_filled} of{' '}
                                        {project.positions} positions filled
                                    </span>
                                )}
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Button
                                    size="lg"
                                    className="text-harbor-900 hover:bg-sand-100 rounded-xl bg-white shadow-lg"
                                    onClick={() =>
                                        canApply
                                            ? setApplyOpen(true)
                                            : project.is_own_project
                                              ? router.visit(dashboard().url)
                                              : undefined
                                    }
                                    disabled={
                                        !canApply && !project.is_own_project
                                    }
                                >
                                    {canApply ? (
                                        <>
                                            <Send className="size-4" />
                                            Apply now
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-4" />
                                            {application?.label ??
                                                (project.is_own_project
                                                    ? 'Your project'
                                                    : 'Unavailable')}
                                        </>
                                    )}
                                </Button>

                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="rounded-xl bg-black/15 text-white backdrop-blur-sm hover:bg-black/25 hover:text-white"
                                    onClick={toggleLike}
                                    disabled={liking}
                                >
                                    <Heart
                                        className={cn(
                                            'size-4 transition-colors',
                                            project.liked_by_me &&
                                                'text-sienna-300 fill-current',
                                        )}
                                    />
                                    {project.liked_by_me ? 'Liked' : 'Save'}
                                    <span className="ml-0.5 text-xs font-bold text-white/70">
                                        {project.likes_count}
                                    </span>
                                </Button>
                            </div>
                        </div>

                        {/* Bottom fade into page background */}
                        <div className="to-background/60 relative h-6 bg-gradient-to-b from-transparent" />
                    </div>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                        {/* Left column */}
                        <div className="space-y-6">
                            {/* About */}
                            <section className="glass-card animate-fade-in-up rounded-2xl p-5 sm:p-7">
                                <SectionHeader
                                    eyebrow="Overview"
                                    title="About this project"
                                    description="What you'd be part of"
                                    icon={BookOpen}
                                />
                                <p className="text-foreground/85 mt-5 text-sm leading-relaxed sm:text-base">
                                    {descriptionTruncated}
                                </p>
                                {description.length > 420 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowFullDescription((v) => !v)
                                        }
                                        className="text-sienna hover:text-sienna-600 dark:text-sienna-300 dark:hover:text-sienna-200 mt-3 inline-flex items-center gap-1 text-xs font-bold"
                                    >
                                        {showFullDescription
                                            ? 'Show less'
                                            : 'Show more'}
                                        {showFullDescription ? (
                                            <ChevronUp className="size-3.5" />
                                        ) : (
                                            <ChevronDown className="size-3.5" />
                                        )}
                                    </button>
                                )}
                            </section>

                            {/* Skills */}
                            <section className="glass-card animate-fade-in-up rounded-2xl p-5 sm:p-7">
                                <SectionHeader
                                    eyebrow="Requirements"
                                    title="Skills you'll contribute"
                                    description="We're looking for people who bring these"
                                    icon={Sparkles}
                                    tone="text-amber-600 dark:text-amber-300"
                                />
                                {project.skills.length > 0 ? (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {project.skills.map((skill) => {
                                            const hasIt = false;
                                            return (
                                                <span
                                                    key={skill}
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold',
                                                        hasIt
                                                            ? 'border-moss-600 bg-moss-100 text-moss-700 dark:border-moss-500/40 dark:bg-moss-900/40 dark:text-moss-300'
                                                            : 'border-border bg-secondary/60 text-foreground/80',
                                                    )}
                                                >
                                                    <Sparkles className="size-3 text-amber-500 dark:text-amber-400" />
                                                    {skill}
                                                </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground mt-5 text-sm">
                                        No specific skills listed — enthusiasm
                                        welcome.
                                    </p>
                                )}
                            </section>

                            {/* Timeline */}
                            <section className="glass-card animate-fade-in-up rounded-2xl p-5 sm:p-7">
                                <SectionHeader
                                    eyebrow="Schedule"
                                    title="Project timeline"
                                    description="When this project runs"
                                    icon={CalendarDays}
                                    tone="text-harbor-600 dark:text-harbor-300"
                                />
                                <div className="mt-5">
                                    <Timeline
                                        start={project.start_date}
                                        end={project.end_date}
                                        duration={project.duration_days}
                                    />
                                </div>
                            </section>

                            {/* Team */}
                            {project.participants.length > 0 && (
                                <section className="glass-card animate-fade-in-up rounded-2xl p-5 sm:p-7">
                                    <SectionHeader
                                        eyebrow="People"
                                        title="Already on board"
                                        description="People working on this project"
                                        icon={UsersRound}
                                        tone="text-moss-600 dark:text-moss-300"
                                    />
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {project.participants.map((p) => (
                                            <div
                                                key={p.id}
                                                className="border-border/60 bg-background/40 flex items-center gap-3 rounded-xl border p-3"
                                            >
                                                <Avatar name={p.name} />
                                                <div className="min-w-0">
                                                    <p className="text-foreground truncate text-sm font-bold">
                                                        {p.name}
                                                    </p>
                                                    <p className="text-muted-foreground truncate text-xs">
                                                        {p.role ??
                                                            'Participant'}
                                                        {p.joined_at
                                                            ? ` · joined ${p.joined_at}`
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right column */}
                        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                            {/* Application / match card */}
                            <div className="glass-card animate-fade-in-up rounded-2xl p-5 sm:p-6">
                                <p className="text-sienna dark:text-sienna-300 text-xs font-bold tracking-widest uppercase">
                                    Your fit
                                </p>
                                <div className="mt-4">
                                    <MatchRing match={project.match} />
                                </div>

                                <div className="border-border mt-6 border-t pt-5">
                                    {project.is_own_project ? (
                                        <div className="bg-moss-100 text-moss-700 dark:bg-moss-900/40 dark:text-moss-300 flex items-center gap-2 rounded-xl px-3.5 py-3 text-xs font-semibold">
                                            <CheckCircle2 className="size-4 shrink-0" />
                                            You created this project.
                                        </div>
                                    ) : application ? (
                                        <div>
                                            <Badge
                                                className={cn(
                                                    'w-full justify-center py-2',
                                                    application.className,
                                                )}
                                            >
                                                {application.label}
                                            </Badge>
                                            {project.cover_letter && (
                                                <div className="border-border/70 bg-background/40 mt-4 rounded-xl border p-3.5">
                                                    <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                                                        Your cover letter
                                                    </p>
                                                    <p className="text-foreground/80 mt-1.5 max-h-32 overflow-y-auto text-xs leading-relaxed">
                                                        {project.cover_letter}
                                                    </p>
                                                </div>
                                            )}
                                            {project.application_status ===
                                                'rejected' &&
                                                canApply && (
                                                    <Button
                                                        className="mt-4 w-full rounded-xl"
                                                        onClick={() =>
                                                            setApplyOpen(true)
                                                        }
                                                    >
                                                        <Send className="size-4" />
                                                        Apply again
                                                    </Button>
                                                )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Button
                                                className="w-full rounded-xl"
                                                size="lg"
                                                onClick={() =>
                                                    setApplyOpen(true)
                                                }
                                            >
                                                <Send className="size-4" />
                                                Apply for this project
                                            </Button>
                                            <p className="text-muted-foreground text-center text-[11px] leading-relaxed">
                                                Applications are reviewed by the
                                                project organiser.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="animate-fade-in-up grid grid-cols-3 gap-3">
                                <div className="glass-card rounded-2xl px-3 py-4 text-center">
                                    <p className="text-foreground text-xl font-extrabold">
                                        {project.positions -
                                            project.positions_filled}
                                    </p>
                                    <p className="text-muted-foreground mt-0.5 text-[10px] font-bold tracking-wider uppercase">
                                        Open slots
                                    </p>
                                </div>
                                <div className="glass-card rounded-2xl px-3 py-4 text-center">
                                    <p className="text-foreground text-xl font-extrabold">
                                        {project.duration_days ?? '—'}
                                    </p>
                                    <p className="text-muted-foreground mt-0.5 text-[10px] font-bold tracking-wider uppercase">
                                        Days long
                                    </p>
                                </div>
                                <div className="glass-card rounded-2xl px-3 py-4 text-center">
                                    <p className="text-foreground text-xl font-extrabold">
                                        {project.likes_count}
                                    </p>
                                    <p className="text-muted-foreground mt-0.5 text-[10px] font-bold tracking-wider uppercase">
                                        Likes
                                    </p>
                                </div>
                            </div>

                            {/* Positions progress */}
                            <div className="glass-card animate-fade-in-up rounded-2xl p-5 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-moss dark:text-moss-300 text-xs font-bold tracking-widest uppercase">
                                        Slots filled
                                    </p>
                                    <span className="text-foreground text-xs font-extrabold">
                                        {filledPercent}%
                                    </span>
                                </div>
                                <div className="bg-muted mt-3 h-2.5 overflow-hidden rounded-full">
                                    <div
                                        className={cn(
                                            'h-full rounded-full bg-gradient-to-r',
                                            gradient,
                                        )}
                                        style={{ width: `${filledPercent}%` }}
                                    />
                                </div>
                                <div className="text-muted-foreground mt-3 flex items-center justify-between text-[11px] font-semibold">
                                    <span>
                                        {project.positions_filled} placed
                                    </span>
                                    <span>{project.positions} total</span>
                                </div>
                            </div>

                            {/* Organisation */}
                            <div className="glass-card animate-fade-in-up rounded-2xl p-5 sm:p-6">
                                <p className="text-harbor dark:text-harbor-300 text-xs font-bold tracking-widest uppercase">
                                    Organisation
                                </p>
                                <div className="mt-4 flex items-center gap-3">
                                    <span className="bg-secondary text-harbor dark:bg-harbor-900/40 dark:text-harbor-300 flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold">
                                        {project.organisation.name
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-foreground truncate text-base font-extrabold">
                                            {project.organisation.name}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            Project organiser
                                        </p>
                                    </div>
                                </div>
                                {project.organisation.description && (
                                    <p className="text-muted-foreground mt-4 line-clamp-3 text-xs leading-relaxed">
                                        {project.organisation.description}
                                    </p>
                                )}
                                <div className="border-border mt-4 space-y-2 border-t pt-4">
                                    {project.organisation.email && (
                                        <a
                                            href={`mailto:${project.organisation.email}`}
                                            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-semibold"
                                        >
                                            <Mail className="text-sienna dark:text-sienna-300 size-3.5" />
                                            <span className="truncate">
                                                {project.organisation.email}
                                            </span>
                                        </a>
                                    )}
                                    {project.organisation.website && (
                                        <a
                                            href={project.organisation.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-semibold"
                                        >
                                            <Globe className="text-moss dark:text-moss-300 size-3.5" />
                                            <span className="truncate">
                                                {project.organisation.website}
                                            </span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Apply dialog */}
                    <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
                                    <span
                                        className={cn(
                                            'bg-secondary text-sienna dark:text-sienna-300 flex size-8 items-center justify-center rounded-lg',
                                        )}
                                    >
                                        <Send className="size-4" />
                                    </span>
                                    Apply to {project.title}
                                </DialogTitle>
                                <DialogDescription>
                                    Tell the organiser why you'd be a great fit.
                                    This is your chance to stand out.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {project.skills.slice(0, 6).map((skill) => (
                                        <span
                                            key={skill}
                                            className="border-border bg-secondary/60 text-foreground/80 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold"
                                        >
                                            <Sparkles className="size-3 text-amber-500 dark:text-amber-400" />
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div className="grid w-full gap-2">
                                    <label
                                        htmlFor="cover-letter"
                                        className="text-muted-foreground text-xs font-bold"
                                    >
                                        Cover letter{' '}
                                        <span className="text-muted-foreground/60 font-semibold">
                                            (optional)
                                        </span>
                                    </label>
                                    <textarea
                                        id="cover-letter"
                                        rows={5}
                                        value={applyingTo.data.cover_letter}
                                        onChange={(e) =>
                                            applyingTo.setData(
                                                'cover_letter',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="I'd love to join because…"
                                        className="border-border bg-background ring-sienna/40 placeholder:text-muted-foreground/60 focus-visible:border-sienna min-h-28 w-full resize-none rounded-xl px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2"
                                    />
                                    <p className="text-muted-foreground text-[11px]">
                                        {applyingTo.data.cover_letter.length}
                                        /2000
                                    </p>
                                </div>

                                {applyingTo.errors.cover_letter && (
                                    <p className="text-sienna text-xs font-semibold">
                                        {applyingTo.errors.cover_letter}
                                    </p>
                                )}

                                <Button
                                    type="button"
                                    className="w-full rounded-xl"
                                    size="lg"
                                    onClick={submitApplication}
                                    disabled={applyingTo.processing}
                                >
                                    {applyingTo.processing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Submitting…
                                        </span>
                                    ) : (
                                        <>
                                            <Send className="size-4" />
                                            Submit application
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
        </>
    );
}

ShowProject.layout = {
    breadcrumbs: [
        { title: 'Workspace', href: dashboard().url },
        { title: 'Discover projects', href: projectsIndex({}).url },
        { title: 'Project details', href: '#' },
    ],
};
