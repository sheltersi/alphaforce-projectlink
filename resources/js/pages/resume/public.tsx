import {
    Award,
    BriefcaseBusiness,
    CalendarRange,
    Globe2,
    GraduationCap,
    Mail,
    MapPin,
    Quote,
    Share2,
    Shield,
    Sparkles,
} from "lucide-react";

import { Head } from "@inertiajs/react";

type Skill = { name: string };
type Education = {
    institution: string;
    qualification: string | null;
    field_of_study: string | null;
    start_year: number | null;
    end_year: number | null;
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
    issue_date: string | null;
};

type PublicResume = {
    full_name: string;
    photo_url: string | null;
    summary: string | null;
    city: string | null;
    country: string | null;
    email: string | null;
    skills: Skill[];
    educations: Education[];
    experiences: Experience[];
    certifications: Certification[];
    profile_owner_name: string | null;
};

type Props = {
    resume: PublicResume;
    expires_at: string | null;
    last_viewed_at: string | null;
};

function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-5 text-center text-xs text-muted-foreground">
            {message}
        </div>
    );
}

function SectionHeader({
    children,
    icon: Icon,
}: {
    children: React.ReactNode;
    icon?: typeof Award;
}) {
    return (
        <div className="mb-5 flex items-center gap-3">
            {Icon && (
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <Icon className="size-4" />
                </div>
            )}
            <div className="h-px flex-1 bg-gradient-to-r from-border via-border to-transparent" />
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-muted-foreground uppercase">
                {children}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-border via-border to-transparent" />
        </div>
    );
}

export default function PublicResume({ resume, expires_at }: Props) {
    const fullName = resume.full_name || "Anonymous Participant";
    const tagline =
        resume.summary?.split(/[.!?]/)[0]?.trim().slice(0, 100) ||
        "Building impact through projects";
    const location = [resume.city, resume.country].filter(Boolean).join(", ");

    return (
        <>
            <Head title={`${fullName} — Resume`} />

            <main className="min-h-screen bg-gradient-to-br from-sand-50 via-background to-sand-100 px-4 py-8 sm:px-6 sm:py-12">
                <div className="mx-auto max-w-3xl space-y-4">
                    {/* Privacy banner */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-[11px] shadow-sm animate-fade-in-up">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Shield className="size-3.5 text-moss-500" />
                            <span>
                                Shared via a private link — only people with this URL
                                can see this resume.
                            </span>
                        </div>
                        <span className="hidden items-center gap-1 font-semibold text-amber-600 sm:inline-flex dark:text-amber-400">
                            <Sparkles className="size-3" />
                            ProjectLink
                        </span>
                    </div>

                    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl animate-fade-in-up stagger-1">
                        {/* Header */}
                        <header className="relative bg-gradient-to-r from-harbor-700 via-harbor-600 to-sienna-700 px-6 py-8 text-white sm:px-10 sm:py-10">
                            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
                            <div className="relative flex items-center gap-5">
                                <div className="shrink-0">
                                    {resume.photo_url ? (
                                        <img
                                            src={resume.photo_url}
                                            alt={fullName}
                                            className="size-20 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20 sm:size-24"
                                        />
                                    ) : (
                                        <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-white to-sienna-200 text-2xl font-black text-harbor-900 shadow-2xl ring-4 ring-white/20 sm:size-24 sm:text-3xl">
                                            {initialsOf(fullName)}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-extrabold tracking-[0.22em] text-amber-200/80 uppercase">
                                        Shared Resume
                                    </p>
                                    <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                                        {fullName}
                                    </h1>
                                    <p className="mt-1.5 text-sm font-medium text-harbor-100/90">
                                        {tagline}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                                        {resume.email && (
                                            <a
                                                href={`mailto:${resume.email}`}
                                                className="inline-flex items-center gap-1.5 text-harbor-100/80 transition-colors hover:text-white"
                                            >
                                                <Mail className="size-3.5" />
                                                {resume.email}
                                            </a>
                                        )}
                                        {location && (
                                            <span className="inline-flex items-center gap-1.5 text-harbor-100/70">
                                                <MapPin className="size-3.5" />
                                                {location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Body */}
                        <div className="space-y-10 p-6 sm:p-10">
                            {resume.summary ? (
                                <section>
                                    <SectionHeader icon={Quote}>About</SectionHeader>
                                    <div className="relative rounded-xl border-l-4 border-amber-400 bg-sand-50/50 p-5 dark:bg-sand-950/20">
                                        <Quote className="absolute right-4 top-4 size-6 text-amber-200/50 dark:text-amber-800/30" />
                                        <p className="relative text-sm leading-7 text-foreground/85">
                                            {resume.summary}
                                        </p>
                                    </div>
                                </section>
                            ) : (
                                <section>
                                    <SectionHeader icon={Quote}>About</SectionHeader>
                                    <EmptyState message="No summary provided yet." />
                                </section>
                            )}

                            <section>
                                <SectionHeader icon={BriefcaseBusiness}>Experience</SectionHeader>
                                {resume.experiences.length === 0 ? (
                                    <EmptyState message="No work experience added yet." />
                                ) : (
                                    <div className="relative space-y-6">
                                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-300 via-amber-200 to-transparent dark:from-amber-800 dark:via-amber-900" />
                                        {resume.experiences.map((exp, idx) => (
                                            <div
                                                key={`${exp.company}-${idx}`}
                                                className="relative pl-8"
                                            >
                                                <div className="absolute left-0 top-1.5 flex size-6 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
                                                    <BriefcaseBusiness className="size-2.5 text-white" />
                                                </div>
                                                <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-base font-bold text-foreground">
                                                                {exp.role ?? "Role"}
                                                            </h3>
                                                            <p className="mt-0.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                                {exp.company}
                                                            </p>
                                                        </div>
                                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-harbor-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-harbor-700 uppercase dark:bg-harbor-900/30 dark:text-harbor-300">
                                                            <CalendarRange className="size-3" />
                                                            {exp.start_date ?? "—"} —{" "}
                                                            {exp.currently_working
                                                                ? "Present"
                                                                : exp.end_date ?? "—"}
                                                        </span>
                                                    </div>
                                                    {exp.location && (
                                                        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                            <MapPin className="size-3" />
                                                            {exp.location}
                                                        </p>
                                                    )}
                                                    {exp.description && (
                                                        <p className="mt-3 text-sm leading-6 text-foreground/75">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section>
                                <SectionHeader icon={Award}>Skills</SectionHeader>
                                {resume.skills.length === 0 ? (
                                    <EmptyState message="No skills added yet." />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills.map((skill) => (
                                            <span
                                                key={skill.name}
                                                className="inline-flex items-center rounded-lg bg-harbor-50 px-3 py-1.5 text-xs font-semibold text-harbor-700 ring-1 ring-harbor-100 dark:bg-harbor-950/40 dark:text-harbor-200 dark:ring-harbor-800/40"
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section>
                                <SectionHeader icon={GraduationCap}>Education</SectionHeader>
                                {resume.educations.length === 0 ? (
                                    <EmptyState message="No education entries yet." />
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {resume.educations.map((edu, idx) => (
                                            <div
                                                key={`${edu.institution}-${idx}`}
                                                className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
                                            >
                                                <h3 className="text-base font-bold text-foreground">
                                                    {edu.qualification ?? "Qualification"}
                                                </h3>
                                                <p className="mt-0.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                    {edu.institution}
                                                </p>
                                                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <CalendarRange className="size-3" />
                                                    {edu.start_year ?? "—"} —{" "}
                                                    {edu.end_year ?? "—"}
                                                </p>
                                                {edu.field_of_study && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {edu.field_of_study}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {resume.certifications.length > 0 && (
                                <section>
                                    <SectionHeader icon={Award}>Certifications</SectionHeader>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {resume.certifications.map((cert, idx) => (
                                            <div
                                                key={`${cert.name}-${idx}`}
                                                className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
                                            >
                                                <p className="text-sm font-bold text-foreground">
                                                    {cert.name}
                                                </p>
                                                <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                                                    {cert.issuer ?? "—"}
                                                </p>
                                                {cert.issue_date && (
                                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                                        Issued {cert.issue_date}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <footer className="border-t border-border/60 bg-sand-50/40 px-6 py-4 sm:px-10">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                <span>
                                    Shared by {resume.profile_owner_name ?? "a ProjectLink participant"}
                                </span>
                                {expires_at && (
                                    <span>
                                        Link expires{" "}
                                        {new Date(expires_at).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                )}
                            </div>
                        </footer>
                    </article>
                </div>
            </main>
        </>
    );
}
