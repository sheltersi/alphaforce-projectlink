import {
    ArrowLeft,
    Award,
    BadgeCheck,
    BriefcaseBusiness,
    CalendarDays,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    User as UserIcon,
} from "lucide-react";

import { Head, Link, usePage } from "@inertiajs/react";

type ApplicationPayload = {
    application: {
        id: number;
        status: string;
        cover_letter: string | null;
        submitted_at: string | null;
    };
    project: {
        id: number;
        slug: string | null;
        title: string;
        organisation: string | null;
    };
    applicant: {
        id: number | null;
        name: string | null;
        email: string | null;
        profile: null | {
            first_name: string | null;
            last_name: string | null;
            phone: string | null;
            city: string | null;
            country: string | null;
            nationality: string | null;
            summary: string | null;
            photo_url: string | null;
            skills: { name: string }[];
            educations: {
                institution: string;
                qualification: string | null;
                field_of_study: string | null;
                start_year: number | null;
                end_year: number | null;
            }[];
            experiences: {
                company: string;
                role: string | null;
                location: string | null;
                description: string | null;
                start_date: string | null;
                end_date: string | null;
                currently_working: boolean;
            }[];
            certifications: {
                name: string;
                issuer: string | null;
                credential_number: string | null;
                issue_date: string | null;
                expiry_date: string | null;
            }[];
        };
    };
};

function applicationStatusLabel(status: string): string {
    switch (status) {
        case "submitted":
            return "Submitted";
        case "under_review":
            return "Under review";
        case "shortlisted":
            return "Shortlisted";
        case "accepted":
            return "Accepted";
        case "rejected":
            return "Not selected";
        case "withdrawn":
            return "Withdrawn";
        default:
            return status.replace(/_/g, " ");
    }
}

function applicationStatusClasses(status: string): string {
    switch (status) {
        case "submitted":
            return "border-harbor-600 bg-harbor-100 text-harbor-700";
        case "under_review":
            return "border-amber-500 bg-amber-100 text-amber-700";
        case "shortlisted":
        case "accepted":
            return "border-moss-600 bg-moss-100 text-moss-700";
        case "rejected":
            return "border-sienna-600 bg-sienna-100 text-sienna-700";
        case "withdrawn":
            return "border-border bg-muted text-muted-foreground";
        default:
            return "border-border bg-secondary text-secondary-foreground";
    }
}

function applicantInitials(name: string | null): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return (
        (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")
    ).toUpperCase();
}

export default function ApplicationShow() {
    const { application } = usePage<{ application: ApplicationPayload }>().props;

    const applicant = application.applicant;
    const profile = applicant?.profile;
    const fullName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
        : (applicant?.name ?? "Unknown applicant");

    return (
        <>
            <Head title={`Application · ${applicant?.name ?? "Applicant"}`} />

            <main className="min-h-full bg-background px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
                        <Link
                            href={`/projects/${application.project.slug ?? application.project.id}`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to {application.project.title}
                        </Link>
                        <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] ${applicationStatusClasses(application.application.status)}`}
                        >
                            {applicationStatusLabel(application.application.status)}
                        </span>
                    </div>

                    <header className="glass-card rounded-2xl p-6 animate-fade-in-up">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            {profile?.photo_url ? (
                                <img
                                    src={profile.photo_url}
                                    alt={fullName}
                                    className="size-20 rounded-2xl object-cover shadow-md"
                                />
                            ) : (
                                <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sienna-500 to-sienna-700 text-2xl font-extrabold text-white shadow-md">
                                    {applicantInitials(fullName)}
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-[0.08em] text-sienna dark:text-sienna-300">
                                    Applicant
                                </p>
                                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
                                    {fullName}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Applying for{" "}
                                    <span className="font-bold text-foreground/80">
                                        {application.project.title}
                                    </span>
                                    {application.project.organisation ? (
                                        <>
                                            {" "}
                                            ·{" "}
                                            <span className="font-bold text-foreground/80">
                                                {application.project.organisation}
                                            </span>
                                        </>
                                    ) : null}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    {applicant?.email ? (
                                        <a
                                            href={`mailto:${applicant.email}`}
                                            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                                        >
                                            <Mail className="size-4" />
                                            {applicant.email}
                                        </a>
                                    ) : null}
                                    {profile?.phone ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone className="size-4" />
                                            {profile.phone}
                                        </span>
                                    ) : null}
                                    {profile?.city || profile?.country ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="size-4" />
                                            {[profile?.city, profile?.country]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </span>
                                    ) : null}
                                    {application.application.submitted_at ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="size-4" />
                                            Applied{" "}
                                            {
                                                application.application
                                                    .submitted_at
                                            }
                                        </span>
                                    ) : null}
                                </div>
                                {profile?.nationality ? (
                                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <UserIcon className="size-3.5" />
                                        {profile.nationality}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </header>

                    {profile?.summary ? (
                        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="size-5 text-sienna" />
                                <h2 className="text-lg font-extrabold text-foreground">
                                    About
                                </h2>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-foreground/80">
                                {profile.summary}
                            </p>
                        </section>
                    ) : null}

                    {profile?.skills?.length ? (
                        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
                            <div className="flex items-center gap-2">
                                <Award className="size-5 text-sienna" />
                                <h2 className="text-lg font-extrabold text-foreground">
                                    Skills
                                </h2>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {profile.skills.map((skill) => (
                                    <span
                                        key={skill.name}
                                        className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground"
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {profile?.experiences?.length ? (
                        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
                            <div className="flex items-center gap-2">
                                <BriefcaseBusiness className="size-5 text-sienna" />
                                <h2 className="text-lg font-extrabold text-foreground">
                                    Experience
                                </h2>
                            </div>
                            <ul className="mt-4 space-y-4">
                                {profile.experiences.map((exp, idx) => (
                                    <li
                                        key={`${exp.company}-${idx}`}
                                        className="rounded-xl border border-border bg-card/50 p-4"
                                    >
                                        <p className="text-sm font-extrabold text-foreground">
                                            {exp.role ?? "Role"} ·{" "}
                                            <span className="text-muted-foreground">
                                                {exp.company}
                                            </span>
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {exp.start_date ?? "—"} →{" "}
                                            {exp.currently_working
                                                ? "Present"
                                                : exp.end_date ?? "—"}
                                            {exp.location
                                                ? ` · ${exp.location}`
                                                : ""}
                                        </p>
                                        {exp.description ? (
                                            <p className="mt-2 text-sm leading-6 text-foreground/80">
                                                {exp.description}
                                            </p>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {profile?.educations?.length ? (
                        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="size-5 text-sienna" />
                                <h2 className="text-lg font-extrabold text-foreground">
                                    Education
                                </h2>
                            </div>
                            <ul className="mt-4 space-y-4">
                                {profile.educations.map((edu, idx) => (
                                    <li
                                        key={`${edu.institution}-${idx}`}
                                        className="rounded-xl border border-border bg-card/50 p-4"
                                    >
                                        <p className="text-sm font-extrabold text-foreground">
                                            {edu.qualification ?? "Qualification"}{" "}
                                            ·{" "}
                                            <span className="text-muted-foreground">
                                                {edu.institution}
                                            </span>
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {edu.start_year ?? "—"} →{" "}
                                            {edu.end_year ?? "—"}
                                            {edu.field_of_study
                                                ? ` · ${edu.field_of_study}`
                                                : ""}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {profile?.certifications?.length ? (
                        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
                            <div className="flex items-center gap-2">
                                <Award className="size-5 text-sienna" />
                                <h2 className="text-lg font-extrabold text-foreground">
                                    Certifications
                                </h2>
                            </div>
                            <ul className="mt-4 space-y-3">
                                {profile.certifications.map((cert, idx) => (
                                    <li
                                        key={`${cert.name}-${idx}`}
                                        className="rounded-xl border border-border bg-card/50 p-4"
                                    >
                                        <p className="text-sm font-extrabold text-foreground">
                                            {cert.name}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {cert.issuer ?? "Issuer unknown"}{" "}
                                            {cert.issue_date
                                                ? ` · Issued ${cert.issue_date}`
                                                : ""}
                                            {cert.expiry_date
                                                ? ` · Expires ${cert.expiry_date}`
                                                : ""}
                                        </p>
                                        {cert.credential_number ? (
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                Credential #{cert.credential_number}
                                            </p>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {application.application.cover_letter ? (
                        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
                            <div className="flex items-center gap-2">
                                <FileText className="size-5 text-sienna" />
                                <h2 className="text-lg font-extrabold text-foreground">
                                    Cover letter
                                </h2>
                            </div>
                            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/80">
                                {application.application.cover_letter}
                            </p>
                        </section>
                    ) : null}
                </div>
            </main>
        </>
    );
}
