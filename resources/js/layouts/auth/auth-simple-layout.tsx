import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock3,
    Compass,
    Network,
    ShieldCheck,
    Sparkles,
    Star,
    UserRound,
} from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const highlights = [
    {
        icon: Compass,
        title: 'Discover projects',
        text: 'Ongoing and upcoming projects from verified organisations.',
    },
    {
        icon: UserRound,
        title: 'One professional profile',
        text: 'Your experience, skills and qualifications in a single place.',
    },
    {
        icon: Clock3,
        title: 'Track your impact',
        text: 'Log hours, follow progress and build a record of contribution.',
    },
];

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-sand-50 font-sans text-ember antialiased">
            <div className="grid min-h-svh lg:grid-cols-[1fr_1.05fr]">
                {/* ── Brand showcase ─────────────────────────── */}
                <div className="relative hidden overflow-hidden bg-harbor-900 lg:flex lg:flex-col">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-28 -left-24 size-96 rounded-full bg-sienna/30 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-28 -bottom-28 size-96 rounded-full bg-amber/20 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-50"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, rgba(244,234,217,0.10) 1px, transparent 1px)',
                            backgroundSize: '26px 26px',
                        }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sienna via-amber to-clay"
                    />

                    <div className="relative z-10 flex h-full flex-col p-10 xl:p-14">
                        <Link href={home()} className="flex items-center gap-2.5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-sand-50 text-harbor shadow-lg">
                                <Network
                                    className="size-5.5"
                                    strokeWidth={2.2}
                                />
                            </span>
                            <span className="leading-tight">
                                <span className="block text-[16px] font-bold tracking-tight text-sand-50">
                                    AlphaForce ProjectLink
                                </span>
                                <span className="block text-[11px] font-semibold tracking-wide text-amber-200">
                                    Connect. Participate. Make an Impact.
                                </span>
                            </span>
                        </Link>

                        <div className="mt-12">
                            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] text-amber-200 uppercase">
                                <Sparkles className="size-3.5" />
                                The opportunity platform
                            </p>
                            <h2 className="mt-5 text-4xl leading-[1.08] font-bold tracking-tight text-sand-50 xl:text-[3.2rem]">
                                Where skills meet{' '}
                                <span className="relative whitespace-nowrap text-amber-200">
                                    meaningful
                                    <svg
                                        aria-hidden
                                        viewBox="0 0 220 12"
                                        preserveAspectRatio="none"
                                        className="absolute -bottom-1 left-0 h-2.5 w-full text-sienna"
                                    >
                                        <path
                                            d="M3 9C60 3 160 3 217 8"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            fill="none"
                                        />
                                    </svg>
                                </span>{' '}
                                projects.
                            </h2>
                            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-sand-100/70">
                                Join thousands of participants discovering
                                projects, showcasing their skills and making
                                an impact with leading organisations.
                            </p>
                        </div>

                        <ul className="mt-10 space-y-5">
                            {highlights.map((h) => (
                                <li key={h.title} className="flex gap-4">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-amber-200">
                                        <h.icon
                                            className="size-5"
                                            strokeWidth={2}
                                        />
                                    </span>
                                    <span>
                                        <span className="block text-[15px] font-bold text-sand-50">
                                            {h.title}
                                        </span>
                                        <span className="mt-0.5 block text-sm leading-relaxed text-sand-100/65">
                                            {h.text}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-auto pt-10">
                            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                                <div
                                    className="flex items-center gap-1"
                                    aria-label="Rated 4.9 out of 5"
                                >
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="size-3.5 text-amber"
                                            fill="currentColor"
                                        />
                                    ))}
                                    <span className="ml-1.5 text-sm font-extrabold text-sand-50">
                                        4.9
                                    </span>
                                </div>
                                <p className="mt-2.5 text-[14.5px] leading-relaxed font-medium text-sand-50/90">
                                    “I built my profile once and applied to
                                    three projects in a week. Two accepted
                                    me.”
                                </p>
                                <p className="mt-3 text-[13px] font-bold text-amber-200">
                                    Amara O.{' '}
                                    <span className="font-medium text-sand-100/60">
                                        · Participant, Youth mentor
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Form side ──────────────────────────────── */}
                <div className="relative flex flex-col overflow-hidden">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-clay/25 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full bg-amber/15 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-70"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, rgba(30,47,68,0.08) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                            maskImage:
                                'linear-gradient(to bottom, black 0%, transparent 60%)',
                            WebkitMaskImage:
                                'linear-gradient(to bottom, black 0%, transparent 60%)',
                        }}
                    />

                    <div className="relative z-10 flex items-center justify-between px-4 pt-5 sm:px-8">
                        <Link
                            href={home()}
                            className="flex items-center gap-2.5 lg:hidden"
                        >
                            <span className="flex size-9 items-center justify-center rounded-xl bg-harbor text-sand-50 shadow-md">
                                <Network
                                    className="size-5"
                                    strokeWidth={2.2}
                                />
                            </span>
                            <span className="text-[15px] font-bold tracking-tight text-harbor">
                                AlphaForce ProjectLink
                            </span>
                        </Link>
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-harbor transition-colors hover:text-sienna"
                        >
                            <ArrowLeft className="size-4" />
                            Back to home
                        </Link>
                    </div>

                    <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
                        <div className="w-full max-w-md">
                            <div className="rounded-[1.75rem] border border-harbor/10 bg-white p-7 shadow-2xl shadow-harbor/15 sm:p-9">
                                <h1 className="text-[1.65rem] font-bold tracking-tight text-harbor">
                                    {title}
                                </h1>
                                <p className="mt-1.5 text-[15px] text-ember-500">
                                    {description}
                                </p>
                                <div className="mt-7">{children}</div>
                            </div>
                            <p className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-ember-500">
                                <ShieldCheck className="size-4 text-moss-600" />
                                Verified organisations · Secure by design
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
