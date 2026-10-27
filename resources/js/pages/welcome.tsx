import {
    ArrowRight,
    ArrowUpRight,
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
    Quote,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { dashboard, login } from '@/routes';
import { register } from '@/routes';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

const projects = [
    {
        name: 'Community Digital Skills Programme',
        organisation: 'Bright Futures Foundation',
        category: 'Education',
        edge: 'bg-moss',
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
        edge: 'bg-sienna',
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
        edge: 'bg-amber',
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
        edge: 'bg-harbor',
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
        tile: 'bg-harbor/10 text-harbor',
        title: 'Multiple organisations',
        text: 'One platform connecting many organisations with a shared pool of talented participants.',
    },
    {
        icon: UserRound,
        tile: 'bg-sienna/10 text-sienna',
        title: 'Centralised profiles',
        text: 'A single professional profile that works like an online CV across every project.',
    },
    {
        icon: FileCheck2,
        tile: 'bg-amber/15 text-amber-600',
        title: 'Streamlined applications',
        text: 'Discover, apply and follow progress without re-entering the same details.',
    },
    {
        icon: Users,
        tile: 'bg-moss/15 text-moss-600',
        title: 'Participation management',
        text: 'Project managers build teams, manage roles and keep everyone aligned.',
    },
    {
        icon: Clock3,
        tile: 'bg-clay/20 text-clay-600',
        title: 'Timesheet tracking',
        text: 'Participants log hours and managers approve them with a clear audit trail.',
    },
    {
        icon: BarChart3,
        tile: 'bg-harbor/10 text-harbor',
        title: 'Project reporting',
        text: 'Generate reports on participation, progress and outcomes for stakeholders.',
    },
    {
        icon: FolderKanban,
        tile: 'bg-sienna/10 text-sienna',
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

const testimonials = [
    {
        quote: 'I built my profile once and applied to three projects in a week. Two accepted me.',
        name: 'Thandi N.',
        role: 'Participant · Youth mentor',
        initials: 'TN',
        tile: 'bg-sienna text-white',
    },
    {
        quote: 'Reviewing applications used to take days. With ProjectLink it takes an afternoon.',
        name: 'Daniel K.',
        role: 'Project Manager · Civic Tech Lab',
        initials: 'DK',
        tile: 'bg-harbor text-sand-50',
    },
    {
        quote: 'Timesheets, teams and reports finally live in one place. Our funders love it.',
        name: 'Priya S.',
        role: 'Programme Lead · GreenLoop',
        initials: 'PS',
        tile: 'bg-moss text-white',
    },
];

function StatusDot({ tone }: { tone: 'open' | 'closing' | 'upcoming' }) {
    const color =
        tone === 'open'
            ? 'bg-moss'
            : tone === 'closing'
              ? 'bg-amber'
              : 'bg-clay';
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

function Eyebrow({
    icon: Icon,
    children,
    dark = false,
}: {
    icon: typeof Leaf;
    children: React.ReactNode;
    dark?: boolean;
}) {
    return (
        <p
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase ${
                dark
                    ? 'border-white/15 bg-white/10 text-amber-200'
                    : 'border-harbor/15 text-sienna bg-white/70 shadow-sm'
            }`}
        >
            <Icon className="size-3.5" />
            {children}
        </p>
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
            <div className="bg-sand-50 text-ember min-h-screen font-sans antialiased">
                {/* ── Navigation ─────────────────────────────── */}
                <header className="border-harbor/10 bg-sand-50/85 sticky top-0 z-50 border-b backdrop-blur-md">
                    <nav
                        aria-label="Main navigation"
                        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
                    >
                        <a href="#top" className="flex items-center gap-2.5">
                            <AppLogoIcon className="shadow-harbor/30 size-9 rounded-xl object-contain shadow-md" />
                            <span className="leading-tight">
                                <span className="text-harbor block text-[15px] font-bold tracking-tight">
                                    AlphaForce ProjectLink
                                </span>
                                <span className="text-sienna block text-[11px] font-semibold tracking-wide">
                                    Connect. Participate. Make an Impact.
                                </span>
                            </span>
                        </a>

                        <div className="text-ember hidden items-center gap-8 text-[14px] font-semibold md:flex">
                            <a
                                href="#projects"
                                className="hover:text-sienna transition-colors"
                            >
                                Projects
                            </a>
                            <a
                                href="#how-it-works"
                                className="hover:text-sienna transition-colors"
                            >
                                How It Works
                            </a>
                            <a
                                href="#organisations"
                                className="hover:text-sienna transition-colors"
                            >
                                About
                            </a>
                        </div>

                        <div className="hidden items-center gap-3 md:flex">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="bg-harbor text-sand-50 shadow-harbor/25 hover:bg-harbor-700 inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-semibold shadow-md transition-all"
                                >
                                    Dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-harbor hover:bg-harbor/10 inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="bg-sienna shadow-sienna/30 hover:bg-sienna-600 inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-px"
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
                            className="text-harbor hover:bg-harbor/10 inline-flex size-10 items-center justify-center rounded-lg md:hidden"
                        >
                            {menuOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </nav>

                    {menuOpen && (
                        <div className="border-harbor/10 bg-sand-50 shadow-harbor/10 absolute inset-x-0 top-full z-50 border-b px-4 pt-2 pb-5 shadow-xl md:hidden">
                            <div className="flex flex-col gap-1 text-[15px] font-semibold">
                                <a
                                    href="#projects"
                                    onClick={() => setMenuOpen(false)}
                                    className="hover:bg-harbor/10 rounded-lg px-3 py-2.5"
                                >
                                    Projects
                                </a>
                                <a
                                    href="#how-it-works"
                                    onClick={() => setMenuOpen(false)}
                                    className="hover:bg-harbor/10 rounded-lg px-3 py-2.5"
                                >
                                    How It Works
                                </a>
                                <a
                                    href="#organisations"
                                    onClick={() => setMenuOpen(false)}
                                    className="hover:bg-harbor/10 rounded-lg px-3 py-2.5"
                                >
                                    About
                                </a>
                                <div className="mt-2 flex gap-2">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="bg-harbor text-sand-50 inline-flex h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                className="border-harbor/25 text-harbor inline-flex h-11 flex-1 items-center justify-center rounded-full border text-sm font-semibold"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href={register()}
                                                className="bg-sienna inline-flex h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold text-white"
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

                {/* ── Hero ───────────────────────────────────── */}
                <section id="top" className="relative overflow-hidden">
                    <div
                        aria-hidden
                        className="bg-clay/30 pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="bg-amber/20 pointer-events-none absolute top-72 -left-36 size-[24rem] rounded-full blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="bg-moss/15 pointer-events-none absolute top-40 left-1/3 size-72 rounded-full blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="from-harbor via-sienna to-amber pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-60"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, rgba(30,47,68,0.10) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                            maskImage:
                                'linear-gradient(to bottom, black 0%, transparent 70%)',
                            WebkitMaskImage:
                                'linear-gradient(to bottom, black 0%, transparent 70%)',
                        }}
                    />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pt-24 lg:pb-24">
                        <div>
                            <div className="border-harbor/15 text-harbor inline-flex items-center gap-2 rounded-full border bg-white/80 py-1.5 pr-4 pl-1.5 text-xs font-bold shadow-sm">
                                <span className="bg-sienna rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                                    NEW
                                </span>
                                <Sparkles className="size-3.5 text-amber-600" />
                                A multi-organisation project platform
                            </div>
                            <h1 className="text-harbor mt-6 text-[2.75rem] leading-[1.02] font-bold tracking-tight sm:text-6xl lg:text-[4.2rem]">
                                Connect with projects that{' '}
                                <span className="text-sienna relative whitespace-nowrap">
                                    make&nbsp;a difference
                                </span>
                            </h1>
                            <p className="text-ember-500 mt-6 max-w-xl text-lg leading-relaxed">
                                Discover meaningful projects, showcase your
                                skills and connect with organisations looking
                                for participants like you.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="#projects"
                                    className="bg-sienna shadow-sienna/35 hover:bg-sienna-600 inline-flex h-13 items-center justify-center gap-2 rounded-full px-8 text-[15px] font-bold text-white shadow-xl transition-all hover:-translate-y-0.5"
                                >
                                    <Compass className="size-5" />
                                    Explore Projects
                                </a>
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="border-harbor text-harbor inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 bg-white/70 px-8 text-[15px] font-bold transition-all hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="size-5" />
                                    </Link>
                                ) : (
                                    <Link
                                        href={register()}
                                        className="border-harbor text-harbor inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 bg-white/70 px-8 text-[15px] font-bold transition-all hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        <UserRound className="size-5" />
                                        Create Your Profile
                                    </Link>
                                )}
                            </div>
                            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                                <div className="flex -space-x-2.5">
                                    {[
                                        ['TN', 'bg-sienna text-white'],
                                        ['DK', 'bg-harbor text-sand-50'],
                                        ['PS', 'bg-moss text-white'],
                                        ['+9', 'bg-amber text-white'],
                                    ].map(([t, cls]) => (
                                        <span
                                            key={t}
                                            className={`ring-sand-50 flex size-9 items-center justify-center rounded-full text-[11px] font-extrabold ring-2 ${cls}`}
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <div>
                                    <div
                                        className="flex items-center gap-1"
                                        aria-label="Rated 4.9 out of 5"
                                    >
                                        {Array.from({ length: 5 }).map(
                                            (_, i) => (
                                                <Star
                                                    key={i}
                                                    className="text-amber size-4"
                                                    fill="currentColor"
                                                />
                                            ),
                                        )}
                                        <span className="text-harbor ml-1.5 text-sm font-extrabold">
                                            4.9
                                        </span>
                                    </div>
                                    <p className="text-ember-500 mt-0.5 text-[13px] font-medium">
                                        Loved by 4,800+ participants
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hero visual */}
                        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                            <div
                                aria-hidden
                                className="from-clay/40 via-amber/25 to-sienna/30 absolute -inset-3 rotate-2 rounded-[2rem] bg-gradient-to-br blur-[2px]"
                            />
                            <div className="border-harbor/10 shadow-harbor/20 relative rounded-[2rem] border bg-white/90 p-6 shadow-2xl backdrop-blur sm:p-7">
                                <div className="flex items-center justify-between">
                                    <p className="text-moss-600 text-xs font-extrabold tracking-[0.16em] uppercase">
                                        How ProjectLink connects
                                    </p>
                                    <span className="bg-moss/15 text-moss-600 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold">
                                        <span className="bg-moss size-1.5 animate-pulse rounded-full" />
                                        LIVE
                                    </span>
                                </div>
                                <div className="mt-5 flex items-stretch justify-between gap-1 sm:gap-2">
                                    {[
                                        {
                                            icon: Users,
                                            label: 'Participants',
                                            sub: 'Skills & profiles',
                                            bg: 'bg-harbor',
                                        },
                                        {
                                            icon: FolderKanban,
                                            label: 'Projects',
                                            sub: 'Apply & join',
                                            bg: 'bg-sienna',
                                        },
                                        {
                                            icon: Building2,
                                            label: 'Organisations',
                                            sub: 'Impact & reports',
                                            bg: 'bg-moss',
                                        },
                                    ].map((n, i) => (
                                        <div
                                            key={n.label}
                                            className="flex flex-1 items-center"
                                        >
                                            <div className="border-harbor/10 bg-sand-50 flex flex-1 flex-col items-center rounded-2xl border px-2 py-4 text-center shadow-sm sm:px-3">
                                                <span
                                                    className={`flex size-11 items-center justify-center rounded-2xl ${n.bg} text-white shadow-md`}
                                                >
                                                    <n.icon className="size-5" />
                                                </span>
                                                <span className="text-ember mt-2.5 text-[13px] font-bold sm:text-sm">
                                                    {n.label}
                                                </span>
                                                <span className="text-ember-500 mt-0.5 text-[11px] font-medium">
                                                    {n.sub}
                                                </span>
                                            </div>
                                            {i < 2 && (
                                                <div
                                                    aria-hidden
                                                    className="flex shrink-0 items-center px-0.5 sm:px-1.5"
                                                >
                                                    <span className="from-sienna to-amber hidden h-0.5 w-5 rounded bg-gradient-to-r sm:block sm:w-7" />
                                                    <Link2 className="size-3.5 text-amber-600" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 space-y-3">
                                    <div className="border-harbor/10 shadow-harbor/5 flex [animation:float-soft_5s_ease-in-out_infinite] items-center gap-3 rounded-2xl border bg-white p-3.5 shadow-md">
                                        <span className="bg-moss/15 flex size-10 shrink-0 items-center justify-center rounded-full">
                                            <CheckCircle2 className="text-moss-600 size-5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-ember truncate text-sm font-bold">
                                                Application accepted
                                            </p>
                                            <p className="text-ember-500 truncate text-xs">
                                                Youth Development Initiative ·
                                                Northside Youth Trust
                                            </p>
                                        </div>
                                        <span className="bg-sienna shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white">
                                            Selected
                                        </span>
                                    </div>
                                    <div className="border-harbor/10 shadow-harbor/5 flex items-center gap-3 rounded-2xl border bg-white p-3.5 shadow-md">
                                        <span className="bg-amber/15 flex size-10 shrink-0 items-center justify-center rounded-full">
                                            <Clock3 className="size-5 text-amber-600" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-ember truncate text-sm font-bold">
                                                12.5 hrs logged this week
                                            </p>
                                            <div className="bg-sand-200 mt-1.5 h-1.5 overflow-hidden rounded-full">
                                                <div className="from-sienna to-amber h-full w-3/4 rounded-full bg-gradient-to-r" />
                                            </div>
                                        </div>
                                        <span className="bg-moss/15 text-moss-600 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold">
                                            Approved
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div
                                aria-hidden
                                className="bg-ember text-sand-50 absolute -top-5 -right-2 hidden items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-xl sm:inline-flex"
                            >
                                <span className="bg-amber size-1.5 animate-pulse rounded-full" />
                                38 new projects this month
                            </div>
                            <div
                                aria-hidden
                                className="border-harbor/10 text-harbor absolute -bottom-5 -left-2 hidden items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-xs font-bold shadow-xl sm:inline-flex"
                            >
                                <ShieldCheck className="text-moss-600 size-4" />
                                Verified organisations only
                            </div>
                        </div>
                    </div>

                    {/* Stats band */}
                    <div className="border-harbor/10 relative border-t bg-white/70 backdrop-blur">
                        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-7 sm:px-6 md:grid-cols-4 lg:px-8">
                            {[
                                ['120+', 'Partner organisations'],
                                ['4,800', 'Active participants'],
                                ['350', 'Live projects'],
                                ['92%', 'Would recommend'],
                            ].map(([v, l]) => (
                                <div
                                    key={l}
                                    className="flex items-baseline gap-2.5"
                                >
                                    <dd className="text-harbor text-3xl font-extrabold tracking-tight">
                                        {v}
                                        <span className="text-amber">.</span>
                                    </dd>
                                    <dt className="text-ember-500 text-[13px] leading-tight font-semibold">
                                        {l}
                                    </dt>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                {/* ── Marquee ──────────────────────────────────── */}
                <div
                    aria-hidden
                    className="border-harbor-800 bg-harbor overflow-hidden border-y py-3.5"
                >
                    <div className="marquee-track flex w-max items-center gap-8 pr-8">
                        {[0, 1].map((copy) => (
                            <div key={copy} className="flex items-center gap-8">
                                {[
                                    'Participants',
                                    'Skills',
                                    'Projects',
                                    'Organisations',
                                    'Impact',
                                ].map((w) => (
                                    <span
                                        key={`${copy}-${w}`}
                                        className="text-sand-100 flex items-center gap-8 text-sm font-extrabold tracking-[0.22em] whitespace-nowrap uppercase"
                                    >
                                        {w}
                                        <Sparkles className="text-amber size-4" />
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Platform Concept ─────────────────────────── */}
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-2xl text-center">
                        <Eyebrow icon={Leaf}>The platform concept</Eyebrow>
                        <h2 className="text-harbor mt-4 text-3xl font-bold tracking-tight sm:text-[2.6rem] sm:leading-tight">
                            One profile. Every{' '}
                            <span className="text-sienna">opportunity</span>.
                        </h2>
                        <p className="text-ember-500 mt-4 text-[17px] leading-relaxed">
                            ProjectLink is not a job board — it is a project and
                            opportunity platform where skills meet meaningful
                            work.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {[
                            {
                                icon: Compass,
                                bar: 'from-harbor to-harbor-700',
                                tile: 'bg-harbor/10 text-harbor',
                                title: 'Discover Projects',
                                text: 'Explore ongoing and upcoming projects from participating organisations — all in one trusted place.',
                            },
                            {
                                icon: Award,
                                bar: 'from-sienna to-amber',
                                tile: 'bg-sienna/10 text-sienna',
                                title: 'Build Your Profile',
                                text: 'Create a professional profile showcasing your experience, education, skills and qualifications.',
                            },
                            {
                                icon: HeartHandshake,
                                bar: 'from-moss to-moss-700',
                                tile: 'bg-moss/15 text-moss-600',
                                title: 'Participate & Contribute',
                                text: 'Apply for projects, become a participant when selected and contribute your skills to real outcomes.',
                            },
                        ].map((c) => (
                            <article
                                key={c.title}
                                className="group border-harbor/10 hover:shadow-harbor/10 relative overflow-hidden rounded-3xl border bg-white p-8 shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl"
                            >
                                <span
                                    aria-hidden
                                    className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${c.bar}`}
                                />
                                <span
                                    className={`inline-flex size-13 items-center justify-center rounded-2xl ${c.tile} transition-transform group-hover:scale-110 group-hover:-rotate-3`}
                                >
                                    <c.icon
                                        className="size-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <h3 className="text-harbor mt-5 text-xl font-bold">
                                    {c.title}
                                </h3>
                                <p className="text-ember-500 mt-2.5 leading-relaxed">
                                    {c.text}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ── How It Works (dark) ──────────────────────── */}
                <section
                    id="how-it-works"
                    className="scroll-mt-20 px-4 sm:px-6 lg:px-8"
                >
                    <div className="bg-harbor-900 shadow-harbor/40 relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] px-6 py-14 shadow-2xl sm:px-10 lg:px-14 lg:py-20">
                        <div
                            aria-hidden
                            className="bg-sienna/25 pointer-events-none absolute -top-24 right-0 size-96 rounded-full blur-3xl"
                        />
                        <div
                            aria-hidden
                            className="bg-amber/15 pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full blur-3xl"
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 opacity-40"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle, rgba(244,234,217,0.12) 1px, transparent 1px)',
                                backgroundSize: '26px 26px',
                            }}
                        />
                        <div className="relative mx-auto max-w-2xl text-center">
                            <Eyebrow icon={Sparkles} dark>
                                How it works
                            </Eyebrow>
                            <h2 className="text-sand-50 mt-4 text-3xl font-bold tracking-tight sm:text-[2.6rem] sm:leading-tight">
                                From sign-up to{' '}
                                <span className="text-amber-200">impact</span>{' '}
                                in four steps
                            </h2>
                        </div>
                        <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                            <div
                                aria-hidden
                                className="from-sienna via-amber to-clay absolute top-7 right-[12%] left-[12%] hidden h-0.5 rounded bg-gradient-to-r lg:block"
                            />
                            {steps.map((s) => (
                                <div key={s.n} className="relative">
                                    <div className="flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-amber-200 shadow-lg backdrop-blur">
                                        <s.icon
                                            className="size-6"
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <p className="mt-5 text-4xl font-extrabold tracking-tight text-white/15">
                                        {s.n}
                                    </p>
                                    <h3 className="text-sand-50 -mt-7 text-lg font-bold">
                                        {s.title}
                                    </h3>
                                    <p className="text-sand-100/70 mt-2 max-w-xs text-[14.5px] leading-relaxed">
                                        {s.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="relative mt-12 text-center">
                            <Link
                                href={register()}
                                className="bg-amber shadow-amber/25 inline-flex h-12 items-center gap-2 rounded-full px-8 text-[15px] font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-amber-600"
                            >
                                Start with step one — it's free
                                <ArrowRight className="size-4.5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Project Discovery Preview ────────────────── */}
                <section id="projects" className="scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl">
                                <Eyebrow icon={Compass}>
                                    Project discovery
                                </Eyebrow>
                                <h2 className="text-harbor mt-4 text-3xl font-bold tracking-tight sm:text-[2.6rem] sm:leading-tight">
                                    Real projects.{' '}
                                    <span className="text-sienna">
                                        Real opportunities.
                                    </span>
                                </h2>
                                <p className="text-ember-500 mt-4 text-[17px]">
                                    A preview of the kinds of projects
                                    organisations publish on ProjectLink.
                                </p>
                            </div>
                            <a
                                href="#cta"
                                className="text-sienna hover:text-sienna-600 inline-flex shrink-0 items-center gap-1.5 text-sm font-bold transition-colors"
                            >
                                View all projects
                                <ArrowUpRight className="size-4.5" />
                            </a>
                        </div>

                        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                            {projects.map((p) => (
                                <article
                                    key={p.name}
                                    className="group border-harbor/10 hover:border-sienna/30 hover:shadow-harbor/10 relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl"
                                >
                                    <span
                                        aria-hidden
                                        className={`absolute inset-x-0 top-0 h-1.5 ${p.edge}`}
                                    />
                                    <div className="flex flex-1 flex-col p-6 pt-7">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="bg-moss/15 text-moss-600 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide uppercase">
                                                {p.category}
                                            </span>
                                            <span className="text-harbor inline-flex items-center gap-1.5 text-[11px] font-bold">
                                                <StatusDot
                                                    tone={p.statusTone}
                                                />
                                                {p.status}
                                            </span>
                                        </div>
                                        <h3 className="text-harbor mt-4 text-[17px] leading-snug font-bold">
                                            {p.name}
                                        </h3>
                                        <p className="text-ember-500 mt-1 flex items-center gap-1.5 text-[13px] font-semibold">
                                            <Building2 className="text-clay-600 size-3.5 shrink-0" />
                                            {p.organisation}
                                        </p>
                                        <p className="text-ember-500 mt-3 text-sm leading-relaxed">
                                            {p.description}
                                        </p>
                                        <ul className="text-ember-600 mt-4 space-y-1.5 text-[13px] font-semibold">
                                            <li className="flex items-center gap-2">
                                                <MapPin className="text-sienna size-3.5 shrink-0" />
                                                {p.location}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CalendarDays className="text-sienna size-3.5 shrink-0" />
                                                {p.start}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Users className="text-sienna size-3.5 shrink-0" />
                                                {p.needed} ·{' '}
                                                <span className="font-extrabold text-amber-600">
                                                    {p.spotsLeft}
                                                </span>
                                            </li>
                                        </ul>
                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                            {p.skills.map((s) => (
                                                <span
                                                    key={s}
                                                    className="border-harbor/10 bg-sand-100 text-harbor rounded-full border px-2.5 py-1 text-[11px] font-bold"
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="border-harbor/10 mt-5 border-t pt-4">
                                            <Link
                                                href={
                                                    auth.user
                                                        ? dashboard()
                                                        : register()
                                                }
                                                className="bg-harbor text-sand-50 group-hover:bg-sienna group-hover:shadow-sienna/30 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-sm font-bold transition-all group-hover:shadow-lg"
                                            >
                                                View Project
                                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── For Organisations ────────────────────────── */}
                <section id="organisations" className="scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                        <div className="from-harbor-800 via-harbor to-sienna-700 text-sand-50 shadow-harbor/40 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br px-6 py-12 shadow-2xl sm:px-10 lg:px-14 lg:py-16">
                            <div
                                aria-hidden
                                className="bg-clay/40 pointer-events-none absolute -top-20 -right-20 size-80 rounded-full blur-3xl"
                            />
                            <div
                                aria-hidden
                                className="bg-amber/25 pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full blur-3xl"
                            />
                            <div
                                aria-hidden
                                className="from-clay via-amber to-clay pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r"
                            />
                            <div className="relative grid items-center gap-12 lg:grid-cols-2">
                                <div>
                                    <Eyebrow icon={Leaf} dark>
                                        For organisations
                                    </Eyebrow>
                                    <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-[2.6rem]">
                                        Manage your projects. Find the{' '}
                                        <span className="text-amber-200">
                                            right participants.
                                        </span>
                                    </h2>
                                    <p className="text-sand-100/80 mt-4 max-w-lg text-[16px] leading-relaxed">
                                        Publish opportunities, review rich
                                        participant profiles and run your entire
                                        project lifecycle — teams, timesheets
                                        and reports — from one dashboard.
                                    </p>
                                    <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                        {orgPoints.map((pt) => (
                                            <li
                                                key={pt}
                                                className="text-sand-50/95 flex items-start gap-2.5 text-[14.5px] font-semibold"
                                            >
                                                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-amber-200" />
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                        <a
                                            href="#cta"
                                            className="bg-amber inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-bold text-white shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-amber-600"
                                        >
                                            Partner With Us
                                            <ArrowRight className="size-4.5" />
                                        </a>
                                        <a
                                            href="#benefits"
                                            className="border-sand-50/40 text-sand-50 inline-flex h-12 items-center justify-center rounded-full border px-7 text-[15px] font-semibold transition-colors hover:bg-white/10"
                                        >
                                            Explore Platform Benefits
                                        </a>
                                    </div>
                                </div>

                                {/* Dashboard mock */}
                                <div
                                    aria-hidden
                                    className="text-ember rounded-3xl border border-white/20 bg-white p-5 shadow-2xl backdrop-blur sm:p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-harbor text-sm font-extrabold">
                                            Project overview
                                        </p>
                                        <span className="bg-moss/15 text-moss-600 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold">
                                            <span className="bg-moss size-1.5 animate-pulse rounded-full" />
                                            Active
                                        </span>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                                        {[
                                            {
                                                v: '46',
                                                l: 'Applications',
                                                hot: false,
                                            },
                                            {
                                                v: '24',
                                                l: 'Selected',
                                                hot: true,
                                            },
                                            {
                                                v: '312h',
                                                l: 'Logged',
                                                hot: false,
                                            },
                                        ].map((k) => (
                                            <div
                                                key={k.l}
                                                className={`rounded-2xl border p-3 ${
                                                    k.hot
                                                        ? 'border-sienna/40 from-sienna/15 to-amber/15 bg-gradient-to-b'
                                                        : 'border-harbor/10 bg-sand-100'
                                                }`}
                                            >
                                                <p
                                                    className={`text-xl font-extrabold ${k.hot ? 'text-sienna' : 'text-harbor'}`}
                                                >
                                                    {k.v}
                                                </p>
                                                <p className="text-ember-500 text-[11px] font-bold">
                                                    {k.l}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 space-y-2.5">
                                        {[
                                            {
                                                n: 'Thandi N. — Mentor',
                                                tag: 'Shortlisted',
                                                cls: 'bg-moss/15 text-moss-600',
                                            },
                                            {
                                                n: 'Timesheets — Week 6',
                                                tag: '18 approved',
                                                cls: 'bg-harbor/10 text-harbor',
                                            },
                                            {
                                                n: 'Impact report — Q3',
                                                tag: 'Ready',
                                                cls: 'bg-clay/20 text-sienna-600',
                                            },
                                        ].map((r) => (
                                            <div
                                                key={r.n}
                                                className="border-harbor/10 flex items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-[13px]"
                                            >
                                                <span className="text-ember font-bold">
                                                    {r.n}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${r.cls}`}
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

                {/* ── Platform Benefits ────────────────────────── */}
                <section id="benefits" className="scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                        <div className="mx-auto max-w-2xl text-center">
                            <Eyebrow icon={ShieldCheck}>
                                Platform benefits
                            </Eyebrow>
                            <h2 className="text-harbor mt-4 text-3xl font-bold tracking-tight sm:text-[2.6rem] sm:leading-tight">
                                Built for{' '}
                                <span className="text-sienna">
                                    scale and trust
                                </span>
                            </h2>
                            <p className="text-ember-500 mt-4 text-[17px]">
                                Designed to support many organisations and
                                thousands of participants and users.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {benefits.map((b) => (
                                <article
                                    key={b.title}
                                    className="group border-harbor/10 hover:shadow-harbor/10 rounded-3xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <span
                                        className={`inline-flex size-11 items-center justify-center rounded-xl ${b.tile} transition-transform group-hover:scale-110`}
                                    >
                                        <b.icon
                                            className="size-5.5"
                                            strokeWidth={2}
                                        />
                                    </span>
                                    <h3 className="text-harbor mt-4 font-bold">
                                        {b.title}
                                    </h3>
                                    <p className="text-ember-500 mt-1.5 text-sm leading-relaxed">
                                        {b.text}
                                    </p>
                                </article>
                            ))}
                            <article className="bg-ember text-sand-50 relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-lg sm:col-span-2 lg:col-span-1">
                                <div
                                    aria-hidden
                                    className="bg-amber/25 pointer-events-none absolute -top-10 -right-10 size-40 rounded-full blur-3xl"
                                />
                                <div className="relative">
                                    <span className="bg-clay/25 text-clay-300 inline-flex size-11 items-center justify-center rounded-xl">
                                        <ShieldCheck
                                            className="size-5.5"
                                            strokeWidth={2}
                                        />
                                    </span>
                                    <h3 className="mt-4 font-bold">
                                        Trusted by design
                                    </h3>
                                    <p className="text-sand-100/75 mt-1.5 text-sm leading-relaxed">
                                        Verified organisations, structured
                                        applications and transparent project
                                        lifecycles.
                                    </p>
                                </div>
                                <div className="text-clay-300 relative mt-4 flex items-center gap-1.5 text-xs font-extrabold">
                                    <Layers className="size-4" />
                                    Enterprise-ready governance
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ─────────────────────────────── */}
                <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                    <div className="grid gap-5 md:grid-cols-3">
                        {testimonials.map((t) => (
                            <figure
                                key={t.name}
                                className="border-harbor/10 hover:shadow-harbor/10 flex flex-col rounded-3xl border bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                <Quote
                                    aria-hidden
                                    className="text-clay size-7"
                                    fill="currentColor"
                                />
                                <blockquote className="text-ember mt-4 flex-1 text-[15.5px] leading-relaxed font-medium">
                                    “{t.quote}”
                                </blockquote>
                                <div
                                    className="mt-5 flex items-center gap-1"
                                    aria-label="5 out of 5 stars"
                                >
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="text-amber size-3.5"
                                            fill="currentColor"
                                        />
                                    ))}
                                </div>
                                <figcaption className="border-harbor/10 mt-3 flex items-center gap-3 border-t pt-4">
                                    <span
                                        aria-hidden
                                        className={`flex size-10 items-center justify-center rounded-full text-xs font-extrabold ${t.tile}`}
                                    >
                                        {t.initials}
                                    </span>
                                    <span>
                                        <span className="text-harbor block text-sm font-extrabold">
                                            {t.name}
                                        </span>
                                        <span className="text-ember-500 block text-xs font-medium">
                                            {t.role}
                                        </span>
                                    </span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>

                {/* ── Final CTA ────────────────────────────────── */}
                <section id="cta" className="scroll-mt-20">
                    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                        <div className="from-sienna via-sienna-600 shadow-sienna/30 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br to-amber-600 px-6 py-14 text-center shadow-2xl sm:px-12 lg:py-20">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[40rem] -translate-x-1/2 rounded-full bg-white/20 blur-3xl"
                            />
                            <div
                                aria-hidden
                                className="bg-harbor/30 pointer-events-none absolute -right-20 -bottom-24 size-80 rounded-full blur-3xl"
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 left-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
                            />
                            <div
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 left-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
                            />
                            <div className="relative mx-auto max-w-2xl">
                                <AppLogoIcon
                                    alt=""
                                    aria-hidden="true"
                                    className="mx-auto size-14 rounded-2xl object-contain shadow-lg"
                                />
                                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-[2.75rem] sm:leading-tight">
                                    Your next project starts here.
                                </h2>
                                <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-white/85">
                                    Whether you're looking for an opportunity to
                                    contribute your skills or an organisation
                                    looking for participants for your next
                                    project, AlphaForce ProjectLink brings
                                    everyone together.
                                </p>
                                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                    <a
                                        href="#projects"
                                        className="bg-harbor-900 text-sand-50 hover:bg-harbor-800 inline-flex h-13 items-center justify-center gap-2 rounded-full px-8 text-[15px] font-bold shadow-xl transition-all hover:-translate-y-0.5"
                                    >
                                        <Compass className="size-5" />
                                        Explore Projects
                                    </a>
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 border-white/60 px-8 text-[15px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
                                        >
                                            Go to Dashboard
                                            <ArrowRight className="size-5" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={register()}
                                            className="inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 border-white/60 px-8 text-[15px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
                                        >
                                            Join ProjectLink
                                            <ArrowRight className="size-5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Footer ───────────────────────────────────── */}
                <footer className="bg-harbor-900 text-sand-100/80 relative overflow-hidden">
                    <div
                        aria-hidden
                        className="from-sienna via-amber to-clay pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r"
                    />
                    <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <AppLogoIcon className="size-9 rounded-xl object-contain" />
                                    <span className="text-sand-50 text-[15px] font-bold">
                                        AlphaForce ProjectLink
                                    </span>
                                </div>
                                <p className="text-sand-100/60 mt-4 max-w-xs text-sm leading-relaxed">
                                    Connect. Participate. Make an Impact. The
                                    project and opportunity platform bringing
                                    participants and organisations together.
                                </p>
                            </div>
                            <nav aria-label="Platform">
                                <p className="text-xs font-extrabold tracking-widest text-amber-200 uppercase">
                                    Platform
                                </p>
                                <ul className="mt-4 space-y-2.5 text-sm font-semibold">
                                    {[
                                        ['About', '#organisations'],
                                        ['Projects', '#projects'],
                                        ['How It Works', '#how-it-works'],
                                        ['Contact', '#cta'],
                                    ].map(([label, href]) => (
                                        <li key={label}>
                                            <a
                                                href={href}
                                                className="hover:text-sand-50 transition-colors"
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                            <nav aria-label="Legal">
                                <p className="text-xs font-extrabold tracking-widest text-amber-200 uppercase">
                                    Legal
                                </p>
                                <ul className="mt-4 space-y-2.5 text-sm font-semibold">
                                    {[
                                        'Privacy Policy',
                                        'Terms & Conditions',
                                    ].map((label) => (
                                        <li key={label}>
                                            <a
                                                href="#top"
                                                className="hover:text-sand-50 transition-colors"
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                            <nav aria-label="Account">
                                <p className="text-xs font-extrabold tracking-widest text-amber-200 uppercase">
                                    Account
                                </p>
                                <ul className="mt-4 space-y-2.5 text-sm font-semibold">
                                    <li>
                                        <Link
                                            href={login()}
                                            className="hover:text-sand-50 transition-colors"
                                        >
                                            Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={register()}
                                            className="hover:text-sand-50 transition-colors"
                                        >
                                            Register
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                        <div className="text-sand-100/50 mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[13px] sm:flex-row">
                            <p>
                                © 2026 AlphaForce ProjectLink. All rights
                                reserved.
                            </p>
                            <p className="inline-flex items-center gap-1.5 font-semibold">
                                <Leaf className="text-clay-300 size-3.5" />
                                Professional · Trustworthy · Impact-driven
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
