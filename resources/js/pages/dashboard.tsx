import {
    ArrowRight,
    BarChart3,
    Bell,
    Bookmark,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Circle,
    Clock3,
    Compass,
    FileText,
    Flag,
    HelpCircle,
    LifeBuoy,
    MapPin,
    MessageCircle,
    MoreHorizontal,
    Plus,
    Send,
    Sparkles,
    Target,
    TrendingUp,
    UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { dashboard } from '@/routes';
import { index as projectsIndex } from '@/routes/projects';
import { Head, Link, usePage } from '@inertiajs/react';

const opportunities = [
    {
        title: 'Community Digital Access',
        organisation: 'Ubuntu Future Foundation',
        type: 'Hybrid · Cape Town',
        match: '94% match',
        skills: ['Research', 'Community'],
        gradient:
            'bg-gradient-to-br from-sienna-500 to-sienna-700 dark:from-sienna-600 dark:to-sienna-800',
    },
    {
        title: 'Youth Employability Lab',
        organisation: 'BrightPath Collective',
        type: 'Remote · South Africa',
        match: '88% match',
        skills: ['Facilitation', 'Data'],
        gradient:
            'bg-gradient-to-br from-moss-500 to-moss-700 dark:from-moss-600 dark:to-moss-800',
    },
    {
        title: 'Local Food Systems Map',
        organisation: 'Groundwork Network',
        type: 'On-site · Johannesburg',
        match: '82% match',
        skills: ['Mapping', 'Research'],
        gradient:
            'bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800',
    },
];

function Sparkline({ id }: { id: string }) {
    const points =
        '0,20 10,15 20,18 30,10 40,14 50,8 60,12 70,6 80,10 90,4 100,8';
    return (
        <svg
            viewBox="0 0 100 24"
            className="text-foreground/30 h-8 w-full overflow-visible"
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient
                    id={`sparklineGrad-${id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.4"
                    />
                    <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                    />
                </linearGradient>
            </defs>
            <polygon
                points={`0,24 ${points} 100,24`}
                fill={`url(#sparklineGrad-${id})`}
            />
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
            />
        </svg>
    );
}

function StatCard({
    label,
    value,
    note,
    icon: Icon,
    tone,
    trend,
    delay,
}: {
    label: string;
    value: string;
    note: string;
    icon: typeof Compass;
    tone: string;
    trend?: string;
    delay: number;
}) {
    const id = label.toLowerCase().replace(/\s+/g, '-');
    return (
        <div
            className="glass-card premium-shadow-hover group animate-fade-in-up relative overflow-hidden rounded-2xl p-5 sm:p-6"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="relative z-10">
                    <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                        {label}
                    </p>
                    <p className="text-foreground mt-2 text-3xl font-extrabold tracking-tight">
                        {value}
                    </p>
                </div>
                <span
                    className={`flex size-11 items-center justify-center rounded-xl ${tone} shadow-lg`}
                >
                    <Icon className="size-5 text-white" />
                </span>
            </div>
            <div className="relative z-10 mt-4">
                <Sparkline id={id} />
            </div>
            <div className="relative z-10 mt-3 flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">
                    {note}
                </p>
                {trend && (
                    <span className="bg-moss-100 text-moss-600 dark:bg-moss-800/40 dark:text-moss-300 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold">
                        <TrendingUp className="size-3" />
                        {trend}
                    </span>
                )}
            </div>
            <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-current opacity-[0.03]" />
        </div>
    );
}

function ActivityDot({ color }: { color: string }) {
    return (
        <span className="relative flex size-2.5">
            <span
                className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${color}`}
            />
            <span
                className={`relative inline-flex size-2.5 rounded-full ${color}`}
            />
        </span>
    );
}

const weeklyActivity = [
    { day: 'Mon', value: 42 },
    { day: 'Tue', value: 68 },
    { day: 'Wed', value: 55 },
    { day: 'Thu', value: 82 },
    { day: 'Fri', value: 74 },
    { day: 'Sat', value: 30 },
    { day: 'Sun', value: 58 },
];

function WeeklyChart() {
    const max = Math.max(...weeklyActivity.map((d) => d.value));
    return (
        <div className="flex h-32 items-end justify-between gap-2 sm:gap-3">
            {weeklyActivity.map((d, i) => (
                <div
                    key={d.day}
                    className="flex flex-1 flex-col items-center gap-2"
                >
                    <div className="flex w-full flex-1 items-end">
                        <div
                            className={`w-full rounded-lg transition-all duration-700 ${
                                i === 3
                                    ? 'from-sienna-600 to-sienna-400 dark:from-sienna-700 dark:to-sienna-400 bg-gradient-to-t'
                                    : 'bg-muted'
                            }`}
                            style={{
                                height: `${Math.max((d.value / max) * 100, 8)}%`,
                            }}
                        />
                    </div>
                    <span className="text-muted-foreground text-[10px] font-bold uppercase">
                        {d.day}
                    </span>
                </div>
            ))}
        </div>
    );
}

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
    icon: typeof BarChart3;
    tone?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
                {Icon && (
                    <span
                        className={`bg-secondary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${tone}`}
                    >
                        <Icon className="size-[18px]" />
                    </span>
                )}
                <div>
                    <p
                        className={`text-xs font-bold tracking-widest uppercase ${tone}`}
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
        </div>
    );
}

const initialTasks = [
    { id: 1, title: 'Revise data collection notes', meta: 'Due today · 2h' },
    { id: 2, title: 'Attend team check-in', meta: 'Today 10:00 · Online' },
    { id: 3, title: 'Submit timesheet', meta: 'Due Mon · 6.5h' },
    { id: 4, title: 'Reply to Hannah about fieldwork', meta: '2 new messages' },
];

function TasksCard() {
    const [tasks, setTasks] = useState(
        initialTasks.map((t) => ({ ...t, done: false })),
    );
    const doneCount = tasks.filter((t) => t.done).length;

    return (
        <section
            id="tasks"
            className="glass-card animate-fade-in-up scroll-mt-6 rounded-2xl p-5 sm:p-6"
        >
            <div className="flex items-center justify-between">
                <SectionHeader
                    eyebrow="To do"
                    title="Today's tasks"
                    icon={Flag}
                    tone="text-sienna dark:text-sienna-300"
                />
                <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-xs font-bold">
                    {doneCount}/{tasks.length}
                </span>
            </div>
            <div className="mt-5 space-y-1.5">
                {tasks.map((task) => (
                    <button
                        key={task.id}
                        onClick={() =>
                            setTasks((prev) =>
                                prev.map((t) =>
                                    t.id === task.id
                                        ? { ...t, done: !t.done }
                                        : t,
                                ),
                            )
                        }
                        className={`group hover:bg-accent/60 flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors ${task.done ? 'opacity-60' : ''}`}
                    >
                        {task.done ? (
                            <span className="bg-moss-500 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white shadow-sm">
                                <Check className="size-3" strokeWidth={3} />
                            </span>
                        ) : (
                            <Circle className="text-muted-foreground/50 group-hover:text-sienna mt-0.5 size-5 shrink-0 transition-colors" />
                        )}
                        <span>
                            <span
                                className={`text-foreground block text-sm font-bold ${task.done ? 'line-through' : ''}`}
                            >
                                {task.title}
                            </span>
                            <span className="text-muted-foreground mt-0.5 block text-xs">
                                {task.meta}
                            </span>
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}

const messages = [
    {
        name: 'Hannah van Wyk',
        initials: 'HV',
        preview: 'Hi! Could you send through the fieldwork…',
        time: '2m',
        unread: true,
    },
    {
        name: 'Project Starter Kit',
        initials: 'PS',
        preview: 'Your profile scored 84% — check the…',
        time: '1h',
        unread: false,
    },
    {
        name: 'Charles Ndlovu',
        initials: 'CN',
        preview: 'Great session today, see you Friday.',
        time: '3h',
        unread: false,
    },
];

function MessagesCard() {
    return (
        <section
            id="messages"
            className="glass-card animate-fade-in-up scroll-mt-6 rounded-2xl p-5 sm:p-6"
        >
            <SectionHeader
                eyebrow="Inbox"
                title="Messages"
                description="3 unread conversations"
                icon={MessageCircle}
                tone="text-moss-600 dark:text-moss-300"
            />
            <div className="mt-4 space-y-1">
                {messages.map((m) => (
                    <button
                        key={m.name}
                        className="hover:bg-accent/60 flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors"
                    >
                        <span className="from-sienna-500 to-sienna-700 flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white">
                            {m.initials}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                                <span className="text-foreground truncate text-sm font-bold">
                                    {m.name}
                                </span>
                                <span className="text-muted-foreground text-[10px] font-semibold">
                                    {m.time}
                                </span>
                            </span>
                            <span className="text-muted-foreground block truncate text-xs">
                                {m.preview}
                            </span>
                        </span>
                        {m.unread && (
                            <span className="bg-sienna size-2 shrink-0 rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}

const teamMembers = [
    { name: 'Zanele M.', initials: 'ZM' },
    { name: 'Bongani K.', initials: 'BK' },
    { name: 'Ayanda P.', initials: 'AP' },
    { name: 'Thabo S.', initials: 'TS' },
    { name: 'Lerato D.', initials: 'LD' },
];

function TeamCard() {
    return (
        <section
            id="team"
            className="glass-card animate-fade-in-up scroll-mt-6 rounded-2xl p-5 sm:p-6"
        >
            <SectionHeader
                eyebrow="Community"
                title="My team"
                description="8 members across 1 project"
                icon={UsersRound}
                tone="text-clay-600 dark:text-clay-300"
            />
            <div className="mt-5 flex items-center -space-x-3">
                {teamMembers.map((m) => (
                    <span
                        key={m.name}
                        title={m.name}
                        className="border-card from-harbor to-harbor-700 flex size-10 items-center justify-center rounded-full border-2 bg-gradient-to-br text-xs font-bold text-white"
                    >
                        {m.initials}
                    </span>
                ))}
                <span className="border-card bg-secondary text-secondary-foreground z-0 flex size-10 items-center justify-center rounded-full border-2 text-xs font-bold">
                    +3
                </span>
            </div>
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5">
                Manage team
                <ChevronRight className="size-3.5" />
            </button>
        </section>
    );
}

function NotificationsCard() {
    const { unreadNotificationsCount = 0 } = usePage().props as unknown as {
        unreadNotificationsCount?: number;
    };

    return (
        <section
            id="notifications"
            className="glass-card animate-fade-in-up scroll-mt-6 rounded-2xl p-5 sm:p-6"
        >
            <SectionHeader
                eyebrow="Updates"
                title="Notifications"
                description="Activity from your projects and applications"
                icon={Bell}
                tone="text-moss dark:text-moss-300"
            />
            <div className="mt-6 flex flex-col items-center justify-center gap-3 py-10 text-center">
                <div className="bg-muted/60 flex size-12 items-center justify-center rounded-full">
                    <Bell className="text-muted-foreground/50 size-6" />
                </div>
                <p className="text-foreground text-sm font-semibold">
                    {unreadNotificationsCount > 0
                        ? `${unreadNotificationsCount} unread ${unreadNotificationsCount === 1 ? 'notification' : 'notifications'}`
                        : 'All caught up'}
                </p>
                <p className="text-muted-foreground text-xs">
                    {unreadNotificationsCount > 0
                        ? 'You have updates waiting in your notification inbox.'
                        : 'We’ll let you know when something needs your attention.'}
                </p>
                <Link
                    href="/notifications"
                    className="text-sienna hover:text-sienna-700 mt-2 inline-flex items-center gap-1.5 text-xs font-bold transition"
                >
                    View notifications
                    <ChevronRight className="size-3.5" />
                </Link>
            </div>
        </section>
    );
}

function AnalyticsCard() {
    return (
        <section
            id="analytics"
            className="glass-card animate-fade-in-up scroll-mt-6 rounded-2xl p-5 sm:p-6"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionHeader
                    eyebrow="Insights"
                    title="Weekly activity"
                    description="Hours engaged across your projects"
                    icon={BarChart3}
                    tone="text-sienna dark:text-sienna-300"
                />
                <span className="bg-moss-100 text-moss-600 dark:bg-moss-800/40 dark:text-moss-300 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold">
                    <TrendingUp className="size-3" />
                    +18% vs last week
                </span>
            </div>
            <div className="mt-6">
                <WeeklyChart />
            </div>
            <div className="border-border mt-5 grid grid-cols-3 gap-3 border-t pt-4">
                {[
                    { label: 'Sessions', value: '14' },
                    { label: 'Hours', value: '32.5' },
                    { label: 'Streak', value: '7d' },
                ].map((s) => (
                    <div key={s.label} className="text-center">
                        <p className="text-foreground text-xl font-extrabold">
                            {s.value}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[10px] font-bold tracking-wider uppercase">
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function HelpCard() {
    return (
        <section
            id="help"
            className="glass-card animate-fade-in-up relative scroll-mt-6 overflow-hidden rounded-2xl p-5 sm:p-6"
        >
            <div className="bg-amber/10 absolute -top-10 -right-10 size-36 rounded-full blur-2xl" />
            <div className="relative">
                <SectionHeader
                    eyebrow="Support"
                    title="Need a hand?"
                    description="Resources to get you unstuck"
                    icon={LifeBuoy}
                    tone="text-sienna dark:text-sienna-300"
                />
                <div className="mt-4 space-y-2">
                    {[
                        {
                            icon: HelpCircle,
                            label: 'Getting started guide',
                            meta: '5 min read',
                        },
                        {
                            icon: FileText,
                            label: 'Timesheet how-to',
                            meta: 'Step by step',
                        },
                        {
                            icon: MessageCircle,
                            label: 'Contact support',
                            meta: 'Reply in 24h',
                        },
                    ].map((h) => (
                        <button
                            key={h.label}
                            className="hover:bg-accent/60 flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors"
                        >
                            <span className="bg-secondary flex size-8 shrink-0 items-center justify-center rounded-lg">
                                <h.icon className="text-sienna dark:text-sienna-300 size-4" />
                            </span>
                            <span className="flex-1">
                                <span className="text-foreground block text-sm font-bold">
                                    {h.label}
                                </span>
                                <span className="text-muted-foreground block text-[11px]">
                                    {h.meta}
                                </span>
                            </span>
                            <ChevronRight className="text-muted-foreground/50 size-4" />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Dashboard() {
    const { auth, canManageProjects } = usePage().props as unknown as {
        auth: { user: { name?: string } | null };
        canManageProjects: boolean;
    };
    const [saved, setSaved] = useState<string | null>(null);
    const firstName = useMemo(
        () => auth.user?.name?.trim().split(/\s+/)[0] || 'there',
        [auth.user?.name],
    );

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <>
            <Head title="Your workspace" />
            <main className="bg-background min-h-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="animate-fade-in-up mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sienna dark:text-sienna-300 text-sm font-bold">
                                {today}
                            </p>
                            <h1 className="text-foreground mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Good morning, {firstName}.
                            </h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Here&apos;s a clear view of your ProjectLink
                                journey.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                aria-label="View notifications"
                                className="border-border bg-card text-foreground hover:border-sienna/40 hover:text-sienna relative flex size-11 items-center justify-center rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md"
                            >
                                <Bell className="size-5" />
                                <span className="bg-sienna ring-card absolute top-2.5 right-2.5 size-2 rounded-full ring-2" />
                            </button>
                            <a
                                href={projectsIndex({}).url}
                                className="bg-harbor shadow-harbor/20 hover:bg-harbor-700 hover:shadow-harbor/25 dark:bg-harbor-600 dark:hover:bg-harbor-500 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                <Compass className="size-4" />
                                Explore projects
                            </a>
                        </div>
                    </div>

                    {/* Hero Banner */}
                    <section className="from-harbor via-harbor-600 to-harbor-800 shadow-harbor/20 animate-fade-in-up stagger-1 relative overflow-hidden rounded-3xl bg-gradient-to-br px-5 py-6 text-white shadow-2xl sm:px-8 sm:py-8">
                        {/* Animated background orbs */}
                        <div className="bg-amber/15 animate-float-soft absolute -top-24 -right-12 size-72 rounded-full blur-3xl" />
                        <div className="bg-sienna/20 animate-float-soft-delayed absolute -bottom-28 left-1/3 size-64 rounded-full blur-3xl" />
                        <div className="bg-clay/10 absolute top-1/2 left-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

                        <div className="relative grid gap-7 lg:grid-cols-[1fr_320px] lg:items-center">
                            <div>
                                <span className="text-sand-100 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                                    <Sparkles className="size-3.5 text-amber-200" />
                                    Your profile is ready to shine
                                </span>
                                <h2 className="mt-4 max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">
                                    Find a project where your strengths can make
                                    a real difference.
                                </h2>
                                <p className="text-harbor-100/80 mt-3 max-w-xl text-sm leading-relaxed">
                                    We&apos;ve surfaced opportunities that align
                                    with your profile, experience, and
                                    interests.
                                </p>
                                <a
                                    href={projectsIndex({}).url}
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-amber-200 transition-colors hover:text-white"
                                >
                                    View recommended projects
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-harbor-100/80 text-xs font-bold tracking-wide uppercase">
                                        Profile strength
                                    </span>
                                    <span className="text-sm font-extrabold text-amber-200">
                                        84%
                                    </span>
                                </div>
                                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                                    <div className="from-amber to-clay-300 h-full w-[84%] rounded-full bg-gradient-to-r shadow-[0_0_12px_rgba(213,127,63,0.4)]" />
                                </div>
                                <p className="text-harbor-100/70 mt-3 text-xs leading-relaxed">
                                    Add a current CV to improve your visibility
                                    to project teams.
                                </p>
                                <Link
                                    href="/onboarding/build-profile?step=5"
                                    className="decoration-amber mt-3 inline-flex items-center gap-1 text-xs font-bold text-white underline underline-offset-4 transition-colors hover:text-amber-200"
                                >
                                    Complete profile
                                    <ChevronRight className="size-3.5" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Stats Grid */}
                    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Project matches"
                            value="12"
                            note="3 new this week"
                            icon={Target}
                            tone="bg-gradient-to-br from-sienna-500 to-sienna-700 dark:from-sienna-600 dark:to-sienna-800"
                            trend="+12%"
                            delay={100}
                        />
                        <StatCard
                            label="Applications"
                            value="2"
                            note="1 awaiting review"
                            icon={Send}
                            tone="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800"
                            trend="+1"
                            delay={150}
                        />
                        <StatCard
                            label="Active projects"
                            value="1"
                            note="Next check-in: Friday"
                            icon={BriefcaseBusiness}
                            tone="bg-gradient-to-br from-moss-500 to-moss-700 dark:from-moss-600 dark:to-moss-800"
                            delay={200}
                        />
                        <StatCard
                            label="Hours this month"
                            value="18.5"
                            note="6.5 hours to submit"
                            icon={Clock3}
                            tone="bg-gradient-to-br from-clay-400 to-clay-600 dark:from-clay-600 dark:to-clay-800"
                            trend="On track"
                            delay={250}
                        />
                    </section>

                    {/* Main Content Grid */}
                    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="space-y-6">
                            {/* Active Project Card */}
                            <section
                                id="projects"
                                className="glass-card premium-shadow-hover animate-fade-in-up stagger-2 rounded-2xl p-5 sm:p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sienna dark:text-sienna-300 text-xs font-bold tracking-widest uppercase">
                                            In progress
                                        </p>
                                        <h2 className="text-foreground mt-1 text-xl font-extrabold">
                                            Community Impact Research
                                        </h2>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            with Ubuntu Future Foundation
                                        </p>
                                    </div>
                                    <button
                                        className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg p-1.5 transition-colors"
                                        aria-label="Project options"
                                    >
                                        <MoreHorizontal className="size-5" />
                                    </button>
                                </div>
                                <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                                    <div>
                                        <div className="text-muted-foreground flex items-center justify-between text-xs font-bold">
                                            <span>Project progress</span>
                                            <span className="text-foreground">
                                                68%
                                            </span>
                                        </div>
                                        <div className="bg-muted mt-2 h-2.5 overflow-hidden rounded-full">
                                            <div className="from-moss to-moss-300 h-full w-[68%] rounded-full bg-gradient-to-r shadow-[0_0_8px_rgba(107,111,60,0.3)]" />
                                        </div>
                                        <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium">
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDays className="text-sienna dark:text-sienna-300 size-3.5" />
                                                Ends 30 Sep 2026
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <UsersRound className="text-sienna dark:text-sienna-300 size-3.5" />
                                                8 team members
                                            </span>
                                        </div>
                                    </div>
                                    {canManageProjects && (
                                        <Link
                                            href={projectsIndex({}).url}
                                            className="border-border bg-background text-foreground hover:border-foreground/20 hover:bg-accent inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            View project details
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    )}
                                </div>
                            </section>

                            {/* Opportunities Section */}
                            <section
                                id="opportunities"
                                className="animate-fade-in-up stagger-3 scroll-mt-6"
                            >
                                <div className="mb-4 flex items-end justify-between gap-4">
                                    <div>
                                        <h2 className="text-foreground text-xl font-extrabold">
                                            Recommended for you
                                        </h2>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            Based on the skills in your profile.
                                        </p>
                                    </div>
                                    <a
                                        href={projectsIndex({}).url}
                                        className="text-sienna dark:text-sienna-300 hover:text-sienna-600 dark:hover:text-sienna-200 hidden text-sm font-bold transition-colors sm:inline-flex sm:items-center sm:gap-1"
                                    >
                                        See all
                                        <ChevronRight className="size-4" />
                                    </a>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {opportunities.map((opportunity, idx) => (
                                        <article
                                            key={opportunity.title}
                                            className="glass-card premium-shadow-hover group animate-fade-in-up relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
                                            style={{
                                                animationDelay: `${idx * 50}ms`,
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <span
                                                    className={`flex size-11 items-center justify-center rounded-xl ${opportunity.gradient} text-white shadow-lg`}
                                                >
                                                    <BriefcaseBusiness className="size-5" />
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setSaved(
                                                            saved ===
                                                                opportunity.title
                                                                ? null
                                                                : opportunity.title,
                                                        )
                                                    }
                                                    className="text-muted-foreground hover:bg-accent hover:text-sienna rounded-lg p-1.5 transition-colors"
                                                    aria-label={`Save ${opportunity.title}`}
                                                >
                                                    <Bookmark
                                                        className={`size-4 transition-colors ${saved === opportunity.title ? 'fill-sienna text-sienna' : ''}`}
                                                    />
                                                </button>
                                            </div>
                                            <p className="text-moss dark:text-moss-300 mt-4 text-[11px] font-extrabold tracking-wide uppercase">
                                                {opportunity.match}
                                            </p>
                                            <h3 className="text-foreground mt-1 text-[15px] leading-snug font-extrabold">
                                                {opportunity.title}
                                            </h3>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {opportunity.organisation}
                                            </p>
                                            <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs font-medium">
                                                <MapPin className="text-sienna dark:text-sienna-300 size-3.5" />
                                                {opportunity.type}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {opportunity.skills.map(
                                                    (skill) => (
                                                        <span
                                                            key={skill}
                                                            className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-[11px] font-bold"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                            <button className="text-sienna dark:text-sienna-300 hover:text-sienna-600 dark:hover:text-sienna-200 mt-4 inline-flex items-center gap-1 text-xs font-extrabold transition-colors">
                                                View project
                                                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-6">
                            {/* Applications */}
                            <section
                                id="applications"
                                className="glass-card animate-fade-in-up stagger-2 rounded-2xl p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-foreground font-extrabold">
                                        Your applications
                                    </h2>
                                    <FileText className="text-sienna dark:text-sienna-300 size-4" />
                                </div>
                                <div className="mt-5 space-y-4">
                                    <div className="group border-amber bg-accent/50 hover:bg-accent relative overflow-hidden rounded-xl border-l-2 p-3 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-foreground text-sm font-bold">
                                                    Climate Action Toolkit
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-xs">
                                                    Submitted 2 days ago
                                                </p>
                                            </div>
                                            <ActivityDot color="bg-amber" />
                                        </div>
                                        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-700/30 dark:text-amber-300">
                                            Under review
                                        </span>
                                    </div>
                                    <div className="group border-moss bg-accent/50 hover:bg-accent relative overflow-hidden rounded-xl border-l-2 p-3 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-foreground text-sm font-bold">
                                                    Neighbourhood Stories
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-xs">
                                                    Submitted 8 Sep 2026
                                                </p>
                                            </div>
                                            <ActivityDot color="bg-moss" />
                                        </div>
                                        <span className="bg-moss-100 text-moss-700 dark:bg-moss-800/40 dark:text-moss-300 mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold">
                                            Shortlisted
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href="/applications"
                                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    View all applications
                                    <ChevronRight className="size-3.5" />
                                </Link>
                            </section>

                            {/* Calendar */}
                            <section
                                id="timesheets"
                                className="glass-card animate-fade-in-up stagger-3 rounded-2xl p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-foreground font-extrabold">
                                            This week
                                        </h2>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            Your upcoming moments
                                        </p>
                                    </div>
                                    <button className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg p-1.5 transition-colors">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <div className="mt-5 space-y-4">
                                    <div className="group flex gap-3">
                                        <div className="bg-sienna-100 dark:bg-sienna-800/30 flex w-11 flex-col items-center justify-center rounded-xl py-2">
                                            <p className="text-sienna dark:text-sienna-300 text-[10px] font-bold uppercase">
                                                Fri
                                            </p>
                                            <p className="text-foreground text-lg font-extrabold">
                                                11
                                            </p>
                                        </div>
                                        <div className="border-border flex flex-1 flex-col justify-center border-l pl-3">
                                            <p className="text-foreground text-sm font-bold">
                                                Research team check-in
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                10:00 · Online
                                            </p>
                                        </div>
                                    </div>
                                    <div className="group flex gap-3">
                                        <div className="bg-clay-100 dark:bg-clay-700/30 flex w-11 flex-col items-center justify-center rounded-xl py-2">
                                            <p className="text-clay-600 dark:text-clay-300 text-[10px] font-bold uppercase">
                                                Mon
                                            </p>
                                            <p className="text-foreground text-lg font-extrabold">
                                                14
                                            </p>
                                        </div>
                                        <div className="border-border flex flex-1 flex-col justify-center border-l pl-3">
                                            <p className="text-foreground text-sm font-bold">
                                                Timesheet due
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                Submit 6.5 hours
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* CTA Card */}
                            <section className="border-border from-card via-card to-sand-50 animate-fade-in-up stagger-3 dark:to-harbor-950/30 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm">
                                <div className="bg-amber/10 absolute -top-8 -right-8 size-32 rounded-full blur-2xl" />
                                <div className="bg-sienna/10 absolute -bottom-10 -left-10 size-28 rounded-full blur-2xl" />
                                <div className="relative">
                                    <div className="from-sienna-500 to-sienna-700 shadow-sienna/20 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                                        <FileText className="size-5" />
                                    </div>
                                    <h2 className="text-foreground mt-3 font-extrabold">
                                        Digital Resume
                                    </h2>
                                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                        A beautifully formatted, printable view
                                        of your profile — share it with project
                                        managers in one click.
                                    </p>
                                    <Link
                                        href="/dashboard/resume"
                                        className="bg-sienna-600 shadow-sienna/20 hover:bg-sienna-700 mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                                    >
                                        View my resume
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                </div>
                            </section>

                            {/* CTA Card */}
                            <section className="from-sienna-500 via-sienna-600 to-sienna-800 animate-fade-in-up stagger-4 relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white">
                                <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white/5 blur-2xl" />
                                <div className="bg-amber/10 absolute -bottom-8 -left-8 size-28 rounded-full blur-2xl" />
                                <div className="relative">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                                        <CheckCircle2 className="size-5 text-amber-200" />
                                    </div>
                                    <h2 className="mt-3 font-extrabold">
                                        Keep building momentum
                                    </h2>
                                    <p className="mt-1 text-xs leading-relaxed text-white/70">
                                        A strong, current profile helps project
                                        managers find you.
                                    </p>
                                    <Link
                                        href="/onboarding/build-profile"
                                        className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-white underline decoration-amber-200 underline-offset-4 transition-colors hover:text-amber-200"
                                    >
                                        Review my profile
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                </div>
                            </section>
                        </aside>
                    </div>

                    <div className="mt-6">
                        <NotificationsCard />
                    </div>

                    {/* Analytics */}
                    <div className="animate-fade-in-up mt-6">
                        <AnalyticsCard />
                    </div>

                    {/* Tasks · Messages · Team · Help */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        <TasksCard />
                        <MessagesCard />
                        <TeamCard />
                        <HelpCard />
                    </div>
                </div>
            </main>
        </>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
