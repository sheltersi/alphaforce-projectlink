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
    children: ReactNode;
    icon?: typeof Award;
}) {
    return (
        <div className="mb-5 flex items-center gap-3">
            {Icon && (
                <div className="flex size-8 items-center justify-center rounded-lg bg-sienna-100 text-sienna-700 dark:bg-sienna-900/40 dark:text-sienna-300">
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

function SkillPill({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-harbor-800 shadow-sm ring-1 ring-harbor-100 dark:bg-harbor-950/40 dark:text-harbor-200 dark:ring-harbor-800/40">
            {children}
        </span>
    );
}

export default function ResumeIndex() {
    const { resume } = usePage<{ resume: Resume }>().props;
    const fullName = resume.full_name || "Your Name";
    const tagline =
        resume.summary?.split(/[.!?]/)[0]?.trim().slice(0, 100) ||
        "Open to opportunities";
    const location = [resume.city, resume.country].filter(Boolean).join(", ");

    return (
        <>
            <Head title={`Digital Resume · ${fullName}`} />

            {/* Toolbar */}
            <div className="print:hidden sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-lg">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <Link
                        href={dashboard()}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="hidden items-center gap-1.5 rounded-full bg-sienna-50 px-3 py-1.5 text-[10px] font-bold tracking-wide text-sienna-700 uppercase sm:inline-flex dark:bg-sienna-900/30 dark:text-sienna-300">
                            <Sparkles className="size-3" />
                            Digital Resume
                        </span>
                        <a
                            href="/dashboard/resume/download"
                            className="inline-flex items-center gap-2 rounded-lg bg-sienna-700 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-px hover:bg-sienna-800 hover:shadow-lg"
                        >
                            <Download className="size-4" />
                            Download PDF
                        </a>
                    </div>
                </div>
            </div>

            <main className="min-h-screen bg-gradient-to-br from-sand-50 via-background to-sand-100 px-4 py-8 sm:px-6 sm:py-12 print:bg-white print:p-0">
                <article className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border/50 print:shadow-none print:ring-0 print:rounded-none">
                    {/* Header band */}
                    <div className="relative bg-gradient-to-r from-harbor-800 via-harbor-700 to-sienna-800 px-8 py-8 text-white sm:px-12 sm:py-10 print:from-harbor-800 print:via-harbor-700 print:to-sienna-800">
                        <div className="absolute inset-0 opacity-[0.04] print:hidden" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
                        <div className="relative flex items-center gap-6">
                            <div className="relative shrink-0">
                                {resume.photo_url ? (
                                    <img
                                        src={resume.photo_url}
                                        alt={fullName}
                                        className="size-24 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20 sm:size-28"
                                    />
                                ) : (
                                    <div className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-white to-sienna-200 text-2xl font-black text-harbor-900 shadow-2xl ring-4 ring-white/20 sm:size-28 sm:text-3xl">
                                        {initialsOf(fullName)}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-amber-400 shadow-lg">
                                    <Sparkles className="size-3 text-amber-900" />
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-extrabold tracking-[0.25em] text-amber-200/80 uppercase">
                                    Digital Resume
                                </p>
                                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                                    {fullName}
                                </h1>
                                <p className="mt-1.5 max-w-lg text-sm font-medium text-harbor-100/90">
                                    {tagline}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                                    {resume.email && (
                                        <a href={`mailto:${resume.email}`} className="inline-flex items-center gap-1.5 text-harbor-100/80 transition-colors hover:text-white">
                                            <Mail className="size-3.5" />
                                            {resume.email}
                                        </a>
                                    )}
                                    {resume.phone && (
                                        <a href={`tel:${resume.phone}`} className="inline-flex items-center gap-1.5 text-harbor-100/80 transition-colors hover:text-white">
                                            <Phone className="size-3.5" />
                                            {resume.phone}
                                        </a>
                                    )}
                                    {location && (
                                        <span className="inline-flex items-center gap-1.5 text-harbor-100/70">
                                            <MapPin className="size-3.5" />
                                            {location}
                                        </span>
                                    )}
                                    {resume.nationality && (
                                        <span className="inline-flex items-center gap-1.5 text-harbor-100/70">
                                            <Globe2 className="size-3.5" />
                                            {resume.nationality}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="hidden shrink-0 sm:block">
                                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm ring-1 ring-white/15">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-[9px] font-bold tracking-widest text-harbor-100/70 uppercase">Strength</span>
                                        <span className="text-sm font-black text-amber-300">{resume.profile_strength}%</span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/15">
                                        <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500" style={{ width: `${resume.profile_strength}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[280px_1fr]">
                        {/* Left sidebar */}
                        <aside className="border-b border-border bg-gradient-to-b from-sand-50/80 to-sand-100/50 p-6 sm:p-8 lg:border-b-0 lg:border-r dark:from-sand-950/20 dark:to-background print:bg-sand-50">
                            {/* Skills */}
                            <div className="mb-8">
                                <SectionHeader icon={Award}>Skills</SectionHeader>
                                {resume.skills.length === 0 ? (
                                    <EmptyState message="No skills added yet." />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills.map((skill) => (
                                            <SkillPill key={skill.name}>{skill.name}</SkillPill>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Certifications */}
                            <div className="mb-8">
                                <SectionHeader icon={Award}>Certifications</SectionHeader>
                                {resume.certifications.length === 0 ? (
                                    <EmptyState message="No certifications yet." />
                                ) : (
                                    <div className="space-y-3">
                                        {resume.certifications.map((cert, idx) => (
                                            <div key={`${cert.name}-${idx}`} className="rounded-xl border border-border/60 bg-white/60 p-3.5 shadow-sm dark:bg-card/60">
                                                <p className="text-sm font-bold text-foreground">{cert.name}</p>
                                                <p className="mt-0.5 text-xs text-sienna-600 dark:text-sienna-400">{cert.issuer ?? "—"}</p>
                                                <p className="mt-1 text-[10px] text-muted-foreground">
                                                    {cert.issue_date && <>Issued {cert.issue_date}</>}
                                                    {cert.expiry_date && <> · Expires {cert.expiry_date}</>}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Education (compact sidebar version) */}
                            <div className="mb-8">
                                <SectionHeader icon={GraduationCap}>Education</SectionHeader>
                                {resume.educations.length === 0 ? (
                                    <EmptyState message="No education entries yet." />
                                ) : (
                                    <div className="space-y-3">
                                        {resume.educations.map((edu, idx) => (
                                            <div key={`${edu.institution}-${idx}`} className="rounded-xl border border-border/60 bg-white/60 p-3.5 shadow-sm dark:bg-card/60">
                                                <p className="text-sm font-bold text-foreground">{edu.qualification ?? "—"}</p>
                                                <p className="mt-0.5 text-xs text-sienna-600 dark:text-sienna-400">{edu.institution}</p>
                                                <p className="mt-1 text-[10px] text-muted-foreground">
                                                    {edu.start_year ?? "—"} — {edu.end_year ?? "—"}
                                                    {edu.field_of_study && <> · {edu.field_of_study}</>}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* At a glance */}
                            <div className="rounded-xl bg-gradient-to-br from-harbor-50 to-sand-50 p-4 ring-1 ring-harbor-100/60 dark:from-harbor-950/20 dark:to-background dark:ring-harbor-800/30">
                                <div className="mb-3 flex items-center gap-2 text-harbor-700 dark:text-harbor-300">
                                    <UserRound className="size-4" />
                                    <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase">Profile</p>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { label: "Experiences", value: resume.experiences.length },
                                        { label: "Education", value: resume.educations.length },
                                        { label: "Skills", value: resume.skills.length },
                                        { label: "Certifications", value: resume.certifications.length },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{item.label}</span>
                                            <span className="font-bold text-foreground">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Main content */}
                        <div className="p-6 sm:p-8 lg:p-10">
                            {/* Summary */}
                            {resume.summary ? (
                                <section className="mb-10">
                                    <SectionHeader icon={Quote}>About</SectionHeader>
                                    <div className="relative rounded-xl border-l-4 border-sienna-400 bg-sand-50/50 p-5 dark:bg-sand-950/20">
                                        <Quote className="absolute right-4 top-4 size-6 text-sienna-200/50 dark:text-sienna-800/30" />
                                        <p className="relative text-sm leading-7 text-foreground/85">
                                            {resume.summary}
                                        </p>
                                    </div>
                                </section>
                            ) : (
                                <section className="mb-10">
                                    <SectionHeader icon={Quote}>About</SectionHeader>
                                    <EmptyState message="Add a professional summary in your profile to tell your story." />
                                </section>
                            )}

                            {/* Experience */}
                            <section className="mb-10">
                                <SectionHeader icon={BriefcaseBusiness}>Experience</SectionHeader>
                                {resume.experiences.length === 0 ? (
                                    <EmptyState message="No work experience added yet." />
                                ) : (
                                    <div className="relative space-y-6">
                                        {/* Timeline line */}
                                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-sienna-300 via-sienna-200 to-transparent dark:from-sienna-800 dark:via-sienna-900" />
                                        {resume.experiences.map((exp, idx) => (
                                            <div key={`${exp.company}-${idx}`} className="relative pl-8">
                                                {/* Timeline dot */}
                                                <div className="absolute left-0 top-1.5 flex size-6 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-sienna-400 to-sienna-600 shadow-sm">
                                                    <BriefcaseBusiness className="size-2.5 text-white" />
                                                </div>
                                                <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-base font-bold text-foreground">{exp.role ?? "Role"}</h3>
                                                            <p className="mt-0.5 text-sm font-semibold text-sienna-600 dark:text-sienna-400">{exp.company}</p>
                                                        </div>
                                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-harbor-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-harbor-700 uppercase dark:bg-harbor-900/30 dark:text-harbor-300">
                                                            <CalendarRange className="size-3" />
                                                            {exp.start_date ?? "—"} — {exp.currently_working ? "Present" : exp.end_date ?? "—"}
                                                        </span>
                                                    </div>
                                                    {exp.location && (
                                                        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                            <MapPin className="size-3" />
                                                            {exp.location}
                                                        </p>
                                                    )}
                                                    {exp.description && (
                                                        <p className="mt-3 text-sm leading-6 text-foreground/75">{exp.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Education (detailed main version) */}
                            <section>
                                <SectionHeader icon={GraduationCap}>Education</SectionHeader>
                                {resume.educations.length === 0 ? (
                                    <EmptyState message="No education entries yet." />
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {resume.educations.map((edu, idx) => (
                                            <div key={`main-${edu.institution}-${idx}`} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                                                <h3 className="text-base font-bold text-foreground">{edu.qualification ?? "Qualification"}</h3>
                                                <p className="mt-0.5 text-sm font-semibold text-sienna-600 dark:text-sienna-400">{edu.institution}</p>
                                                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <CalendarRange className="size-3" />
                                                    {edu.start_year ?? "—"} — {edu.end_year ?? "—"}
                                                </p>
                                                {edu.field_of_study && (
                                                    <p className="mt-1 text-xs text-muted-foreground">{edu.field_of_study}</p>
                                                )}
                                                {edu.description && (
                                                    <p className="mt-3 text-sm leading-6 text-foreground/75">{edu.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="print:hidden border-t border-border bg-muted/30 px-6 py-4 sm:px-10">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                            <p>Generated from your ProjectLink profile.</p>
                            <Link
                                href="/onboarding/build-profile"
                                className="inline-flex items-center gap-1.5 font-semibold text-sienna-600 transition-colors hover:text-sienna-700 dark:text-sienna-400"
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
                    @page { margin: 0; }
                    body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    main { padding: 0 !important; background: white !important; }
                    article { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
                    /* Ensure sidebar prints nicely */
                    aside { background: #faf8f5 !important; border-right: 1px solid #e5e0d8 !important; }
                }
            `}</style>
        </>
    );
}
