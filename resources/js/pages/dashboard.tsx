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
        colour: "bg-sienna",
    },
    {
        title: "Youth Employability Lab",
        organisation: "BrightPath Collective",
        type: "Remote · South Africa",
        match: "88% match",
        skills: ["Facilitation", "Data"],
        colour: "bg-moss",
    },
    {
        title: "Local Food Systems Map",
        organisation: "Groundwork Network",
        type: "On-site · Johannesburg",
        match: "82% match",
        skills: ["Mapping", "Research"],
        colour: "bg-amber",
    },
];

function StatCard({
    label,
    value,
    note,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    note: string;
    icon: typeof Compass;
    tone: string;
}) {
    return (
        <div className="rounded-2xl border border-harbor/10 bg-white p-4 shadow-[0_8px_24px_rgba(30,47,68,0.05)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold tracking-wide text-ember-400 uppercase">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-harbor">
                        {value}
                    </p>
                </div>
                <span
                    className={`flex size-10 items-center justify-center rounded-xl ${tone}`}
                >
                    <Icon className="size-5" />
                </span>
            </div>
            <p className="mt-3 text-xs font-medium text-ember-500">{note}</p>
        </div>
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
    return (
        <>
            <Head title="Your workspace" />
            <main className="min-h-full bg-sand-50 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-bold text-sienna">
                                Thursday, 10 September
                            </p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-harbor sm:text-4xl">
                                Good morning, {firstName}.
                            </h1>
                            <p className="mt-2 text-sm text-ember-500">
                                Here’s a clear view of your ProjectLink journey.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                aria-label="View notifications"
                                className="relative flex size-11 items-center justify-center rounded-xl border border-harbor/10 bg-white text-harbor shadow-sm transition hover:border-sienna/40 hover:text-sienna"
                            >
                                <Bell className="size-5" />
                                <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-sienna ring-2 ring-white" />
                            </button>
                            <a
                                href="#opportunities"
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-harbor px-4 text-sm font-bold text-white shadow-lg shadow-harbor/20 transition hover:bg-harbor-700"
                            >
                                <Compass className="size-4" />
                                Explore projects
                            </a>
                        </div>
                    </div>
                    <section className="relative overflow-hidden rounded-3xl bg-harbor px-5 py-6 text-white shadow-xl shadow-harbor/15 sm:px-8 sm:py-8">
                        <div className="absolute -top-24 -right-12 size-72 rounded-full bg-amber/20 blur-3xl" />
                        <div className="absolute -bottom-28 left-1/3 size-64 rounded-full bg-sienna/25 blur-3xl" />
                        <div className="relative grid gap-7 lg:grid-cols-[1fr_280px] lg:items-center">
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sand-100">
                                    <Sparkles className="size-3.5 text-amber-200" />{" "}
                                    Your profile is ready to shine
                                </span>
                                <h2 className="mt-4 max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">
                                    Find a project where your strengths can make
                                    a real difference.
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-relaxed text-harbor-100">
                                    We’ve surfaced opportunities that align with
                                    your profile, experience, and interests.
                                </p>
                                <a
                                    href="#opportunities"
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-amber-200 transition hover:text-white"
                                >
                                    View recommended projects{" "}
                                    <ArrowRight className="size-4" />
                                </a>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold tracking-wide text-harbor-100 uppercase">
                                        Profile strength
                                    </span>
                                    <span className="text-sm font-extrabold text-amber-200">
                                        84%
                                    </span>
                                </div>
                                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
                                    <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-amber to-clay-300" />
                                </div>
                                <p className="mt-3 text-xs leading-relaxed text-harbor-100">
                                    Add a current CV to improve your visibility
                                    to project teams.
                                </p>
                                <Link
                                    href="/onboarding/build-profile?step=5"
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white underline decoration-amber underline-offset-4"
                                >
                                    Complete profile{" "}
                                    <ChevronRight className="size-3.5" />
                                </Link>
                            </div>
                        </div>
                    </section>
                    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Project matches"
                            value="12"
                            note="3 new this week"
                            icon={Target}
                            tone="bg-sienna-100 text-sienna"
                        />
                        <StatCard
                            label="Applications"
                            value="2"
                            note="1 awaiting review"
                            icon={Send}
                            tone="bg-amber-100 text-amber-600"
                        />
                        <StatCard
                            label="Active projects"
                            value="1"
                            note="Next check-in: Friday"
                            icon={BriefcaseBusiness}
                            tone="bg-moss-100 text-moss-600"
                        />
                        <StatCard
                            label="Hours this month"
                            value="18.5"
                            note="6.5 hours to submit"
                            icon={Clock3}
                            tone="bg-clay-100 text-clay-600"
                        />
                    </section>
                    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-6">
                            <section
                                id="projects"
                                className="rounded-2xl border border-harbor/10 bg-white p-5 shadow-[0_8px_24px_rgba(30,47,68,0.05)] sm:p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold tracking-wide text-sienna uppercase">
                                            In progress
                                        </p>
                                        <h2 className="mt-1 text-xl font-extrabold text-harbor">
                                            Community Impact Research
                                        </h2>
                                        <p className="mt-1 text-sm text-ember-500">
                                            with Ubuntu Future Foundation
                                        </p>
                                    </div>
                                    <button
                                        className="rounded-lg p-1.5 text-ember-400 transition hover:bg-sand-100 hover:text-harbor"
                                        aria-label="Project options"
                                    >
                                        <MoreHorizontal className="size-5" />
                                    </button>
                                </div>
                                <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-bold text-ember-500">
                                            <span>Project progress</span>
                                            <span className="text-harbor">
                                                68%
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sand-100">
                                            <div className="h-full w-[68%] rounded-full bg-moss" />
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-ember-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDays className="size-3.5 text-sienna" />
                                                Ends 30 Sep 2026
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <UsersRound className="size-3.5 text-sienna" />
                                                8 team members
                                            </span>
                                        </div>
                                    </div>
                                    <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-harbor/15 px-4 text-sm font-bold text-harbor transition hover:border-harbor hover:bg-sand-50">
                                        Open workspace{" "}
                                        <ArrowRight className="size-4" />
                                    </button>
                                </div>
                            </section>
                            <section id="opportunities" className="scroll-mt-6">
                                <div className="mb-4 flex items-end justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-harbor">
                                            Recommended for you
                                        </h2>
                                        <p className="mt-1 text-sm text-ember-500">
                                            Based on the skills in your profile.
                                        </p>
                                    </div>
                                    <a
                                        href="#opportunities"
                                        className="hidden text-sm font-bold text-sienna sm:inline-flex sm:items-center sm:gap-1"
                                    >
                                        See all{" "}
                                        <ChevronRight className="size-4" />
                                    </a>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {opportunities.map((opportunity) => (
                                        <article
                                            key={opportunity.title}
                                            className="group rounded-2xl border border-harbor/10 bg-white p-4 shadow-[0_8px_24px_rgba(30,47,68,0.04)] transition hover:-translate-y-0.5 hover:border-sienna/30 hover:shadow-lg"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <span
                                                    className={`flex size-10 items-center justify-center rounded-xl text-white ${opportunity.colour}`}
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
                                                    className="rounded-lg p-1.5 text-ember-400 hover:bg-sand-100 hover:text-sienna"
                                                    aria-label={`Save ${opportunity.title}`}
                                                >
                                                    <Bookmark
                                                        className={`size-4 ${saved === opportunity.title ? "fill-sienna text-sienna" : ""}`}
                                                    />
                                                </button>
                                            </div>
                                            <p className="mt-4 text-[11px] font-extrabold tracking-wide text-moss uppercase">
                                                {opportunity.match}
                                            </p>
                                            <h3 className="mt-1 text-[15px] font-extrabold leading-snug text-harbor">
                                                {opportunity.title}
                                            </h3>
                                            <p className="mt-1 text-xs text-ember-500">
                                                {opportunity.organisation}
                                            </p>
                                            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ember-500">
                                                <MapPin className="size-3.5 text-sienna" />
                                                {opportunity.type}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {opportunity.skills.map(
                                                    (skill) => (
                                                        <span
                                                            key={skill}
                                                            className="rounded-full bg-sand-100 px-2 py-1 text-[11px] font-bold text-ember-500"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                            <button className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-sienna">
                                                View project{" "}
                                                <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        </div>
                        <aside className="space-y-6">
                            <section
                                id="applications"
                                className="rounded-2xl border border-harbor/10 bg-white p-5 shadow-[0_8px_24px_rgba(30,47,68,0.05)]"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="font-extrabold text-harbor">
                                        Your applications
                                    </h2>
                                    <FileText className="size-4 text-sienna" />
                                </div>
                                <div className="mt-5 space-y-4">
                                    <div className="border-l-2 border-amber pl-3">
                                        <p className="text-sm font-bold text-harbor">
                                            Climate Action Toolkit
                                        </p>
                                        <p className="mt-1 text-xs text-ember-500">
                                            Submitted 2 days ago
                                        </p>
                                        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-extrabold text-amber-600">
                                            Under review
                                        </span>
                                    </div>
                                    <div className="border-l-2 border-moss pl-3">
                                        <p className="text-sm font-bold text-harbor">
                                            Neighbourhood Stories
                                        </p>
                                        <p className="mt-1 text-xs text-ember-500">
                                            Submitted 8 Sep 2026
                                        </p>
                                        <span className="mt-2 inline-flex rounded-full bg-moss-100 px-2 py-1 text-[10px] font-extrabold text-moss-600">
                                            Shortlisted
                                        </span>
                                    </div>
                                </div>
                                <button className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-sand-100 py-2.5 text-xs font-bold text-harbor transition hover:bg-sand-200">
                                    View all applications{" "}
                                    <ChevronRight className="size-3.5" />
                                </button>
                            </section>
                            <section
                                id="timesheets"
                                className="rounded-2xl border border-harbor/10 bg-white p-5 shadow-[0_8px_24px_rgba(30,47,68,0.05)]"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-extrabold text-harbor">
                                            This week
                                        </h2>
                                        <p className="mt-1 text-xs text-ember-500">
                                            Your upcoming moments
                                        </p>
                                    </div>
                                    <button className="rounded-lg p-1.5 text-ember-400 hover:bg-sand-100">
                                        <Plus className="size-4" />
                                    </button>
                                </div>
                                <div className="mt-5 space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-9 text-center">
                                            <p className="text-[10px] font-bold text-sienna uppercase">
                                                Fri
                                            </p>
                                            <p className="text-lg font-extrabold text-harbor">
                                                11
                                            </p>
                                        </div>
                                        <div className="border-l border-sand-200 pl-3">
                                            <p className="text-sm font-bold text-harbor">
                                                Research team check-in
                                            </p>
                                            <p className="mt-1 text-xs text-ember-500">
                                                10:00 · Online
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-9 text-center">
                                            <p className="text-[10px] font-bold text-sienna uppercase">
                                                Mon
                                            </p>
                                            <p className="text-lg font-extrabold text-harbor">
                                                14
                                            </p>
                                        </div>
                                        <div className="border-l border-sand-200 pl-3">
                                            <p className="text-sm font-bold text-harbor">
                                                Timesheet due
                                            </p>
                                            <p className="mt-1 text-xs text-ember-500">
                                                Submit 6.5 hours
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="rounded-2xl bg-sienna p-5 text-white">
                                <CheckCircle2 className="size-5 text-amber-200" />
                                <h2 className="mt-3 font-extrabold">
                                    Keep building momentum
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-sienna-100">
                                    A strong, current profile helps project
                                    managers find you.
                                </p>
                                <Link
                                    href="/onboarding/build-profile"
                                    className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-white underline decoration-amber-200 underline-offset-4"
                                >
                                    Review my profile{" "}
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </section>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

Dashboard.layout = { breadcrumbs: [{ title: "Dashboard", href: dashboard() }] };
