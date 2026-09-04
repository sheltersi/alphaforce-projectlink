import { Link } from "@inertiajs/react";
import {
    ArrowLeft,
    CalendarCheck2,
    Compass,
    Network,
    ShieldCheck,
    Sparkles,
    Star,
    UserRound,
} from "lucide-react";
import { home } from "@/routes";
import type { AuthLayoutProps } from "@/types";

const highlights = [
    {
        icon: Compass,
        title: "Discover projects",
        text: "Ongoing and upcoming projects from verified organisations.",
    },
    {
        icon: UserRound,
        title: "One professional profile",
        text: "Your experience, skills and qualifications in a single place.",
    },
    {
        icon: CalendarCheck2,
        title: "Track your impact",
        text: "Log hours, follow progress and build a record of contribution.",
    },
];

const stats = [
    { value: "2,400+", label: "Participants" },
    { value: "150+", label: "Live projects" },
    { value: "40+", label: "Organisations" },
];

const avatarStack = [
    { initials: "SJ", bg: "bg-sienna" },
    { initials: "JC", bg: "bg-harbor" },
    { initials: "PN", bg: "bg-moss" },
    { initials: "AO", bg: "bg-clay-600" },
];

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const isRegister = /join/i.test(title ?? "");

    return (
        <div className="bg-sand-50 text-ember min-h-svh font-sans antialiased">
            <div className="grid min-h-svh lg:grid-cols-[1fr_1.05fr]">
                {/* ── Team showcase ──────────────────────────── */}
                <div className="bg-harbor-900 relative hidden overflow-hidden lg:block">
                    {/* Photo with slow cinematic zoom */}
                    <img
                        src="/team-page.png"
                        alt="Diverse ProjectLink team collaborating around a laptop, surrounded by profile, task and timeline cards"
                        className="animate-kenburns absolute inset-0 h-full w-full object-cover object-center"
                    />
                    {/* Deep scrims for legibility — photo stays visible through the middle */}
                    <div
                        aria-hidden
                        className="from-harbor-900/95 via-harbor-900/40 to-harbor-900/97 absolute inset-0 bg-gradient-to-b"
                    />
                    <div
                        aria-hidden
                        className="from-harbor-900/65 via-harbor-900/15 to-harbor-900/45 absolute inset-0 bg-gradient-to-r"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-40"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle, rgba(244,234,217,0.12) 1px, transparent 1px)",
                            backgroundSize: "26px 26px",
                        }}
                    />
                    <div
                        aria-hidden
                        className="from-sienna via-amber to-clay absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r"
                    />

                    <div className="relative z-10 flex h-full min-h-svh flex-col p-10 xl:p-14">
                        <div className="flex items-center justify-between gap-4">
                            <Link
                                href={home()}
                                className="flex items-center gap-2.5"
                            >
                                <span className="bg-sand-50 text-harbor flex size-10 items-center justify-center rounded-xl shadow-lg">
                                    <Network
                                        className="size-5.5"
                                        strokeWidth={2.2}
                                    />
                                </span>
                                <span className="leading-tight">
                                    <span className="text-sand-50 block text-[16px] font-bold tracking-tight drop-shadow">
                                        AlphaForce ProjectLink
                                    </span>
                                    <span className="block text-[11px] font-semibold tracking-wide text-amber-200">
                                        Connect. Participate. Make an Impact.
                                    </span>
                                </span>
                            </Link>
                        </div>

                        <div className="mt-auto pt-16">
                            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] text-amber-200 uppercase backdrop-blur-md">
                                <Sparkles className="size-3.5" />
                                {isRegister
                                    ? "Join the opportunity platform"
                                    : "The opportunity platform"}
                            </p>
                            <h2 className="mt-5 max-w-lg text-4xl leading-[1.06] font-bold tracking-tight text-white drop-shadow-lg xl:text-[3.4rem]">
                                Where skills meet{" "}
                                <span className="relative whitespace-nowrap text-amber-200">
                                    meaningful
                                    {/* purposely removed the svg icon from here */}
                                </span>{" "}
                                projects.
                            </h2>
                            <p className="text-sand-100/85 mt-5 max-w-md text-[16px] leading-relaxed drop-shadow">
                                {isRegister
                                    ? "Create your profile once — then get discovered by verified organisations running real projects."
                                    : "Log in to track your applications, log hours and keep building your impact record."}
                            </p>

                            {/* Stats */}
                            <dl className="bg-harbor-900/55 mt-7 flex divide-x divide-white/15 rounded-2xl border border-white/15 backdrop-blur-md">
                                {stats.map((s) => (
                                    <div
                                        key={s.label}
                                        className="flex-1 px-5 py-4"
                                    >
                                        <dt className="text-sand-100/70 order-2 mt-0.5 block text-[11.5px] font-semibold">
                                            {s.label}
                                        </dt>
                                        <dd className="order-1 text-[1.45rem] leading-none font-extrabold tracking-tight text-amber-200">
                                            {s.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            {/* Highlights */}
                            <ul className="mt-6 space-y-3.5">
                                {highlights.map((h) => (
                                    <li key={h.title} className="flex gap-3.5">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-amber-200 backdrop-blur-md">
                                            <h.icon
                                                className="size-5"
                                                strokeWidth={2}
                                            />
                                        </span>
                                        <span>
                                            <span className="block text-[14.5px] font-bold text-white">
                                                {h.title}
                                            </span>
                                            <span className="text-sand-100/70 mt-0.5 block text-[13.5px] leading-relaxed">
                                                {h.text}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* Testimonial */}
                            <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                                <div className="flex items-center justify-between gap-3">
                                    <div
                                        className="flex items-center gap-1"
                                        aria-label="Rated 4.9 out of 5"
                                    >
                                        {Array.from({ length: 5 }).map(
                                            (_, i) => (
                                                <Star
                                                    key={i}
                                                    className="text-amber size-3.5"
                                                    fill="currentColor"
                                                />
                                            ),
                                        )}
                                        <span className="text-sand-50 ml-1.5 text-sm font-extrabold">
                                            4.9
                                        </span>
                                    </div>
                                    <span className="flex items-center -space-x-2">
                                        {avatarStack.map((a) => (
                                            <span
                                                key={a.initials}
                                                aria-hidden
                                                className={`border-harbor-900 flex size-7 items-center justify-center rounded-full border-2 text-[9px] font-extrabold text-white ${a.bg}`}
                                            >
                                                {a.initials}
                                            </span>
                                        ))}
                                    </span>
                                </div>
                                <p className="mt-2.5 text-[14.5px] leading-relaxed font-medium text-white/95">
                                    “I built my profile once and applied to
                                    three projects in a week. Two accepted me.”
                                </p>
                                <p className="mt-3 text-[13px] font-bold text-amber-200">
                                    Amara O.{" "}
                                    <span className="text-sand-100/60 font-medium">
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
                        className="bg-clay/25 pointer-events-none absolute -top-24 -right-24 size-80 rounded-full blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="bg-amber/15 pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-70"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle, rgba(30,47,68,0.08) 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                            maskImage:
                                "linear-gradient(to bottom, black 0%, transparent 60%)",
                            WebkitMaskImage:
                                "linear-gradient(to bottom, black 0%, transparent 60%)",
                        }}
                    />

                    <div className="relative z-10 flex items-center justify-between px-4 pt-5 sm:px-8">
                        <Link
                            href={home()}
                            className="flex items-center gap-2.5 lg:hidden"
                        >
                            <span className="bg-harbor text-sand-50 flex size-9 items-center justify-center rounded-xl shadow-md">
                                <Network className="size-5" strokeWidth={2.2} />
                            </span>
                            <span className="text-harbor text-[15px] font-bold tracking-tight">
                                AlphaForce ProjectLink
                            </span>
                        </Link>
                        <Link
                            href={home()}
                            className="text-harbor hover:text-sienna inline-flex items-center gap-1.5 text-sm font-bold transition-colors lg:ml-auto"
                        >
                            <ArrowLeft className="size-4" />
                            Back to home
                        </Link>
                    </div>

                    <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
                        <div className="w-full max-w-md">
                            {/* Mobile / tablet hero — the showcase is desktop-only */}
                            <div className="border-harbor/10 shadow-harbor/20 relative mb-6 overflow-hidden rounded-[1.75rem] border shadow-2xl lg:hidden">
                                <img
                                    src="/team-page.png"
                                    alt="ProjectLink team collaborating on a project around a laptop"
                                    className="h-52 w-full object-cover object-center sm:h-60"
                                />
                                <div
                                    aria-hidden
                                    className="from-harbor-900/95 via-harbor-900/40 to-harbor-900/90 absolute inset-0 bg-gradient-to-t"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-5">
                                    <p className="text-[11px] font-bold tracking-[0.18em] text-amber-200 uppercase">
                                        {isRegister
                                            ? "Join the platform"
                                            : "Welcome back"}
                                    </p>
                                    <p className="mt-1 text-xl leading-snug font-bold tracking-tight text-white">
                                        Where skills meet{" "}
                                        <span className="text-amber-200">
                                            meaningful
                                        </span>{" "}
                                        projects.
                                    </p>
                                </div>
                            </div>

                            <div className="border-harbor/10 shadow-harbor/15 relative overflow-hidden rounded-[1.75rem] border bg-white p-7 shadow-2xl sm:p-9">
                                <div
                                    aria-hidden
                                    className="from-harbor via-sienna to-amber absolute inset-x-0 top-0 h-1 bg-gradient-to-r"
                                />
                                <h1 className="text-harbor text-[1.65rem] font-bold tracking-tight">
                                    {title}
                                </h1>
                                <p className="text-ember-500 mt-1.5 text-[15px]">
                                    {description}
                                </p>
                                <div className="mt-7">{children}</div>
                            </div>

                            {/* Social proof strip */}
                            <div className="mt-6 flex items-center justify-center gap-3">
                                <span className="flex items-center -space-x-2">
                                    {avatarStack.map((a) => (
                                        <span
                                            key={a.initials}
                                            aria-hidden
                                            className={`border-sand-50 flex size-8 items-center justify-center rounded-full border-2 text-[10px] font-extrabold text-white shadow ${a.bg}`}
                                        >
                                            {a.initials}
                                        </span>
                                    ))}
                                </span>
                                <p className="text-ember-500 text-[13px] font-semibold">
                                    <span className="text-harbor font-extrabold">
                                        2,400+ participants
                                    </span>{" "}
                                    already building impact
                                </p>
                            </div>
                            <p className="text-ember-500 mt-3 flex items-center justify-center gap-1.5 text-[13px] font-semibold">
                                <ShieldCheck className="text-moss-600 size-4" />
                                Verified organisations · Secure by design
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
