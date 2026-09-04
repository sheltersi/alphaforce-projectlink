import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BadgeCheck,
    Building2,
    Clock3,
    Eye,
    FileText,
    LayoutDashboard,
    MailCheck,
    Network,
    Sparkles,
    UserRound,
} from 'lucide-react';

type StepState = 'done' | 'current' | 'todo';

const steps: { label: string; icon: typeof Eye; state: StepState }[] = [
    { label: 'Registration', icon: UserRound, state: 'done' },
    { label: 'Email Verification', icon: MailCheck, state: 'done' },
    { label: 'Welcome', icon: Sparkles, state: 'current' },
    { label: 'Build Your Profile', icon: FileText, state: 'todo' },
    { label: 'Profile Preview', icon: Eye, state: 'todo' },
    { label: 'Dashboard', icon: LayoutDashboard, state: 'todo' },
];

function StepCircle({ index, state }: { index: number; state: StepState }) {
    if (state === 'done') {
        return (
            <span className="flex size-9 items-center justify-center rounded-full bg-moss text-white shadow-md shadow-moss/30">
                <BadgeCheck className="size-4.5" />
            </span>
        );
    }
    if (state === 'current') {
        return (
            <span className="relative flex size-9 items-center justify-center rounded-full bg-sienna text-white shadow-lg shadow-sienna/40">
                <span className="absolute inset-0 animate-ping rounded-full bg-sienna opacity-30" />
                <Sparkles className="relative size-4.5" />
            </span>
        );
    }
    return (
        <span className="flex size-9 items-center justify-center rounded-full border border-harbor/15 bg-white text-[13px] font-extrabold text-ember-400">
            {index + 1}
        </span>
    );
}

export default function OnboardingWelcome() {
    const { auth } = usePage().props as unknown as {
        auth: { user: { name: string } | null };
    };
    const fullName = auth.user?.name?.trim() || 'there';
    const firstName = fullName.split(/\s+/)[0];
    const initials = fullName
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <>
            <Head title="Welcome to ProjectLink" />
            <div className="flex min-h-svh flex-col bg-sand-50 font-sans text-ember antialiased">
                {/* ── Top bar ─────────────────────────────── */}
                <header className="border-b border-harbor/10 bg-sand-50/85 backdrop-blur-md">
                    <div
                        aria-hidden
                        className="h-1 bg-gradient-to-r from-harbor via-sienna to-amber"
                    />
                    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <span className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-harbor text-sand-50 shadow-md shadow-harbor/25">
                                <Network
                                    className="size-5"
                                    strokeWidth={2.2}
                                />
                            </span>
                            <span className="text-[15px] font-bold tracking-tight text-harbor">
                                AlphaForce ProjectLink
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-2.5">
                            <span className="hidden text-sm font-semibold text-ember-500 sm:block">
                                {fullName}
                            </span>
                            <span
                                aria-hidden
                                className="flex size-9 items-center justify-center rounded-full bg-sienna text-xs font-extrabold text-white shadow-md shadow-sienna/30"
                            >
                                {initials}
                            </span>
                        </span>
                    </div>
                </header>

                {/* ── Content ─────────────────────────────── */}
                <main className="relative flex-1 overflow-hidden">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-clay/25 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-amber/15 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-70"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, rgba(30,47,68,0.07) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                            maskImage:
                                'linear-gradient(to bottom, black 0%, transparent 55%)',
                            WebkitMaskImage:
                                'linear-gradient(to bottom, black 0%, transparent 55%)',
                        }}
                    />

                    <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                        {/* ── Journey tracker ─────────────── */}
                        <nav aria-label="Onboarding progress">
                            <ol className="hidden items-start sm:flex">
                                {steps.map((s, i) => (
                                    <li
                                        key={s.label}
                                        className="flex flex-1 flex-col items-center gap-2 last:flex-none"
                                    >
                                        <span className="flex w-full items-center">
                                            <span
                                                aria-hidden
                                                className={`h-0.5 flex-1 rounded ${
                                                    i === 0
                                                        ? 'bg-transparent'
                                                        : steps[i - 1].state ===
                                                            'done'
                                                          ? 'bg-moss/50'
                                                          : 'bg-harbor/10'
                                                }`}
                                            />
                                            <StepCircle
                                                index={i}
                                                state={s.state}
                                            />
                                            <span
                                                aria-hidden
                                                className={`h-0.5 flex-1 rounded ${
                                                    s.state === 'done'
                                                        ? 'bg-moss/50'
                                                        : 'bg-harbor/10'
                                                } ${i === steps.length - 1 ? 'bg-transparent' : ''}`}
                                            />
                                        </span>
                                        <span
                                            className={`text-center text-[11px] leading-tight font-bold ${
                                                s.state === 'current'
                                                    ? 'text-sienna'
                                                    : s.state === 'done'
                                                      ? 'text-moss-600'
                                                      : 'text-ember-400'
                                            }`}
                                            aria-current={
                                                s.state === 'current'
                                                    ? 'step'
                                                    : undefined
                                            }
                                        >
                                            {s.label}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <p className="text-center text-[13px] font-bold text-ember-500 sm:hidden">
                                Step 3 of 6 ·{' '}
                                <span className="text-sienna">Welcome</span>
                            </p>
                        </nav>

                        {/* ── Welcome card ────────────────── */}
                        <section className="mt-8 rounded-[2rem] border border-harbor/10 bg-white px-6 py-10 text-center shadow-2xl shadow-harbor/15 sm:mt-10 sm:px-12 sm:py-12">
                            <p className="inline-flex items-center gap-2 rounded-full border border-moss/25 bg-moss/10 px-4 py-1.5 text-xs font-extrabold text-moss-600">
                                <BadgeCheck className="size-4" />
                                Email verified — you're in
                            </p>

                            <h1 className="mt-6 text-3xl leading-tight font-bold tracking-tight text-harbor sm:text-4xl">
                                Welcome to AlphaForce ProjectLink,{' '}
                                <span className="text-sienna">
                                    {firstName}
                                </span>
                                .
                            </h1>
                            <p className="mx-auto mt-4 max-w-md text-[16.5px] leading-relaxed text-ember-500">
                                Let's build your profile so organisations can
                                discover what you can bring to their
                                projects.
                            </p>

                            {/* ── Profile completion ──────── */}
                            <div className="mt-8 rounded-2xl border border-harbor/10 bg-sand-100 p-5 text-left sm:p-6">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="inline-flex items-center gap-2 text-[15px] font-extrabold text-harbor">
                                        <UserRound className="size-4.5 text-clay-600" />
                                        Your Profile
                                    </p>
                                    <p className="text-sm font-extrabold text-sienna">
                                        0% Complete
                                    </p>
                                </div>
                                <div
                                    role="progressbar"
                                    aria-valuenow={0}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label="Profile completion"
                                    className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-harbor/10"
                                >
                                    <div
                                        className="h-full w-0 rounded-full bg-gradient-to-r from-sienna to-amber"
                                    />
                                </div>
                                <p className="mt-3 text-[13px] leading-relaxed text-ember-500">
                                    Every section you complete makes your
                                    profile stronger — start with the basics.
                                </p>
                            </div>

                            <p className="mt-8 text-lg font-bold text-harbor">
                                Let's get you started.
                            </p>
                            <Link
                                href="/onboarding/build-profile"
                                className="mt-4 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-sienna px-8 text-[15.5px] font-bold text-white shadow-xl shadow-sienna/35 transition-all hover:-translate-y-0.5 hover:bg-sienna-600 sm:w-auto sm:min-w-72"
                            >
                                Build My Profile
                                <ArrowRight className="size-5" />
                            </Link>

                            <ul className="mt-8 flex flex-col items-center justify-center gap-x-7 gap-y-2.5 border-t border-harbor/10 pt-6 text-[13px] font-semibold text-ember-500 sm:flex-row">
                                <li className="inline-flex items-center gap-1.5">
                                    <Clock3 className="size-4 text-clay-600" />
                                    Takes about 10 minutes
                                </li>
                                <li className="inline-flex items-center gap-1.5">
                                    <Award className="size-4 text-clay-600" />
                                    Showcase your experience
                                </li>
                                <li className="inline-flex items-center gap-1.5">
                                    <Building2 className="size-4 text-clay-600" />
                                    Get discovered
                                </li>
                            </ul>
                        </section>

                        <p className="mt-6 text-center text-[13px] font-medium text-ember-400">
                            You can complete your profile in stages — your
                            progress saves automatically.
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
