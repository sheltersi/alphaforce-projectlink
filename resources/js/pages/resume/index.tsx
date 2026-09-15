import {
    ArrowLeft,
    Award,
    BriefcaseBusiness,
    CalendarRange,
    Download,
    Globe2,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Printer,
    Quote,
    Sparkles,
    UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { dashboard } from "@/routes";
import { Head, Link, usePage } from "@inertiajs/react";

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

function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SectionTitle({
    eyebrow,
    title,
    icon: Icon,
}: {
    eyebrow: string;
    title: string;
    icon: typeof Award;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sienna-500 to-sienna-700 text-white shadow-lg shadow-sienna/20">
                <Icon className="size-4" />
            </span>
            <div>
                <p className="text-[10px] font-extrabold tracking-[0.18em] text-sienna-600 uppercase dark:text-sienna-300">
                    {eyebrow}
                </p>
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                    {title}
                </h2>
            </div>
        </div>
    );
}

function Pill({ children }: { children: ReactNode }) {
    return (
        <span className="rounded-full border border-sienna-200/60 bg-sienna-50 px-3 py-1.5 text-xs font-bold text-sienna-700 shadow-sm dark:border-sienna-700/40 dark:bg-sienna-900/30 dark:text-sienna-200">
            {children}
        </span>
    );
}

function ContactItem({
    icon: Icon,
    label,
    value,
    href,
}: {
    icon: typeof Mail;
    label: string;
    value: string | null | undefined;
    href?: string;
}) {
    if (!value) return null;
    const content = (
        <span className="inline-flex items-center gap-2 text-sm">
            <Icon className="size-4 shrink-0 text-sienna-500 dark:text-sienna-300" />
            <span>
                <span className="block text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    {label}
                </span>
                <span className="block font-semibold text-foreground/90">
                    {value}
                </span>
            </span>
        </span>
    );
    if (href) {
        return (
            <a className="transition-colors hover:text-sienna-600" href={href}>
                {content}
            </a>
        );
    }
    return content;
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}

export default function ResumeIndex() {
    const { resume } = usePage<{ resume: Resume }>().props;
    const fullName = resume.full_name || "Your Name";
    const tagline =
        resume.summary?.split(/[.!?]/)[0]?.trim().slice(0, 80) ||
        "Open to opportunities";

    const handlePrint = () => {
        if (typeof window !== "undefined") window.print();
    };

    return (
        <>
            <Head title={`Digital Resume · ${fullName}`} />

            {/* Toolbar (hidden on print) */}
            <div className="print:hidden sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <Link
                        href={dashboard()}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="hidden items-center gap-1.5 rounded-full bg-moss-100 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-moss-700 uppercase sm:inline-flex dark:bg-moss-900/40 dark:text-moss-300">
                            <Sparkles className="size-3" />
                            Digital Resume
                        </span>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-xl bg-sienna-600 px-4 py-2 text-sm font-extrabold text-white shadow-lg shadow-sienna/20 transition-all hover:-translate-y-0.5 hover:bg-sienna-700 hover:shadow-xl"
                        >
                            <Printer className="size-4" />
                            Print / Save as PDF
                        </button>
                    </div>
                </div>
            </div>

            <main className="bg-gradient-to-b from-sand-50 via-background to-background px-4 py-6 sm:px-6 sm:py-10 print:bg-white print:py-0">
                <article className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-sienna/10 print:shadow-none print:border-0 print:rounded-none">
                    {/* Hero */}
                    <header className="relative overflow-hidden bg-gradient-to-br from-harbor-700 via-harbor-800 to-sienna-900 px-6 py-10 text-white sm:px-10 sm:py-14 print:bg-harbor-700 print:py-8">
                        <div className="absolute -top-24 -right-16 size-72 rounded-full bg-amber/20 blur-3xl print:hidden" />
                        <div className="absolute -bottom-24 -left-16 size-64 rounded-full bg-sienna/30 blur-3xl print:hidden" />
                        <div
                            aria-hidden
                            className="absolute inset-0 opacity-[0.06] print:hidden"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                                backgroundSize: "24px 24px",
                            }}
                        />

                        <div className="relative grid items-center gap-8 sm:grid-cols-[auto_1fr_auto]">
                            <div className="relative">
                                <div className="absolute inset-0 -m-2 rounded-3xl bg-gradient-to-br from-amber-300 via-white to-sienna-200 opacity-60 blur-md print:hidden" />
                                {resume.photo_url ? (
                                    <img
                                        src={resume.photo_url}
                                        alt={fullName}
                                        className="relative size-28 rounded-3xl object-cover shadow-2xl ring-4 ring-white/10 sm:size-36"
                                    />
                                ) : (
                                    <div className="relative flex size-28 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-300 via-white to-sienna-200 text-3xl font-black tracking-tight text-sienna-900 shadow-2xl ring-4 ring-white/10 sm:size-36 sm:text-4xl">
                                        {initialsOf(fullName)}
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="text-[11px] font-extrabold tracking-[0.22em] text-amber-200 uppercase">
                                    Digital Resume
                                </p>
                                <h1 className="mt-2 text-3xl font-black tracking-tight text-balance sm:text-5xl">
                                    {fullName}
                                </h1>
                                <p className="mt-2 max-w-xl text-sm font-medium text-amber-50/90 sm:text-base">
                                    {tagline}
                                </p>
                            </div>

                            <div className="hidden w-44 sm:block">
                                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/15">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-extrabold tracking-widest text-amber-100 uppercase">
                                            Profile strength
                                        </span>
                                        <span className="text-sm font-black text-amber-200">
                                            {resume.profile_strength}%
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
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

                        {/* Contact strip */}
                        <div className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-sm sm:grid-cols-4">
                            <ContactItem
                                icon={Mail}
                                label="Email"
                                value={resume.email}
                                href={
                                    resume.email ? `mailto:${resume.email}` : undefined
                                }
                            />
                            <ContactItem
                                icon={Phone}
                                label="Phone"
                                value={resume.phone}
                                href={resume.phone ? `tel:${resume.phone}` : undefined}
                            />
                            <ContactItem
                                icon={MapPin}
                                label="Location"
                                value={
                                    [resume.city, resume.country]
                                        .filter(Boolean)
                                        .join(", ") || null
                                }
                            />
                            <ContactItem
                                icon={Globe2}
                                label="Nationality"
                                value={resume.nationality}
                            />
                        </div>
                    </header>

                    {/* Body */}
                    <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_320px]">
                        <div className="space-y-8">
                            {resume.summary ? (
                                <section>
                                    <SectionTitle
                                        eyebrow="About"
                                        title="Professional summary"
                                        icon={Quote}
                                    />
                                    <div className="relative mt-4 rounded-2xl border border-sienna-100/60 bg-gradient-to-br from-sand-50 to-card p-6 dark:border-sienna-900/30 dark:from-sienna-950/20">
                                        <Quote className="absolute top-4 right-4 size-8 text-sienna-200/60 dark:text-sienna-800/40" />
                                        <p className="text-sm leading-7 text-foreground/85 sm:text-base">
                                            {resume.summary}
                                        </p>
                                    </div>
                                </section>
                            ) : (
                                <section>
                                    <SectionTitle
                                        eyebrow="About"
                                        title="Professional summary"
                                        icon={Quote}
                                    />
                                    <div className="mt-4">
                                        <EmptyState message="Add a short summary in your profile to introduce yourself to project managers." />
                                    </div>
                                </section>
                            )}

                            <section>
                                <SectionTitle
                                    eyebrow="Journey"
                                    title="Work experience"
                                    icon={BriefcaseBusiness}
                                />
                                {resume.experiences.length === 0 ? (
                                    <div className="mt-4">
                                        <EmptyState message="No work experience added yet." />
                                    </div>
                                ) : (
                                    <ol className="relative mt-6 space-y-6 border-l-2 border-dashed border-sienna-200/70 pl-6 dark:border-sienna-800/40">
                                        {resume.experiences.map((exp, idx) => (
                                            <li
                                                key={`${exp.company}-${idx}`}
                                                className="relative"
                                            >
                                                <span className="absolute -left-[33px] flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-sienna-500 to-sienna-700 ring-4 ring-card">
                                                    <BriefcaseBusiness className="size-2.5 text-white" />
                                                </span>
                                                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="text-base font-extrabold text-foreground">
                                                                {exp.role ?? "Role"}
                                                            </h3>
                                                            <p className="text-sm font-bold text-sienna-700 dark:text-sienna-300">
                                                                {exp.company}
                                                            </p>
                                                        </div>
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-harbor-50 px-3 py-1 text-[11px] font-extrabold tracking-wide text-harbor-700 uppercase dark:bg-harbor-900/30 dark:text-harbor-200">
                                                            <CalendarRange className="size-3" />
                                                            {exp.start_date ?? "—"}{" "}
                                                            →{" "}
                                                            {exp.currently_working
                                                                ? "Present"
                                                                : exp.end_date ?? "—"}
                                                        </span>
                                                    </div>
                                                    {exp.location ? (
                                                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                            <MapPin className="size-3" />
                                                            {exp.location}
                                                        </p>
                                                    ) : null}
                                                    {exp.description ? (
                                                        <p className="mt-3 text-sm leading-6 text-foreground/80">
                                                            {exp.description}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </section>

                            <section>
                                <SectionTitle
                                    eyebrow="Learning"
                                    title="Education"
                                    icon={GraduationCap}
                                />
                                {resume.educations.length === 0 ? (
                                    <div className="mt-4">
                                        <EmptyState message="No education entries yet." />
                                    </div>
                                ) : (
                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        {resume.educations.map((edu, idx) => (
                                            <div
                                                key={`${edu.institution}-${idx}`}
                                                className="rounded-2xl border border-border bg-card p-5"
                                            >
                                                <h3 className="text-base font-extrabold text-foreground">
                                                    {edu.qualification ??
                                                        "Qualification"}
                                                </h3>
                                                <p className="text-sm font-bold text-sienna-700 dark:text-sienna-300">
                                                    {edu.institution}
                                                </p>
                                                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                    <CalendarRange className="size-3" />
                                                    {edu.start_year ?? "—"} →{" "}
                                                    {edu.end_year ?? "—"}
                                                </p>
                                                {edu.field_of_study ? (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {edu.field_of_study}
                                                    </p>
                                                ) : null}
                                                {edu.description ? (
                                                    <p className="mt-3 text-sm leading-6 text-foreground/80">
                                                        {edu.description}
                                                    </p>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start print:static">
                            <section>
                                <SectionTitle
                                    eyebrow="Strengths"
                                    title="Skills"
                                    icon={Award}
                                />
                                {resume.skills.length === 0 ? (
                                    <div className="mt-4">
                                        <EmptyState message="No skills added yet." />
                                    </div>
                                ) : (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {resume.skills.map((skill) => (
                                            <Pill key={skill.name}>
                                                {skill.name}
                                            </Pill>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section>
                                <SectionTitle
                                    eyebrow="Credentials"
                                    title="Certifications"
                                    icon={Award}
                                />
                                {resume.certifications.length === 0 ? (
                                    <div className="mt-4">
                                        <EmptyState message="No certifications added yet." />
                                    </div>
                                ) : (
                                    <ul className="mt-4 space-y-3">
                                        {resume.certifications.map((cert, idx) => (
                                            <li
                                                key={`${cert.name}-${idx}`}
                                                className="rounded-2xl border border-border bg-card p-4"
                                            >
                                                <p className="text-sm font-extrabold text-foreground">
                                                    {cert.name}
                                                </p>
                                                <p className="mt-0.5 text-xs font-bold text-sienna-700 dark:text-sienna-300">
                                                    {cert.issuer ?? "Issuer"}
                                                </p>
                                                <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                                                    {cert.issue_date ? (
                                                        <>Issued {cert.issue_date}</>
                                                    ) : null}
                                                    {cert.expiry_date ? (
                                                        <>
                                                            {" · "}
                                                            Expires {cert.expiry_date}
                                                        </>
                                                    ) : null}
                                                </p>
                                                {cert.credential_number ? (
                                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                                        #{cert.credential_number}
                                                    </p>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            <section className="rounded-2xl border border-sienna-100/60 bg-gradient-to-br from-sand-50 to-sienna-50 p-5 dark:border-sienna-900/30 dark:from-sienna-950/20 dark:to-card">
                                <div className="flex items-center gap-2 text-sienna-700 dark:text-sienna-300">
                                    <UserRound className="size-4" />
                                    <p className="text-[10px] font-extrabold tracking-widest uppercase">
                                        At a glance
                                    </p>
                                </div>
                                <dl className="mt-3 space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">
                                            Experiences
                                        </dt>
                                        <dd className="font-extrabold text-foreground">
                                            {resume.experiences.length}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">
                                            Education entries
                                        </dt>
                                        <dd className="font-extrabold text-foreground">
                                            {resume.educations.length}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">
                                            Skills
                                        </dt>
                                        <dd className="font-extrabold text-foreground">
                                            {resume.skills.length}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">
                                            Certifications
                                        </dt>
                                        <dd className="font-extrabold text-foreground">
                                            {resume.certifications.length}
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                        </aside>
                    </div>

                    {/* Footer note (hidden on print) */}
                    <footer className="print:hidden border-t border-border bg-card/40 px-6 py-5 sm:px-10">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                            <p>
                                Generated from your ProjectLink profile.
                            </p>
                            <Link
                                href="/onboarding/build-profile"
                                className="inline-flex items-center gap-1.5 font-bold text-sienna-700 transition-colors hover:text-sienna-800 dark:text-sienna-300"
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
                    @page { margin: 0.5cm; }
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    main { padding: 0 !important; background: white !important; }
                    article { box-shadow: none !important; border-radius: 0 !important; }
                }
            `}</style>
        </>
    );
}
