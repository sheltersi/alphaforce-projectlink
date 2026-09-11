import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    Bell,
    Bookmark,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Compass,
    FileText,
    MapPin,
    MoreHorizontal,
    Plus,
    Send,
    Sparkles,
    Target,
    TrendingUp,
    UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { dashboard } from "@/routes";

const opportunities = [
    {
        title: "Community Digital Access",
        organisation: "Ubuntu Future Foundation",
        type: "Hybrid · Cape Town",
        match: "94% match",
        skills: ["Research", "Community"],
        gradient: "bg-gradient-to-br from-sienna-500 to-sienna-700 dark:from-sienna-600 dark:to-sienna-800",
    },
    {
        title: "Youth Employability Lab",
        organisation: "BrightPath Collective",
        type: "Remote · South Africa",
        match: "88% match",
        skills: ["Facilitation", "Data"],
        gradient: "bg-gradient-to-br from-moss-500 to-moss-700 dark:from-moss-600 dark:to-moss-800",
    },
    {
        title: "Local Food Systems Map",
        organisation: "Groundwork Network",
        type: "On-site · Johannesburg",
        match: "82% match",
        skills: ["Mapping", "Research"],
        gradient: "bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800",
    },
];

function Sparkline({ id }: { id: string }) {
    const points = "0,20 10,15 20,18 30,10 40,14 50,8 60,12 70,6 80,10 90,4 100,8";
    return (
        <svg viewBox="0 0 100 24" className="h-8 w-full overflow-visible text-foreground/30" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`sparklineGrad-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
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
            className="glass-card premium-shadow-hover group relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="relative z-10">
                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
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
                <p className="text-xs font-medium text-muted-foreground">{note}</p>
                {trend && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-moss-100 px-2 py-0.5 text-[10px] font-bold text-moss-600 dark:bg-moss-800/40 dark:text-moss-300">
                        <TrendingUp className="size-3" />
                        {trend}
                    </span>
                )}
            </div>
            <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-current opacity-[0.03]" />
        </div>
    );
}

function ActivityDot({ color }: { color: string }) {
    return (
        <span className="relative flex size-2.5">
            <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${color}`} />
            <span className={`relative inline-flex size-2.5 rounded-full ${color}`} />
        </span>
    );
}

export default function Dashboard() {
    const { auth } = usePage().props as unknown as {
        auth: { user: { name?: string } | null };
    };
    const [saved, setSaved] = useState<string | null>(null);
    const firstName = useMemo(
        () => auth.user?.name?.trim().split(/\s+/)[0] || "there",
        [auth.user?.name],
    );

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <>
            <Head title="Your workspace" />
            <main className="min-h-full bg-background px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end animate-fade-in-up">
                        <div>
                            <p className="text-sm font-bold text-sienna dark:text-sienna-300">
                                {today}
                            </p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                Good morning, {firstName}.
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Here&apos;s a clear view of your ProjectLink journey.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                aria-label="View notifications"
                                className="relative flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-all duration-300 hover:border-sienna/40 hover:text-sienna hover:shadow-md"
                            >
                                <Bell className="size-5" />
                                <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-sienna ring-2 ring-card" />
                            </button>
                            <a
                                href="#opportunities"
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-harbor px-5 text-sm font-bold text-white shadow-lg shadow-harbor/20 transition-all duration-300 hover:bg-harbor-700 hover:shadow-xl hover:shadow-harbor/25 hover:-translate-y-0.5 dark:bg-harbor-600 dark:hover:bg-harbor-500"
                            >
                                <Compass className="size-4" />
                                Explore projects
                            </a>
                        </div>
                    </div>

                    {/* Hero Banner */}
                    <section
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-harbor via-harbor-600 to-harbor-800 px-5 py-6 text-white shadow-2xl shadow-harbor/20 sm:px-8 sm:py-8 animate-fade-in-up stagger-1"
                    >
                        {/* Animated background orbs */}
                        <div className="absolute -top-24 -right-12 size-72 rounded-full bg-amber/15 blur-3xl animate-float-soft" />
                        <div className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-sienna/20 blur-3xl animate-float-soft-delayed" />
                        <div className="absolute top-1/2 left-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-clay/10 blur-3xl" />

                        <div className="relative grid gap-7 lg:grid-cols-[1fr_320px] lg:items-center">
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-sand-100 backdrop-blur-sm border border-white/10">
                                    <Sparkles className="size-3.5 text-amber-200" />
                                    Your profile is ready to shine
                                </span>
                                <h2 className="mt-4 max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">
                                    Find a project where your strengths can make
                                    a real difference.
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-relaxed text-harbor-100/80">
                                    We&apos;ve surfaced opportunities that align with
                                    your profile, experience, and interests.
                                </p>
                                <a
                                    href="#opportunities"
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-amber-200 transition-colors hover:text-white"
                                >
                                    View recommended projects
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold tracking-wide text-harbor-100/80 uppercase">
                                        Profile strength
                                    </span>
                                    <span className="text-sm font-extrabold text-amber-200">
                                        84%
                                    </span>
                                </div>
                                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                                    <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-amber to-clay-300 shadow-[0_0_12px_rgba(213,127,63,0.4)]" />
                                </div>
                                <p className="mt-3 text-xs leading-relaxed text-harbor-100/70">
                                    Add a current CV to improve your visibility
                                    to project teams.
                                </p>
                                <Link
                                    href="/onboarding/build-profile?step=5"
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white underline decoration-amber underline-offset-4 transition-colors hover:text-amber-200"
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
                                className="glass-card premium-shadow-hover rounded-2xl p-5 sm:p-6 animate-fade-in-up stagger-2"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold tracking-widest text-sienna dark:text-sienna-300 uppercase">
                                            In progress
                                        </p>
                                        <h2 className="mt-1 text-xl font-extrabold text-foreground">
                                            Community Impact Research
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            with Ubuntu Future Foundation
                                        </p>
                                    </div>
                                    <button
                                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                        aria-label="Project options"
                                    >
                                        <MoreHorizontal className="size-5" />
                                    </button>
                                </div>
                                <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                                            <span>Project progress</span>
                                            <span className="text-foreground">68%</span>
                                        </div>
                                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                                            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-moss to-moss-300 shadow-[0_0_8px_rgba(107,111,60,0.3)]" />
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDays className="size-3.5 text-sienna dark:text-sienna-300" />
                                                Ends 30 Sep 2026
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <UsersRound className="size-3.5 text-sienna dark:text-sienna-300" />
                                                8 team members
                                            </span>
                                        </div>
                                    </div>
                                    <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground transition-all duration-300 hover:border-foreground/20 hover:bg-accent hover:-translate-y-0.5">
                                        Open workspace
                                        <ArrowRight className="size-4" />
                                    </button>
                                </div>
                            </section>

                            {/* Opportunities Section */}
                            <section id="opportunities" className="scroll-mt-6 animate-fade-in-up stagger-3">
                                <div className="mb-4 flex items-end justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-foreground">
                                            Recommended for you
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Based on the skills in your profile.
                                        </p>
                                    </div>
                                    <a
                                        href="#opportunities"
                                        className="hidden text-sm font-bold text-sienna dark:text-sienna-300 sm:inline-flex sm:items-center sm:gap-1 transition-colors hover:text-sienna-600 dark:hover:text-sienna-200"
                                    >
                                        See all
                                        <ChevronRight className="size-4" />
                                    </a>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {opportunities.map((opportunity, idx) => (
                                        <article
                                            key={opportunity.title}
                                            className="glass-card premium-shadow-hover group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 animate-fade-in-up"
                                            style={{ animationDelay: `${idx * 50}ms` }}
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
                                                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-sienna"
                                                    aria-label={`Save ${opportunity.title}`}
                                                >
                                                    <Bookmark
                                                        className={`size-4 transition-colors ${saved === opportunity.title ? "fill-sienna text-sienna" : ""}`}
                                                    />
                                                </button>
                                            </div>
                                            <p className="mt-4 text-[11px] font-extrabold tracking-wide text-moss dark:text-moss-300 uppercase">
                                                {opportunity.match}
                                            </p>
                                            <h3 className="mt-1 text-[15px] font-extrabold leading-snug text-foreground">
                                                {opportunity.title}
                                            </h3>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {opportunity.organisation}
                                            </p>
                                            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <MapPin className="size-3.5 text-sienna dark:text-sienna-300" />
                                                {opportunity.type}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {opportunity.skills.map(
                                                    (skill) => (
                                                        <span
                                                            key={skill}
                                                            className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-secondary-foreground"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                            <button className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-sienna dark:text-sienna-300 transition-colors hover:text-sienna-600 dark:hover:text-sienna-200">
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
                                className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-2"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="font-extrabold text-foreground">
                                        Your applications
                                    </h2>
                                    <FileText className="size-4 text-sienna dark:text-sienna-300" />
                                </div>
                                <div className="mt-5 space-y-4">
                                    <div className="group relative overflow-hidden rounded-xl border-l-2 border-amber bg-accent/50 p-3 transition-colors hover:bg-accent">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">
                                                    Climate Action Toolkit
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Submitted 2 days ago
                                                </p>
                                            </div>
                                            <ActivityDot color="bg-amber" />
                                        </div>
                                        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 dark:bg-amber-700/30 dark:text-amber-300">
                                            Under review
                                        </span>
                                    </div>
                                    <div className="group relative overflow-hidden rounded-xl border-l-2 border-moss bg-accent/50 p-3 transition-colors hover:bg-accent">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">
                                                    Neighbourhood Stories
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Submitted 8 Sep 2026
                                                </p>
                                            </div>
                                            <ActivityDot color="bg-moss" />
                                        </div>
                                        <span className="mt-2 inline-flex rounded-full bg-moss-100 px-2.5 py-1 text-[10px] font-extrabold text-moss-700 dark:bg-moss-800/40 dark:text-moss-300">
                                            Shortlisted
                                        </span>
                                    </div>
                                </div>
                                <button className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition-all duration-300 hover:bg-secondary/80 hover:-translate-y-0.5">
                                    View all applications
                                    <ChevronRight className="size-3.5" />
                                </button>
                            </section>

                            {/* Calendar */}
                            <section
                                id="timesheets"
                                className="glass-card rounded-2xl p-5 animate-fade-in-up stagger-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-extrabold text-foreground">
                                            This week
                                        </h2>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Your upcoming moments
                                        </p>
                                    </div>
                                    <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <div className="mt-5 space-y-4">
                                    <div className="flex gap-3 group">
                                        <div className="flex w-11 flex-col items-center justify-center rounded-xl bg-sienna-100 py-2 dark:bg-sienna-800/30">
                                            <p className="text-[10px] font-bold text-sienna dark:text-sienna-300 uppercase">
                                                Fri
                                            </p>
                                            <p className="text-lg font-extrabold text-foreground">
                                                11
                                            </p>
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center border-l border-border pl-3">
                                            <p className="text-sm font-bold text-foreground">
                                                Research team check-in
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                10:00 · Online
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 group">
                                        <div className="flex w-11 flex-col items-center justify-center rounded-xl bg-clay-100 py-2 dark:bg-clay-700/30">
                                            <p className="text-[10px] font-bold text-clay-600 dark:text-clay-300 uppercase">
                                                Mon
                                            </p>
                                            <p className="text-lg font-extrabold text-foreground">
                                                14
                                            </p>
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center border-l border-border pl-3">
                                            <p className="text-sm font-bold text-foreground">
                                                Timesheet due
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Submit 6.5 hours
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* CTA Card */}
                            <section
                                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sienna-500 via-sienna-600 to-sienna-800 p-5 text-white animate-fade-in-up stagger-4"
                            >
                                <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white/5 blur-2xl" />
                                <div className="absolute -bottom-8 -left-8 size-28 rounded-full bg-amber/10 blur-2xl" />
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
                </div>
            </main>
        </>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: "Dashboard", href: dashboard() }] };
