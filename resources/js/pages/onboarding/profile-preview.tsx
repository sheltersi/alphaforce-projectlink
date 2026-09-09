import {
    ArrowLeft,
    ArrowRight,
    Award,
    BadgeCheck,
    Briefcase,
    Check,
    CircleAlert,
    Download,
    Eye,
    FileText,
    GraduationCap,
    Mail,
    MailCheck,
    MapPin,
    Network,
    LogOut,
    Pencil,
    Phone,
    Save,
    Sparkles,
    UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Head, Link, router, usePage } from "@inertiajs/react";

import {
    STEPS,
    completionPercent,
    emptyProfile,
    fileTypeLabel,
    formatFileSize,
    sectionStatuses,
    type ParticipantProfile,
} from "./lib/profile";

const JOURNEY = [
    { label: "Registration", state: "done" },
    { label: "Email Verification", state: "done" },
    { label: "Build Your Profile", state: "done" },
    { label: "Profile Preview", state: "current" },
    { label: "Dashboard", state: "todo" },
] as const;

function formatMonth(value: string): string {
    if (!value) return "";
    const [y, m] = value.split("-");
    if (!y) return value;
    if (!m) return y;
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
    });
}

function getCsrfToken(): string {
    const meta = document.querySelector(
        'meta[name="csrf-token"]',
    ) as HTMLMetaElement | null;
    if (meta?.content) return meta.content;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
}

function flattenBackendErrors(payload: unknown, status: number): string[] {
    if (
        payload &&
        typeof payload === "object" &&
        "errors" in payload &&
        typeof (payload as { errors: unknown }).errors === "object"
    ) {
        const errs = (payload as { errors: Record<string, string[]> }).errors;
        const flat = Object.values(errs).flat();
        if (flat.length > 0) return flat;
    }
    if (
        payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof (payload as { message: unknown }).message === "string"
    ) {
        return [(payload as { message: string }).message];
    }
    return [
        `We couldn't save your profile (error ${status}). Please try again.`,
    ];
}

export default function ProfilePreview() {
    // The preview always renders the profile as stored in the database.
    const { profile: serverProfile } = usePage().props as unknown as {
        profile: ParticipantProfile | null;
    };
    const profile = useMemo(
        () => ({ ...emptyProfile(), ...(serverProfile ?? {}) }),
        [serverProfile],
    );

    const [errors, setErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const percent = useMemo(() => completionPercent(profile), [profile]);
    const statuses = useMemo(() => sectionStatuses(profile), [profile]);
    const incomplete = STEPS.filter(
        (s) => !statuses.find((st) => st.id === s.id)?.complete,
    );

    const fullName =
        `${profile.firstName} ${profile.lastName}`.trim() || "Your Name";
    const initials =
        `${profile.firstName.trim()[0] ?? ""}${profile.lastName.trim()[0] ?? ""}`.toUpperCase() ||
        "YOU";
    const location =
        [profile.city, profile.country].filter(Boolean).join(", ") || null;
    const isEmpty =
        !serverProfile &&
        !profile.firstName &&
        !profile.summary &&
        profile.skills.length === 0 &&
        profile.education.length === 0 &&
        profile.experience.length === 0;

    /**
     * Persist the previewed profile to the database, then continue to the
     * dashboard. Any backend validation errors are shown to the user.
     */
    async function handleSave() {
        setErrors([]);
        setIsSaving(true);
        try {
            const token = getCsrfToken();
            const res = await fetch("/onboarding/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    ...(token
                        ? { "X-XSRF-TOKEN": token, "X-CSRF-TOKEN": token }
                        : {}),
                },
                credentials: "same-origin",
                body: JSON.stringify({ ...profile, redirect_to: "dashboard" }),
            });

            if (res.ok) {
                router.visit("/dashboard");
                return;
            }

            const payload = (await res.json().catch(() => null)) as unknown;
            setErrors(flattenBackendErrors(payload, res.status));
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
            setErrors([
                "Network error – could not save your profile. Please check your connection and try again.",
            ]);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <>
            <Head title="Preview Your Profile" />
            <div className="flex min-h-svh flex-col bg-sand-50 font-sans text-ember antialiased">
                <header className="border-b border-harbor/10 bg-sand-50/85 backdrop-blur-md">
                    <div
                        aria-hidden
                        className="h-1 bg-gradient-to-r from-harbor via-sienna to-amber"
                    />
                    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/onboarding/build-profile"
                            className="flex items-center gap-2.5"
                        >
                            <span className="flex size-9 items-center justify-center rounded-xl bg-harbor text-sand-50 shadow-md shadow-harbor/25">
                                <Network className="size-5" strokeWidth={2.2} />
                            </span>
                            <span className="text-[15px] font-bold tracking-tight text-harbor">
                                AlphaForce ProjectLink
                            </span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="hidden items-center gap-1.5 rounded-full border border-moss/25 bg-moss/10 px-3 py-1.5 text-xs font-extrabold text-moss-600 sm:inline-flex">
                                <Eye className="size-3.5" />
                                Preview mode
                            </span>
                            <button
                                type="button"
                                onClick={() => router.post("/logout")}
                                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-harbor/15 px-3 text-[12px] font-bold text-ember-500 transition hover:border-sienna hover:text-sienna"
                            >
                                <LogOut className="size-3.5" />
                                <span className="hidden sm:inline">
                                    Log out
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="relative flex-1 overflow-hidden">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-clay/25 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-amber/15 blur-3xl"
                    />

                    <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                        {/* Journey */}
                        <nav aria-label="Onboarding progress">
                            <ol className="hidden items-start sm:flex">
                                {JOURNEY.map((s, i) => (
                                    <li
                                        key={s.label}
                                        className="flex flex-1 flex-col items-center gap-2 last:flex-none"
                                    >
                                        <span className="flex w-full items-center">
                                            <span
                                                aria-hidden
                                                className={`h-0.5 flex-1 rounded ${i === 0 ? "bg-transparent" : "bg-moss/50"}`}
                                            />
                                            <span
                                                className={`flex size-9 items-center justify-center rounded-full ${
                                                    s.state === "done"
                                                        ? "bg-moss text-white shadow-md shadow-moss/30"
                                                        : s.state === "current"
                                                          ? "relative bg-sienna text-white shadow-lg shadow-sienna/40"
                                                          : "border border-harbor/15 bg-white text-[13px] font-extrabold text-ember-400"
                                                }`}
                                            >
                                                {s.state === "done" ? (
                                                    s.label ===
                                                    "Build Your Profile" ? (
                                                        <FileText className="size-4.5" />
                                                    ) : s.label ===
                                                      "Email Verification" ? (
                                                        <MailCheck className="size-4.5" />
                                                    ) : (
                                                        <BadgeCheck className="size-4.5" />
                                                    )
                                                ) : s.state === "current" ? (
                                                    <Eye className="size-4.5" />
                                                ) : (
                                                    i + 1
                                                )}
                                            </span>
                                            <span
                                                aria-hidden
                                                className={`h-0.5 flex-1 rounded ${s.state === "done" ? "bg-moss/50" : "bg-harbor/10"} ${i === JOURNEY.length - 1 ? "bg-transparent" : ""}`}
                                            />
                                        </span>
                                        <span
                                            className={`text-center text-[11px] leading-tight font-bold ${s.state === "current" ? "text-sienna" : s.state === "done" ? "text-moss-600" : "text-ember-400"}`}
                                            aria-current={
                                                s.state === "current"
                                                    ? "step"
                                                    : undefined
                                            }
                                        >
                                            {s.label}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <p className="text-center text-[13px] font-bold text-ember-500 sm:hidden">
                                Step 4 of 5 ·{" "}
                                <span className="text-sienna">
                                    Profile Preview
                                </span>
                            </p>
                        </nav>

                        {/* Completion banner */}
                        <section
                            aria-label="Profile completion"
                            className="mt-8 flex flex-col gap-5 rounded-[1.75rem] border border-harbor/10 bg-harbor p-6 text-sand-50 shadow-xl shadow-harbor/25 sm:p-7 lg:flex-row lg:items-center"
                        >
                            <div className="flex-1">
                                <p className="text-[12px] font-extrabold tracking-widest uppercase opacity-80">
                                    Profile Completion — {percent}%
                                </p>
                                <div
                                    role="progressbar"
                                    aria-valuenow={percent}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label="Profile completion"
                                    className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15"
                                >
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-sienna-200 via-amber-200 to-amber"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                {incomplete.length > 0 ? (
                                    <p className="mt-3 text-[13.5px] leading-relaxed text-sand-100/85">
                                        Incomplete:{" "}
                                        {incomplete
                                            .map((s) => s.shortLabel)
                                            .join(" · ")}
                                        . This is how Project Managers will see
                                        you — polish anything that looks thin.
                                    </p>
                                ) : (
                                    <p className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-moss-200">
                                        <Check className="size-4" />
                                        Every section is complete — this is
                                        exactly what managers will see.
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
                                <Link
                                    href="/onboarding/build-profile"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/30 px-6 text-[14px] font-bold transition hover:bg-white/10"
                                >
                                    <Pencil className="size-4" />
                                    Edit Profile
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    aria-busy={isSaving}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-sienna px-6 text-[14px] font-bold text-white shadow-lg shadow-sienna/30 transition hover:bg-sienna-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving
                                        ? "Saving…"
                                        : "Save & Proceed to Dashboard"}
                                    <ArrowRight className="size-4" />
                                </button>
                            </div>
                        </section>

                        {/* Save errors */}
                        {errors.length > 0 && (
                            <div
                                role="alert"
                                className="mt-6 flex gap-3 rounded-2xl border border-sienna/25 bg-sienna-100/50 p-4"
                            >
                                <CircleAlert className="mt-0.5 size-5 shrink-0 text-sienna" />
                                <div>
                                    <p className="text-[14px] font-extrabold text-harbor">
                                        We couldn't save your profile
                                    </p>
                                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13.5px] font-medium text-ember-600">
                                        {errors.map((e) => (
                                            <li key={e}>{e}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {isEmpty ? (
                            <section className="mt-6 rounded-[2rem] border border-harbor/10 bg-white p-10 text-center shadow-2xl shadow-harbor/15 sm:p-14">
                                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-sienna/10 text-sienna">
                                    <UserRound className="size-7" />
                                </span>
                                <h1 className="mt-5 text-2xl font-bold tracking-tight text-harbor">
                                    Your preview is empty
                                </h1>
                                <p className="mx-auto mt-2 max-w-md text-[14.5px] text-ember-500">
                                    We couldn't find a saved profile. Head back
                                    to the builder — your progress saves
                                    automatically as you type.
                                </p>
                                <Link
                                    href="/onboarding/build-profile"
                                    className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-sienna px-8 text-[14.5px] font-bold text-white shadow-xl shadow-sienna/35 transition hover:bg-sienna-600"
                                >
                                    Build My Profile
                                    <ArrowRight className="size-4.5" />
                                </Link>
                            </section>
                        ) : (
                            <article
                                aria-label="Profile preview"
                                className="mt-6 overflow-hidden rounded-[2rem] border border-harbor/10 bg-white shadow-2xl shadow-harbor/15"
                            >
                                {/* CV header */}
                                <div className="relative bg-harbor px-6 pt-8 pb-6 sm:px-10 sm:pt-10">
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-sienna/25 blur-3xl"
                                    />
                                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                                        {profile.photoDataUrl ? (
                                            <img
                                                src={profile.photoDataUrl}
                                                alt={`Photo of ${fullName}`}
                                                className="size-24 rounded-3xl border-2 border-white/25 object-cover shadow-xl"
                                            />
                                        ) : (
                                            <span
                                                aria-hidden
                                                className="flex size-24 items-center justify-center rounded-3xl bg-sienna text-2xl font-extrabold text-white shadow-xl"
                                            >
                                                {initials}
                                            </span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-2xl font-bold tracking-tight text-sand-50 sm:text-3xl">
                                                {fullName}
                                            </h1>
                                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[13.5px] font-medium text-sand-100/85">
                                                {location && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="size-4 text-amber-200" />
                                                        {location}
                                                    </span>
                                                )}
                                                {profile.email && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Mail className="size-4 text-amber-200" />
                                                        {profile.email}
                                                    </span>
                                                )}
                                                {profile.phone && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Phone className="size-4 text-amber-200" />
                                                        {profile.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href="/onboarding/build-profile?step=0"
                                            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-white/25 px-5 text-[13px] font-bold text-sand-50 transition hover:bg-white/10"
                                        >
                                            <Pencil className="size-3.5" />
                                            Edit
                                        </Link>
                                    </div>
                                </div>

                                <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
                                    {/* Summary */}
                                    <section aria-label="Professional summary">
                                        <SectionHeading
                                            icon={
                                                <UserRound className="size-4.5" />
                                            }
                                            title="Professional Summary"
                                            editHref="/onboarding/build-profile?step=1"
                                        />
                                        {profile.summary ? (
                                            <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ember-600">
                                                {profile.summary}
                                            </p>
                                        ) : (
                                            <EmptyNote label="No professional summary yet." />
                                        )}
                                    </section>

                                    {/* Skills */}
                                    <section aria-label="Skills">
                                        <SectionHeading
                                            icon={
                                                <Sparkles className="size-4.5" />
                                            }
                                            title="Skills"
                                            editHref="/onboarding/build-profile?step=2"
                                        />
                                        {profile.skills.length > 0 ? (
                                            <ul className="mt-3 flex flex-wrap gap-2">
                                                {profile.skills.map((s) => (
                                                    <li
                                                        key={s}
                                                        className="rounded-full bg-harbor px-4 py-1.5 text-[13px] font-bold text-sand-50"
                                                    >
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <EmptyNote label="No skills added yet." />
                                        )}
                                    </section>

                                    {/* Experience */}
                                    <section aria-label="Work experience">
                                        <SectionHeading
                                            icon={
                                                <Briefcase className="size-4.5" />
                                            }
                                            title="Work Experience"
                                            editHref="/onboarding/build-profile?step=4"
                                        />
                                        {profile.experience.length > 0 ? (
                                            <ol className="mt-4 space-y-0">
                                                {profile.experience.map(
                                                    (exp, i) => (
                                                        <li
                                                            key={exp.id}
                                                            className="relative pl-7 pb-6 last:pb-0"
                                                        >
                                                            {i <
                                                                profile
                                                                    .experience
                                                                    .length -
                                                                    1 && (
                                                                <span
                                                                    aria-hidden
                                                                    className="absolute top-7 bottom-0 left-[7px] w-0.5 rounded bg-harbor/10"
                                                                />
                                                            )}
                                                            <span
                                                                aria-hidden
                                                                className="absolute top-1.5 left-0 size-4 rounded-full border-[3px] border-sienna bg-white"
                                                            />
                                                            <p className="text-[15px] font-extrabold text-harbor">
                                                                {exp.jobTitle ||
                                                                    "Untitled role"}{" "}
                                                                {exp.organisation && (
                                                                    <span className="font-bold text-ember-500">
                                                                        ·{" "}
                                                                        {
                                                                            exp.organisation
                                                                        }
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="mt-0.5 text-[12.5px] font-bold text-ember-400">
                                                                {formatMonth(
                                                                    exp.startDate,
                                                                ) ||
                                                                    "Start?"}{" "}
                                                                —{" "}
                                                                {exp.currentlyWorking
                                                                    ? "Present"
                                                                    : formatMonth(
                                                                          exp.endDate,
                                                                      ) ||
                                                                      "End?"}
                                                                {exp.location &&
                                                                    ` · ${exp.location}`}
                                                            </p>
                                                            {exp.description && (
                                                                <p className="mt-1.5 text-[14px] leading-relaxed whitespace-pre-line text-ember-600">
                                                                    {
                                                                        exp.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </li>
                                                    ),
                                                )}
                                            </ol>
                                        ) : (
                                            <EmptyNote label="No work experience added yet." />
                                        )}
                                    </section>

                                    {/* Education */}
                                    <section aria-label="Education">
                                        <SectionHeading
                                            icon={
                                                <GraduationCap className="size-4.5" />
                                            }
                                            title="Education"
                                            editHref="/onboarding/build-profile?step=3"
                                        />
                                        {profile.education.length > 0 ? (
                                            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                                                {profile.education.map(
                                                    (edu) => (
                                                        <li
                                                            key={edu.id}
                                                            className="rounded-2xl border border-harbor/10 bg-sand-50/60 p-4"
                                                        >
                                                            <p className="text-[14px] font-extrabold text-harbor">
                                                                {edu.qualification ||
                                                                    "Qualification"}
                                                            </p>
                                                            <p className="text-[13px] font-bold text-sienna">
                                                                {edu.institution ||
                                                                    "Institution"}
                                                            </p>
                                                            <p className="mt-1 text-[12.5px] font-medium text-ember-500">
                                                                {[
                                                                    edu.fieldOfStudy,
                                                                    [
                                                                        edu.startYear,
                                                                        edu.endYear,
                                                                    ]
                                                                        .filter(
                                                                            Boolean,
                                                                        )
                                                                        .join(
                                                                            " — ",
                                                                        ),
                                                                ]
                                                                    .filter(
                                                                        Boolean,
                                                                    )
                                                                    .join(
                                                                        " · ",
                                                                    ) || "—"}
                                                            </p>
                                                            {edu.description && (
                                                                <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-ember-600">
                                                                    {
                                                                        edu.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <EmptyNote label="No education added yet." />
                                        )}
                                    </section>

                                    {/* Certifications */}
                                    <section aria-label="Certifications">
                                        <SectionHeading
                                            icon={
                                                <Award className="size-4.5" />
                                            }
                                            title="Certifications"
                                            editHref="/onboarding/build-profile?step=5"
                                        />
                                        {profile.certifications.length > 0 ? (
                                            <ul className="mt-3 space-y-2.5">
                                                {profile.certifications.map(
                                                    (c) => (
                                                        <li
                                                            key={c.id}
                                                            className="flex items-start gap-3 rounded-2xl border border-harbor/10 bg-white p-4 shadow-sm"
                                                        >
                                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-moss/10 text-moss-600">
                                                                <Award className="size-5" />
                                                            </span>
                                                            <span className="min-w-0">
                                                                <span className="block text-[14px] font-extrabold text-harbor">
                                                                    {c.name ||
                                                                        "Untitled certification"}
                                                                </span>
                                                                <span className="block text-[13px] font-medium text-ember-500">
                                                                    {[
                                                                        c.issuingOrganisation,
                                                                        c.issueDate
                                                                            ? `Issued ${formatMonth(c.issueDate)}`
                                                                            : "",
                                                                        c.credentialNumber
                                                                            ? `#${c.credentialNumber}`
                                                                            : "",
                                                                    ]
                                                                        .filter(
                                                                            Boolean,
                                                                        )
                                                                        .join(
                                                                            " · ",
                                                                        ) ||
                                                                        "—"}
                                                                </span>
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <EmptyNote label="No certifications — optional, looks fine without." />
                                        )}
                                    </section>

                                    {/* Documents */}
                                    <section aria-label="Documents">
                                        <SectionHeading
                                            icon={
                                                <FileText className="size-4.5" />
                                            }
                                            title="Documents"
                                            editHref="/onboarding/build-profile?step=6"
                                        />
                                        {profile.documents.length > 0 ? (
                                            <ul className="mt-3 space-y-2.5">
                                                {profile.documents.map((d) => (
                                                    <li
                                                        key={d.id}
                                                        className="flex items-center gap-3 rounded-2xl border border-harbor/10 bg-white p-4 shadow-sm"
                                                    >
                                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-harbor/8 text-harbor">
                                                            <FileText className="size-5" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-[14px] font-extrabold text-harbor">
                                                                {d.name}
                                                            </span>
                                                            <span className="block text-[12.5px] font-medium text-ember-400">
                                                                {d.category} ·{" "}
                                                                {fileTypeLabel(
                                                                    d.type,
                                                                    d.name,
                                                                )}{" "}
                                                                ·{" "}
                                                                {formatFileSize(
                                                                    d.size,
                                                                )}
                                                            </span>
                                                        </span>
                                                        {(d.downloadUrl ||
                                                            d.dataUrl) && (
                                                            <a
                                                                href={
                                                                    d.downloadUrl ??
                                                                    d.dataUrl
                                                                }
                                                                download={
                                                                    d.dataUrl
                                                                        ? d.name
                                                                        : undefined
                                                                }
                                                                aria-label={`Download ${d.name}`}
                                                                className="inline-flex size-9 items-center justify-center rounded-full border border-harbor/12 text-harbor transition hover:bg-harbor hover:text-sand-50"
                                                            >
                                                                <Download className="size-4" />
                                                            </a>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <EmptyNote label="No documents uploaded — optional." />
                                        )}
                                    </section>
                                </div>
                            </article>
                        )}

                        {/* Footer actions */}
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href="/onboarding/build-profile"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-harbor/15 px-7 text-[14.5px] font-bold text-harbor transition hover:border-harbor hover:bg-harbor hover:text-sand-50"
                            >
                                <ArrowLeft className="size-4.5" />
                                Back to editor
                            </Link>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    aria-busy={isSaving}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-dashed border-clay-400/60 px-7 text-[14.5px] font-bold text-clay-600 transition hover:border-clay-600 hover:bg-clay-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save className="size-4.5" />
                                    {isSaving ? "Saving…" : "Save"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    aria-busy={isSaving}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-sienna px-8 text-[14.5px] font-bold text-white shadow-xl shadow-sienna/35 transition-all hover:-translate-y-0.5 hover:bg-sienna-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                >
                                    {isSaving
                                        ? "Saving…"
                                        : "Save & Continue to Dashboard"}
                                    <ArrowRight className="size-4.5" />
                                </button>
                            </div>
                        </div>

                        <p className="mt-6 text-center text-[13px] font-medium text-ember-400">
                            {profile.updatedAt
                                ? `Last saved ${new Date(profile.updatedAt).toLocaleString()}. `
                                : ""}
                            Project Managers see this preview layout when
                            reviewing applications.
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}

function SectionHeading({
    icon,
    title,
    editHref,
}: {
    icon: React.ReactNode;
    title: string;
    editHref: string;
}) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-harbor/10 pb-2.5">
            <h2 className="inline-flex items-center gap-2 text-[15px] font-extrabold tracking-tight text-harbor">
                <span className="flex size-8 items-center justify-center rounded-xl bg-sienna/10 text-sienna">
                    {icon}
                </span>
                {title}
            </h2>
            <Link
                href={editHref}
                aria-label={`Edit ${title}`}
                className="inline-flex size-8 items-center justify-center rounded-full border border-harbor/12 text-ember-400 transition hover:border-sienna hover:text-sienna"
            >
                <Pencil className="size-3.5" />
            </Link>
        </div>
    );
}

function EmptyNote({ label }: { label: string }) {
    return (
        <p className="mt-3 rounded-xl border border-dashed border-harbor/15 bg-sand-50/60 px-4 py-3 text-[13px] font-medium text-ember-400">
            {label}
        </p>
    );
}
