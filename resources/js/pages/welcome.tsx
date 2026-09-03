import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowRight,
    Award,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Compass,
    FileCheck2,
    FolderKanban,
    HeartHandshake,
    Layers,
    Leaf,
    Link2,
    MapPin,
    Menu,
    Network,
    Search,
    ShieldCheck,
    Sparkles,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';

const projects = [
    {
        name: 'Community Digital Skills Programme',
        organisation: 'Bright Futures Foundation',
        category: 'Education',
        location: 'Manchester · Hybrid',
        start: 'Starts 6 Oct 2026',
        needed: '24 participants',
        spotsLeft: '9 spots left',
        status: 'Accepting applications',
        statusTone: 'open' as const,
        skills: ['Mentoring', 'Digital literacy', 'Workshops'],
        description:
            'Deliver weekly digital-skills workshops in community hubs, helping residents build confidence with everyday technology.',
    },
    {
        name: 'Youth Development Initiative',
        organisation: 'Northside Youth Trust',
        category: 'Youth & Community',
        location: 'Birmingham · In person',
        start: 'Starts 20 Oct 2026',
        needed: '18 participants',
        spotsLeft: '5 spots left',
        status: 'Closing soon',
        statusTone: 'closing' as const,
        skills: ['Coaching', 'Safeguarding', 'Events'],
        description:
            'Support after-school mentoring circles and weekend activity days for young people aged 14–19.',
    },
    {
        name: 'Environmental Awareness Project',
        organisation: 'GreenLoop Collective',
        category: 'Environment',
        location: 'Remote-friendly',
        start: 'Starts 3 Nov 2026',
        needed: '30 participants',
        spotsLeft: '17 spots left',
        status: 'Accepting applications',
        statusTone: 'open' as const,
        skills: ['Research', 'Content', 'Community outreach'],
        description:
            'Create neighbourhood sustainability guides and run local awareness campaigns across three cities.',
    },
    {
        name: 'Technology Innovation Programme',
        organisation: 'Civic Tech Lab',
        category: 'Technology',
        location: 'London · Hybrid',
        start: 'Starts 12 Jan 2027',
        needed: '12 participants',
        spotsLeft: 'Waitlist open',
        status: 'Upcoming',
        statusTone: 'upcoming' as const,
        skills: ['React', 'UX design', 'Data analysis'],
        description:
            'Prototype civic-tech tools with product mentors — from discovery through to a Demo Day showcase.',
    },
];

const steps = [
    {
        n: '01',
        title: 'Create Your Profile',
        text: 'Register and build a professional profile with experience, education, skills and qualifications.',
        icon: UserRound,
    },
    {
        n: '02',
        title: 'Discover Projects',
        text: 'Browse ongoing and upcoming projects from different organisations in one place.',
        icon: Search,
    },
    {
        n: '03',
        title: 'Apply',
        text: 'Apply for projects that match your skills and interests in just a few clicks.',
        icon: FileCheck2,
    },
    {
        n: '04',
        title: 'Participate',
        text: 'Project managers review applications and select participants. Accepted participants contribute and track their work.',
        icon: HeartHandshake,
    },
];

const benefits = [
    {
        icon: Building2,
        title: 'Multiple organisations',
        text: 'One platform connecting many organisations with a shared pool of talented participants.',
    },
    {
        icon: UserRound,
        title: 'Centralised profiles',
        text: 'A single professional profile that works like an online CV across every project.',
    },
    {
        icon: FileCheck2,
        title: 'Streamlined applications',
        text: 'Discover, apply and follow progress without re-entering the same details.',
    },
    {
        icon: Users,
        title: 'Participation management',
        text: 'Project managers build teams, manage roles and keep everyone aligned.',
    },
    {
        icon: Clock3,
        title: 'Timesheet tracking',
        text: 'Participants log hours and managers approve them with a clear audit trail.',
    },
    {
        icon: BarChart3,
        title: 'Project reporting',
        text: 'Generate reports on participation, progress and outcomes for stakeholders.',
    },
    {
        icon: FolderKanban,
        title: 'Clear project lifecycle',
        text: 'From draft to published, recruiting, active and complete — always know the status.',
    },
];

const orgPoints = [
    'Create and publish projects',
    'Receive participant applications',
    'Review participant profiles',
    'Select participants',
    'Manage project teams',
    'Track participant timesheets',
    'Monitor project progress',
    'Generate project reports',
];

function StatusDot({ tone }: { tone: 'open' | 'closing' | 'upcoming' }) {
    const color =
        tone === 'open'
            ? 'bg-forest'
            : tone === 'closing'
              ? 'bg-mustard'
              : 'bg-olive';
    return (
        <span className="relative flex size-2">
            <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-40`}
            />
            <span
                className={`relative inline-flex size-2 rounded-full ${color}`}
            />
        </span>
    );
}

export default function Welcome() {
    const { auth } = usePage().props as unknown as {
        auth: { user: { name: string } | null };
    };
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <Head title="AlphaForce ProjectLink — Connect. Participate. Make an Impact." />
            <div className="min-h-screen bg-cream font-sans text-charcoal antialiased">
                {/* ── Navigation ─────────────────────────────────── */}
                <header className="sticky top-0 z-50 border-b border-forest/10 bg-cream/90 backdrop-blur-md">
                    <nav
                        aria-label="Main navigation"
                        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
                    >
                        <a href="#top" className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-forest text-cream shadow-sm">
                                <Network className="size-5" strokeWidth={2.2} />
                            </span>
                            <span className="leading-tight">
                                <span className="block text-[15px] font-bold tracking-tight text-forest">
                                    AlphaForce ProjectLink
                                </span>
                                <span className="block text-[11px] font-medium tracking-wide text-olive">
                                    Connect. Participate. Make an Impact.
                                </span>
                            </span>
                        </a>

                        <div className="hidden items-center gap-8 text-[14px] font-medium text-charcoal md:flex">
                            <a
                                href="#projects"
                                className="transition-colors hover:text-forest"
                            >
                                Projects
                            </a>
                            <a
                                href="#how-it-works"
                                className="transition-colors hover:text-forest"
                            >
                                How It Works
                            </a>
                            <a
                                href="#organisations"
                                className="transition-colors hover:text-forest"
                            >
                                About
                            </a>
                        </div>

                        <div className="hidden items-center gap-3 md:flex">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-forest px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-forest-700"
                                >
                                    Dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-forest transition-colors hover:bg-forest/10"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-forest px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-forest-700 hover:shadow-md"
                                    >
                                        Get Started
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-expanded={menuOpen}
                            aria-label="Toggle menu"
                            className="inline-flex size-10 items-center justify-center rounded-lg text-forest hover:bg-forest/10 md:hidden"
                        >
                            {menuOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </nav>

                    {menuOpen && (
                        <div className="border-t border-forest/10 bg-cream px-4 pt-2 pb-5 md:hidden">
                            <div className="flex flex-col gap-1 text-[15px] font-medium">
                                <a
                                    href="#projects"
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-lg px-3 py-2.5 hover:bg-forest/10"
                                >
                                    Projects
                                </a>
                                <a
                                    href="#how-it-works"
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-lg px-3 py-2.5 hover:bg-forest/10"
                                >
                                    How It Works
                                </a>
                                <a
                                    href="#organisations"
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-lg px-3 py-2.5 hover:bg-forest/10"
                                >
                                    About
                                </a>
                                <div className="mt-2 flex gap-2">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-forest/25 text-sm font-semibold text-forest"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href={register()}
                                                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white"
                                            >
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* ── Hero ───────────────────────────────────────── */}
                <section id="top" className="relative overflow-hidden">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-olive/15 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute top-64 -left-32 size-80 rounded-full bg-mustard/15 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-forest via-olive to-mustard"
                    />

                    <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pt-24 lg:pb-24">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-forest shadow-sm">
                                <Sparkles className="size-3.5 text-mustard-600" />
                                A multi-organisation project platform
                            </div>
                            <h1 className="mt-5 text-4xl leading-[1.08] font-bold tracking-tight text-charcoal sm:text-5xl lg:text-[3.4rem]">
                                Connect With Projects That{' '}
                                <span className="relative whitespace-nowrap text-forest">
                                    Make&nbsp;a&nbsp;Difference
                                    <svg
                                        aria-hidden
                                        viewBox="0 0 220 12"
                                        preserveAspectRatio="none"
                                        className="absolute -bottom-1.5 left-0 h-2.5 w-full text-mustard"
                                    >
                                        <path
                                            d="M3 9C60 3 160 3 217 8"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            fill="none"
                                        />
                                    </svg>
                                </span>
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal-500">
                                Discover meaningful projects, showcase your
                                skills and connect with organisations looking
                                for participants like you.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="#projects"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-7 text-[15px] font-semibold text-white shadow-lg shadow-forest/25 transition-all hover:-translate-y-0.5 hover:bg-forest-700"
                                >
                                    <Compass className="size-4.5" />
                                    Explore Projects
                                </a>
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-forest bg-white/60 px-7 text-[15px] font-semibold text-forest transition-all hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="size-4.5" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={register()}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-forest bg-white/60 px-7 text-[15px] font-semibold text-forest transition-all hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        <UserRound className="size-4.5" />
                                        Create Your Profile
                                    </Link>
                                )}
                            </div>
                            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-forest/15 pt-7">
                                {[
                                    { v: '120+', l: 'Organisations' },
                                    { v: '4,800', l: 'Participants' },
                                    { v: '350', l: 'Active projects' },
                                ].map((s) => (
                                    <div key={s.l}>
                                        <dt className="sr-only">{s.l}</dt>
                                        <dd className="text-2xl font-bold text-forest sm:text-3xl">
                                            {s.v}
                                            <span className="text-mustard">
                                                .
                                            </span>
                                        </dd>
                                        <dd className="mt-1 text-[13px] font-medium text-charcoal-500">
                                            {s.l}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Hero visual: Participants → Projects → Organisations */}
                        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                            <div className="rounded-3xl border border-forest/10 bg-white/80 p-6 shadow-xl shadow-forest/10 backdrop-blur sm:p-8">
                                <p className="text-xs font-bold tracking-widest text-olive uppercase">
                                    How ProjectLink connects
                                </p>
                                <div className="mt-5 flex items-stretch justify-between gap-1 sm:gap-2">
                                    {[
                                        {
                                            icon: Users,
                                            label: 'Participants',
                                            sub: 'Skills & profiles',
                                            bg: 'bg-forest',
                                        },
                                        {
                                            icon: FolderKanban,
                                            label: 'Projects',
                                            sub: 'Apply & join',
                                            bg: 'bg-olive',
                                        },
                                        {
                                            icon: Building2,
                                            label: 'Organisations',
                                            sub: 'Impact & reports',
                                            bg: 'bg-charcoal',
                                        },
                                    ].map((n, i) => (
                                        <div
                                            key={n.label}
                                            className="flex flex-1 items-center"
                                        >
                                            <div className="flex flex-1 flex-col items-center rounded-2xl border border-forest/10 bg-cream-50 px-2 py-4 text-center shadow-sm sm:px-3">
                                                <span
                                                    className={`flex size-11 items-center justify-center rounded-full ${n.bg} text-white shadow-md`}
                                                >
                                                    <n.icon className="size-5" />
                                                </span>
                                                <span className="mt-2.5 text-[13px] font-bold text-charcoal sm:text-sm">
                                                    {n.label}
                                                </span>
                                                <span className="mt-0.5 text-[11px] font-medium text-charcoal-500">
                                                    {n.sub}
                                                </span>
                                            </div>
                                            {i < 2 && (
                                                <div
                                                    aria-hidden
                                                    className="flex shrink-0 items-center px-0.5 sm:px-1.5"
                                                >
                                                    <span className="hidden h-0.5 w-5 rounded bg-gradient-to-r from-forest to-olive sm:block sm:w-8" />
                                                    <Link2 className="size-3.5 text-mustard-600" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 space-y-3">
                                    <div className="flex items-center gap-3 rounded-2xl border border-forest/10 bg-white p-3.5 shadow-sm [animation:float-soft_5s_ease-in-out_infinite]">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest/10">
                                            <CheckCircle2 className="size-5 text-forest" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                Application accepted
                                            </p>
                                            <p className="truncate text-xs text-charcoal-500">
                                                Youth Development Initiative ·
                                                Northside Youth Trust
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-forest px-2.5 py-1 text-[11px] font-bold text-white">
                                            Selected
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl border border-forest/10 bg-white p-3.5 shadow-sm">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mustard/15">
                                            <Clock3 className="size-5 text-mustard-600" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                12.5 hrs logged this week
                                            </p>
                                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-200">
                                                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-forest to-olive" />
                                            </div>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-olive/15 px-2.5 py-1 text-[11px] font-bold text-olive-600">
                                            Approved
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div
                                aria-hidden
                                className="absolute -top-4 -right-3 hidden items-center gap-1.5 rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-cream shadow-lg sm:inline-flex"
                            >
                                <span className="size-1.5 animate-pulse rounded-full bg-mustard" />
                                38 new projects this month
                            </div>
                        </div>
                    </div>

                    {/* Concept flow strip */}
                    <div className="border-y border-forest/10 bg-white/60">
                        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-4 text-[13px] font-bold sm:px-6 lg:px-8">
                            {[
                                'Participants',
                                'Skills',
                                'Projects',
                                'Organisations',
                                'Impact',
                            ].map((w, i, arr) => (
                                <span
                                    key={w}
                                    className="flex items-center gap-3"
                                >
                                    <span
                                        className={
                                            i === arr.length - 1
                                                ? 'rounded-full bg-forest px-4 py-1.5 text-white shadow-sm'
                                                : 'text-forest'
                                        }
                                    >
                                        {w}
                                    </span>
                                    {i < arr.length - 1 && (
                                        <ArrowRight
                                            aria-hidden
                                            className="size-4 text-mustard-600"
                                        />
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Platform Concept ───────────────────────────── */}
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-bold tracking-[0.18em] text-olive uppercase">
                            The platform concept
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
                            One profile. Every{' '}
                            <span className="text-forest">opportunity</span>.
                        </h2>
                        <p className="mt-4 text-[17px] leading-relaxed text-charcoal-500">
                            ProjectLink is not a job board — it is a project
                            and opportunity platform where skills meet
                            meaningful work.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {[
                            {
                                icon: Compass,
                                tint: 'bg-forest/10 text-forest',
                                title: 'Discover Projects',
                                text: 'Explore ongoing and upcoming projects from participating organisations — all in one trusted place.',
                            },
                            {
                                icon: Award,
                                tint: 'bg-olive/15 text-olive-600',
                                title: 'Build Your Profile',
                                text: 'Create a professional profile showcasing your experience, education, skills and qualifications.',
                            },
                            {
                                icon: HeartHandshake,
                                tint: 'bg-mustard/15 text-mustard-600',
                                title: 'Participate & Contribute',
                                text: 'Apply for projects, become a participant when selected and contribute your skills to real outcomes.',
                            },
                        ].map((c) => (
                            <article
                                key={c.title}
                                className="group rounded-3xl border border-forest/10 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10"
                            >
                                <span
                                    className={`inline-flex size-13 items-center justify-center rounded-2xl ${c.tint} transition-transform group-hover:scale-110`}
                                >
                                    <c.icon
                                        className="size-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <h3 className="mt-5 text-xl font-bold">
                                    {c.title}
                                </h3>
                                <p className="mt-2.5 leading-relaxed text-charcoal-500">
                                    {c.text}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ── How It Works ───────────────────────────────── */}
                <section
                    id="how-it-works"
                    className="scroll-mt-20 border-y border-forest/10 bg-white/70"
                >
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-xs font-bold tracking-[0.18em] text-olive uppercase">
                                How it works
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                From sign-up to{' '}
                                <span className="text-forest">impact</span> in
                                four steps
                            </h2>
                        </div>
                        <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                            <div
                                aria-hidden
                                className="absolute top-7 right-[12%] left-[12%] hidden h-0.5 rounded bg-gradient-to-r from-forest via-olive to-mustard lg:block"
                            />
                            {steps.map((s) => (
                                <div
                                    key={s.n}
                                    className="relative text-center lg:text-left"
                                >
                                    <div className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-forest text-white shadow-lg shadow-forest/25 lg:mx-0">
                                        <s.icon
                                            className="size-6"
                                            strokeWidth={2}
                                        />
                                        <span className="absolute -top-2.5 -right-2.5 rounded-full bg-mustard px-2 py-0.5 text-[11px] font-extrabold text-charcoal shadow-sm">
                                            {s.n}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold">
                                        <span className="mr-1.5 text-mustard-600 lg:hidden">
                                            {s.n}
                                        </span>
                                        {s.title}
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-charcoal-500 lg:mx-0">
                                        {s.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Project Discovery Preview ──────────────────── */}
                <section id="projects" className="scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-xs font-bold tracking-[0.18em] text-olive uppercase">
                                    Project discovery
                                </p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                    Real projects.{' '}
                                    <span className="text-forest">
                                        Real opportunities.
                                    </span>
                                </h2>
                                <p className="mt-4 text-[17px] text-charcoal-500">
                                    A preview of the kinds of projects
                                    organisations publish on ProjectLink.
                                </p>
                            </div>
                            <div
                                aria-hidden
                                className="flex flex-wrap gap-2 text-xs font-semibold"
                            >
                                {[
                                    'All',
                                    'Education',
                                    'Environment',
                                    'Technology',
                                ].map((f, i) => (
                                    <span
                                        key={f}
                                        className={`rounded-full px-3.5 py-1.5 ${
                                            i === 0
                                                ? 'bg-forest text-white'
                                                : 'border border-forest/15 bg-white text-charcoal-500'
                                        }`}
                                    >
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                            {projects.map((p) => (
                                <article
                                    key={p.name}
                                    className="flex flex-col rounded-3xl border border-forest/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="rounded-full bg-olive/15 px-3 py-1 text-[11px] font-bold tracking-wide text-olive-600 uppercase">
                                            {p.category}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest">
                                            <StatusDot tone={p.statusTone} />
                                            {p.status}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-[17px] leading-snug font-bold">
                                        {p.name}
                                    </h3>
                                    <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-charcoal-500">
                                        <Building2 className="size-3.5 shrink-0 text-olive" />
                                        {p.organisation}
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-charcoal-500">
                                        {p.description}
                                    </p>
                                    <ul className="mt-4 space-y-1.5 text-[13px] font-medium text-charcoal-600">
                                        <li className="flex items-center gap-2">
                                            <MapPin className="size-3.5 shrink-0 text-forest" />
                                            {p.location}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CalendarDays className="size-3.5 shrink-0 text-forest" />
                                            {p.start}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Users className="size-3.5 shrink-0 text-forest" />
                                            {p.needed} ·{' '}
                                            <span className="font-bold text-mustard-600">
                                                {p.spotsLeft}
                                            </span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {p.skills.map((s) => (
                                            <span
                                                key={s}
                                                className="rounded-full border border-forest/15 bg-cream-50 px-2.5 py-1 text-[11px] font-semibold text-forest"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-5 border-t border-forest/10 pt-4">
                                        {auth.user ? (
                                            <Link
                                                href={dashboard()}
                                                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-forest text-sm font-semibold text-white transition-colors hover:bg-forest-700"
                                            >
                                                View Project
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href={register()}
                                                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-forest text-sm font-semibold text-white transition-colors hover:bg-forest-700"
                                            >
                                                View Project
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── For Organisations ──────────────────────────── */}
                <section id="organisations" className="scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                        <div className="relative overflow-hidden rounded-[2rem] bg-forest px-6 py-12 text-cream shadow-2xl shadow-forest/30 sm:px-10 lg:px-14 lg:py-16">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-olive/30 blur-3xl"
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-mustard/20 blur-3xl"
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mustard via-cream/60 to-mustard"
                            />
                            <div className="relative grid items-center gap-12 lg:grid-cols-2">
                                <div>
                                    <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase">
                                        <Leaf className="size-3.5 text-mustard" />
                                        For organisations
                                    </p>
                                    <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
                                        Manage Your Projects. Find the{' '}
                                        <span className="text-mustard">
                                            Right Participants.
                                        </span>
                                    </h2>
                                    <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-cream/85">
                                        Publish opportunities, review rich
                                        participant profiles and run your
                                        entire project lifecycle — teams,
                                        timesheets and reports — from one
                                        dashboard.
                                    </p>
                                    <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                        {orgPoints.map((pt) => (
                                            <li
                                                key={pt}
                                                className="flex items-start gap-2.5 text-[14.5px] font-medium text-cream/95"
                                            >
                                                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-mustard" />
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                        <a
                                            href="#cta"
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-mustard px-7 text-[15px] font-bold text-charcoal shadow-lg transition-all hover:-translate-y-0.5 hover:bg-mustard-400"
                                        >
                                            Partner With Us
                                            <ArrowRight className="size-4.5" />
                                        </a>
                                        <a
                                            href="#benefits"
                                            className="inline-flex h-12 items-center justify-center rounded-full border border-cream/40 px-7 text-[15px] font-semibold text-cream transition-colors hover:bg-white/10"
                                        >
                                            Explore Platform Benefits
                                        </a>
                                    </div>
                                </div>

                                {/* Dashboard mock */}
                                <div
                                    aria-hidden
                                    className="rounded-3xl border border-white/15 bg-white/95 p-5 text-charcoal shadow-2xl backdrop-blur sm:p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold">
                                            Project overview
                                        </p>
                                        <span className="rounded-full bg-forest/10 px-2.5 py-1 text-[11px] font-bold text-forest">
                                            ● Active
                                        </span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                                        {[
                                            {
                                                v: '46',
                                                l: 'Applications',
                                            },
                                            {
                                                v: '24',
                                                l: 'Selected',
                                                hot: true,
                                            },
                                            {
                                                v: '312h',
                                                l: 'Logged',
                                            },
                                        ].map((k) => (
                                            <div
                                                key={k.l}
                                                className={`rounded-2xl border p-3 ${
                                                    k.hot
                                                        ? 'border-mustard/50 bg-mustard/10'
                                                        : 'border-forest/10 bg-cream-50'
                                                }`}
                                            >
                                                <p className="text-xl font-extrabold text-forest">
                                                    {k.v}
                                                </p>
                                                <p className="text-[11px] font-semibold text-charcoal-500">
                                                    {k.l}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 space-y-2.5">
                                        {[
                                            {
                                                n: 'Amara O. — Mentor',
                                                tag: 'Shortlisted',
                                                cls: 'bg-olive/15 text-olive-600',
                                            },
                                            {
                                                n: 'Timesheets — Week 6',
                                                tag: '18 approved',
                                                cls: 'bg-forest/10 text-forest',
                                            },
                                            {
                                                n: 'Impact report — Q3',
                                                tag: 'Ready',
                                                cls: 'bg-mustard/15 text-mustard-600',
                                            },
                                        ].map((r) => (
                                            <div
                                                key={r.n}
                                                className="flex items-center justify-between rounded-xl border border-forest/10 bg-white px-3.5 py-2.5 text-[13px]"
                                            >
                                                <span className="font-semibold">
                                                    {r.n}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${r.cls}`}
                                                >
                                                    {r.tag}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Platform Benefits ──────────────────────────── */}
                <section id="benefits" className="scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-xs font-bold tracking-[0.18em] text-olive uppercase">
                                Platform benefits
                            </p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Built for{' '}
                                <span className="text-forest">
                                    scale and trust
                                </span>
                            </h2>
                            <p className="mt-4 text-[17px] text-charcoal-500">
                                Designed to support many organisations and
                                thousands of participants and users.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {benefits.map((b, i) => (
                                <article
                                    key={b.title}
                                    className={`rounded-3xl border border-forest/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-forest/10 ${
                                        i === benefits.length - 1
                                            ? 'sm:col-span-2 lg:col-span-1 xl:col-span-1'
                                            : ''
                                    }`}
                                >
                                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-forest/10 text-forest">
                                        <b.icon
                                            className="size-5.5"
                                            strokeWidth={2}
                                        />
                                    </span>
                                    <h3 className="mt-4 font-bold">
                                        {b.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-charcoal-500">
                                        {b.text}
                                    </p>
                                </article>
                            ))}
                            <article className="flex flex-col justify-between rounded-3xl bg-charcoal p-6 text-cream shadow-sm sm:col-span-2 lg:col-span-2 xl:col-span-1">
                                <div>
                                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-mustard/20 text-mustard">
                                        <ShieldCheck
                                            className="size-5.5"
                                            strokeWidth={2}
                                        />
                                    </span>
                                    <h3 className="mt-4 font-bold">
                                        Trusted by design
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-cream/75">
                                        Verified organisations, structured
                                        applications and transparent project
                                        lifecycles.
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-mustard">
                                    <Layers className="size-4" />
                                    Enterprise-ready governance
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ──────────────────────────────────── */}
                <section id="cta" className="scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                        <div className="relative overflow-hidden rounded-[2rem] border border-forest/15 bg-white px-6 py-14 text-center shadow-xl shadow-forest/10 sm:px-12 lg:py-20">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -top-16 left-1/2 h-40 w-[36rem] -translate-x-1/2 rounded-full bg-mustard/15 blur-3xl"
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-forest/10 blur-3xl"
                            />
                            <div className="relative mx-auto max-w-2xl">
                                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-forest text-cream shadow-lg shadow-forest/30">
                                    <Network
                                        className="size-7"
                                        strokeWidth={2}
                                    />
                                </span>
                                <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                                    Your Next Project{' '}
                                    <span className="relative text-forest">
                                        Starts Here
                                        <svg
                                            aria-hidden
                                            viewBox="0 0 220 12"
                                            preserveAspectRatio="none"
                                            className="absolute -bottom-1 left-0 h-2 w-full text-mustard"
                                        >
                                            <path
                                                d="M3 9C60 3 160 3 217 8"
                                                stroke="currentColor"
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                fill="none"
                                            />
                                        </svg>
                                    </span>
                                    .
                                </h2>
                                <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-charcoal-500">
                                    Whether you're looking for an opportunity
                                    to contribute your skills or an
                                    organisation looking for participants for
                                    your next project, AlphaForce ProjectLink
                                    brings everyone together.
                                </p>
                                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                    <a
                                        href="#projects"
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-8 text-[15px] font-semibold text-white shadow-lg shadow-forest/25 transition-all hover:-translate-y-0.5 hover:bg-forest-700"
                                    >
                                        <Compass className="size-4.5" />
                                        Explore Projects
                                    </a>
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-mustard bg-mustard/10 px-8 text-[15px] font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-mustard/20"
                                        >
                                            Go to Dashboard
                                            <ArrowRight className="size-4.5" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={register()}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-mustard bg-mustard/10 px-8 text-[15px] font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-mustard/20"
                                        >
                                            Join ProjectLink
                                            <ArrowRight className="size-4.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Footer ─────────────────────────────────────── */}
                <footer className="bg-forest-900 text-cream/85">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-cream text-forest">
                                        <Network
                                            className="size-5"
                                            strokeWidth={2.2}
                                        />
                                    </span>
                                    <span className="text-[15px] font-bold text-cream">
                                        AlphaForce ProjectLink
                                    </span>
                                </div>
                                <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
                                    Connect. Participate. Make an Impact. The
                                    project and opportunity platform bringing
                                    participants and organisations together.
                                </p>
                            </div>
                            <nav aria-label="Platform">
                                <p className="text-xs font-bold tracking-widest text-mustard uppercase">
                                    Platform
                                </p>
                                <ul className="mt-4 space-y-2.5 text-sm font-medium">
                                    {[
                                        ['About', '#organisations'],
                                        ['Projects', '#projects'],
                                        ['How It Works', '#how-it-works'],
                                        ['Contact', '#cta'],
                                    ].map(([label, href]) => (
                                        <li key={label}>
                                            <a
                                                href={href}
                                                className="transition-colors hover:text-cream"
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                            <nav aria-label="Legal">
                                <p className="text-xs font-bold tracking-widest text-mustard uppercase">
                                    Legal
                                </p>
                                <ul className="mt-4 space-y-2.5 text-sm font-medium">
                                    {[
                                        'Privacy Policy',
                                        'Terms & Conditions',
                                    ].map((label) => (
                                        <li key={label}>
                                            <a
                                                href="#top"
                                                className="transition-colors hover:text-cream"
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                            <nav aria-label="Account">
                                <p className="text-xs font-bold tracking-widest text-mustard uppercase">
                                    Account
                                </p>
                                <ul className="mt-4 space-y-2.5 text-sm font-medium">
                                    <li>
                                        <Link
                                            href={login()}
                                            className="transition-colors hover:text-cream"
                                        >
                                            Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={register()}
                                            className="transition-colors hover:text-cream"
                                        >
                                            Register
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-cream/60 sm:flex-row">
                            <p>
                                © 2026 AlphaForce ProjectLink. All rights
                                reserved.
                            </p>
                            <p className="inline-flex items-center gap-1.5">
                                <Leaf className="size-3.5 text-olive-100" />
                                Professional · Trustworthy · Impact-driven
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
