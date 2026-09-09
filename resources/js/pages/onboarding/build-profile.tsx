import { Head, router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    Award,
    BadgeCheck,
    Briefcase,
    Camera,
    Check,
    ChevronRight,
    CircleAlert,
    Download,
    Eye,
    FileText,
    GraduationCap,
    LayoutDashboard,
    MailCheck,
    MapPin,
    Network,
    Plus,
    Save,
    Sparkles,
    Trash2,
    Upload,
    UserRound,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
    SKILL_SUGGESTIONS,
    STEPS,
    clearDraft,
    completionPercent,
    emptyCertification,
    emptyEducation,
    emptyExperience,
    emptyProfile,
    fileTypeLabel,
    formatFileSize,
    loadDraft,
    newId,
    requiredBlockingErrors,
    saveDraft,
    sectionStatuses,
    type CertificationEntry,
    type EducationEntry,
    type ExperienceEntry,
    type ParticipantProfile,
    type ProfileDocument,
    type StepId,
} from "./lib/profile";

/* ── Small presentational helpers ─────────────────────────────── */

function Field({
    label,
    required,
    optional,
    hint,
    error,
    children,
    htmlFor,
}: {
    label: string;
    required?: boolean;
    optional?: boolean;
    hint?: string;
    error?: string;
    children: ReactNode;
    htmlFor?: string;
}) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="flex items-baseline justify-between gap-2 text-[13.5px] font-bold text-harbor"
            >
                <span>
                    {label}{" "}
                    {required && (
                        <span aria-hidden className="text-sienna">
                            *
                        </span>
                    )}
                    {required && <span className="sr-only">(required)</span>}
                    {optional && (
                        <span className="ml-1.5 rounded-full bg-sand-100 px-2 py-0.5 text-[11px] font-bold text-ember-400">
                            Optional
                        </span>
                    )}
                </span>
            </label>
            <div className="mt-1.5">{children}</div>
            {hint && !error && (
                <p className="mt-1.5 text-[12.5px] text-ember-400">{hint}</p>
            )}
            {error && (
                <p
                    role="alert"
                    className="mt-1.5 text-[12.5px] font-semibold text-sienna-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

const inputCls =
    "h-12 w-full rounded-xl border border-harbor/15 bg-white px-4 text-[14.5px] font-medium text-ember placeholder:font-normal placeholder:text-ember-400/70 shadow-sm outline-none transition focus:border-sienna focus:ring-2 focus:ring-sienna/25";
const textareaCls =
    "w-full rounded-xl border border-harbor/15 bg-white px-4 py-3.5 text-[14.5px] leading-relaxed font-medium text-ember placeholder:font-normal placeholder:text-ember-400/70 shadow-sm outline-none transition focus:border-sienna focus:ring-2 focus:ring-sienna/25";

function SectionCard({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-harbor/10 bg-sand-50/60 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-[15px] font-extrabold text-harbor">
                        {title}
                    </h3>
                    {description && (
                        <p className="mt-1 text-[13px] text-ember-500">
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>
            <div className="mt-4">{children}</div>
        </div>
    );
}

/* ── Main page ────────────────────────────────────────────────── */

const JOURNEY = [
    { label: "Registration", state: "done" },
    { label: "Email Verification", state: "done" },
    { label: "Build Your Profile", state: "current" },
    { label: "Profile Preview", state: "todo" },
    { label: "Dashboard", state: "todo" },
] as const;

export default function BuildProfile() {
    const { auth, profile: serverProfile } = usePage().props as unknown as {
        auth: {
            user: { id: number; name?: string; email?: string } | null;
        };
        profile: ParticipantProfile | null;
    };
    const userId = auth.user?.id;

    const [profile, setProfile] = useState<ParticipantProfile>(() => {
        // The database is the source of truth once a profile has been saved.
        if (serverProfile) {
            return { ...emptyProfile(), ...serverProfile };
        }
        if (!userId) return emptyProfile();
        const draft = loadDraft(userId);
        const hasAnything =
            draft.firstName ||
            draft.lastName ||
            draft.email ||
            draft.summary ||
            draft.skills.length > 0;
        if (!hasAnything && auth.user) {
            const parts = (auth.user.name ?? "").trim().split(/\s+/);
            return {
                ...draft,
                firstName: draft.firstName || parts[0] || "",
                lastName: draft.lastName || parts.slice(1).join(" ") || "",
                email: draft.email || auth.user.email || "",
            };
        }
        return draft;
    });
    const [stepIndex, setStepIndex] = useState(() => {
        if (typeof window === "undefined") return 0;
        const fromQuery = Number(
            new URLSearchParams(window.location.search).get("step"),
        );
        return Number.isInteger(fromQuery) &&
            fromQuery >= 0 &&
            fromQuery < STEPS.length
            ? fromQuery
            : 0;
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [savedAt, setSavedAt] = useState<string | null>(
        profile.updatedAt ?? null,
    );
    const [skillInput, setSkillInput] = useState("");
    const [docCategory, setDocCategory] =
        useState<ProfileDocument["category"]>("CV");
    const [isSaving, setIsSaving] = useState(false);

    const photoRef = useRef<HTMLInputElement>(null);
    const docsRef = useRef<HTMLInputElement>(null);
    const topRef = useRef<HTMLDivElement>(null);

    const step = STEPS[stepIndex];
    const statuses = useMemo(() => sectionStatuses(profile), [profile]);
    const percent = useMemo(() => completionPercent(profile), [profile]);
    const statusById = useMemo(
        () =>
            Object.fromEntries(statuses.map((s) => [s.id, s])) as Record<
                StepId,
                (typeof statuses)[number]
            >,
        [statuses],
    );

    // Autosave draft (debounced) so participants can continue later.
    useEffect(() => {
        const t = window.setTimeout(() => {
            if (userId) saveDraft(profile, userId);
            setSavedAt(new Date().toISOString());
        }, 600);
        return () => window.clearTimeout(t);
    }, [profile]);

    const patch = (p: Partial<ParticipantProfile>) =>
        setProfile((prev) => ({ ...prev, ...p }));

    function scrollTop() {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function goTo(index: number) {
        setErrors([]);
        setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));
        scrollTop();
    }

    function getCsrfToken(): string {
        const meta = document.querySelector(
            'meta[name="csrf-token"]',
        ) as HTMLMetaElement | null;
        if (meta?.content) return meta.content;
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : "";
    }

    function flattenBackendErrors(payload: unknown): string[] {
        if (
            payload &&
            typeof payload === "object" &&
            "errors" in payload &&
            typeof (payload as { errors: unknown }).errors === "object"
        ) {
            const errs = (payload as { errors: Record<string, string[]> })
                .errors;
            const flat = Object.values(errs).flat();
            if (flat.length > 0) return flat;
        }
        if (
            payload &&
            typeof payload === "object" &&
            "message" in payload &&
            typeof (payload as { message: string }).message === "string"
        ) {
            return [(payload as { message: string }).message];
        }
        return ["An unexpected error occurred. Please try again."];
    }

    async function persistToServer(
        profileToSave: ParticipantProfile,
    ): Promise<boolean> {
        const token = getCsrfToken();
        setIsSaving(true);
        try {
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
                body: JSON.stringify(profileToSave),
            });

            if (res.ok) {
                const data = (await res.json()) as {
                    profile?: ParticipantProfile;
                };
                if (data.profile) {
                    // Optionally sync server response (e.g., IDs) – keep local draft in sync
                    if (userId)
                        saveDraft(
                            data.profile as unknown as ParticipantProfile,
                            userId,
                        );
                }
                return true;
            }

            if (res.status === 422) {
                const payload = (await res.json()) as unknown;
                const flat = flattenBackendErrors(payload);
                setErrors(flat);
                scrollTop();
                toast.error("Please fix the errors before continuing.", {
                    description: flat[0],
                });
                return false;
            }

            const payload = (await res.json().catch(() => null)) as unknown;
            const flat = flattenBackendErrors(payload);
            setErrors(flat);
            scrollTop();
            toast.error("Failed to save profile.", { description: flat[0] });
            return false;
        } catch {
            toast.error("Network error", {
                description:
                    "Could not save your profile. Please check your connection.",
            });
            setErrors([
                "Network error – could not save your profile. Please try again.",
            ]);
            scrollTop();
            return false;
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveDraft() {
        const pruned = pruneEmpty(profile);
        if (userId) saveDraft(pruned, userId);
        setSavedAt(new Date().toISOString());
        const ok = await persistToServer(pruned);
        if (ok) {
            toast.success("Draft saved", {
                description: "You can continue later — nothing is lost.",
            });
        }
        // persistToServer already shows validation errors via setErrors + toast.error when !ok
    }

    function pruneEmpty(value: ParticipantProfile): ParticipantProfile {
        return {
            ...value,
            education: value.education.filter(
                (e) =>
                    e.institution.trim() ||
                    e.qualification.trim() ||
                    e.fieldOfStudy.trim() ||
                    e.description.trim(),
            ),
            experience: value.experience.filter(
                (e) =>
                    e.jobTitle.trim() ||
                    e.organisation.trim() ||
                    e.location.trim() ||
                    e.description.trim(),
            ),
            certifications: value.certifications.filter(
                (c) =>
                    c.name.trim() ||
                    c.issuingOrganisation.trim() ||
                    c.credentialNumber.trim(),
            ),
        };
    }

    async function handleContinue() {
        const blocking = requiredBlockingErrors(profile, step.id);
        if (blocking.length > 0) {
            setErrors(blocking);
            scrollTop();
            return;
        }
        setErrors([]);
        const pruned = pruneEmpty(profile);
        setProfile(pruned);
        if (userId) saveDraft(pruned, userId);

        const ok = await persistToServer(pruned);
        if (!ok) return;

        if (stepIndex < STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
            scrollTop();
        }
    }

    /* ── field helpers ── */

    function handlePhotoFile(file: File | undefined) {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file for your photo.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Photo must be smaller than 5 MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () =>
            patch({ photoDataUrl: String(reader.result ?? "") });
        reader.readAsDataURL(file);
    }

    function handleDocumentFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        const next: ProfileDocument[] = [];
        Array.from(files).forEach((file) => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(
                    `“${file.name}” is larger than 10 MB and was skipped.`,
                );
                return;
            }
            const doc: ProfileDocument = {
                id: newId("doc"),
                name: file.name,
                size: file.size,
                type: file.type || "application/octet-stream",
                category: docCategory,
                uploadDate: new Date().toISOString(),
            };
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = String(reader.result ?? "");
                setProfile((prev) => ({
                    ...prev,
                    documents: prev.documents.map((d) =>
                        d.id === doc.id ? { ...d, dataUrl } : d,
                    ),
                }));
            };
            reader.readAsDataURL(file);
            next.push(doc);
        });
        if (next.length > 0) {
            setProfile((prev) => ({
                ...prev,
                documents: [...prev.documents, ...next],
            }));
            toast.success(
                next.length === 1
                    ? "Document added"
                    : `${next.length} documents added`,
            );
        }
        if (docsRef.current) docsRef.current.value = "";
    }

    function addSkill(raw: string) {
        const value = raw.trim().replace(/\s+/g, " ");
        if (!value) return;
        if (
            profile.skills.some((s) => s.toLowerCase() === value.toLowerCase())
        ) {
            toast.info("That skill is already on your list.");
            return;
        }
        patch({ skills: [...profile.skills, value] });
        setSkillInput("");
    }

    function updateEducation(id: string, p: Partial<EducationEntry>) {
        patch({
            education: profile.education.map((e) =>
                e.id === id ? { ...e, ...p } : e,
            ),
        });
    }

    function updateExperience(id: string, p: Partial<ExperienceEntry>) {
        patch({
            experience: profile.experience.map((e) =>
                e.id === id
                    ? {
                          ...e,
                          ...p,
                          endDate: p.currentlyWorking
                              ? ""
                              : (p.endDate ?? e.endDate),
                      }
                    : e,
            ),
        });
    }

    function updateCertification(id: string, p: Partial<CertificationEntry>) {
        patch({
            certifications: profile.certifications.map((c) =>
                c.id === id ? { ...c, ...p } : c,
            ),
        });
    }

    const initials =
        `${profile.firstName.trim()[0] ?? ""}${profile.lastName.trim()[0] ?? ""}`.toUpperCase() ||
        "YOU";

    const savedLabel = savedAt
        ? `Saved ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        : "Saving…";

    return (
        <>
            <Head title="Build Your Profile" />
            <div
                ref={topRef}
                className="flex min-h-svh scroll-mt-4 flex-col bg-sand-50 font-sans text-ember antialiased"
            >
                {/* ── Top bar ── */}
                <header className="border-b border-harbor/10 bg-sand-50/85 backdrop-blur-md">
                    <div
                        aria-hidden
                        className="h-1 bg-gradient-to-r from-harbor via-sienna to-amber"
                    />
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <span className="flex items-center gap-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-harbor text-sand-50 shadow-md shadow-harbor/25">
                                <Network className="size-5" strokeWidth={2.2} />
                            </span>
                            <span className="text-[15px] font-bold tracking-tight text-harbor">
                                AlphaForce ProjectLink
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-ember-500">
                            <span className="hidden items-center gap-1.5 rounded-full border border-moss/25 bg-moss/10 px-3 py-1.5 text-moss-600 sm:inline-flex">
                                <Save className="size-3.5" />
                                {savedLabel} · continues later
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

                <main className="relative flex-1 overflow-hidden">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-clay/25 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-amber/15 blur-3xl"
                    />

                    <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                        {/* ── Journey ── */}
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
                                                    <BadgeCheck className="size-4.5" />
                                                ) : s.state === "current" ? (
                                                    <FileText className="size-4.5" />
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
                                Step 3 of 5 ·{" "}
                                <span className="text-sienna">
                                    Build Your Profile
                                </span>
                            </p>
                        </nav>

                        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
                            {/* ── Sidebar: completion ── */}
                            <aside className="space-y-4 lg:sticky lg:top-6">
                                <section
                                    aria-label="Profile completion"
                                    className="rounded-[1.75rem] border border-harbor/10 bg-harbor p-6 text-sand-50 shadow-xl shadow-harbor/25"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="inline-flex items-center gap-2 text-[13px] font-extrabold tracking-wide uppercase opacity-90">
                                            <Sparkles className="size-4 text-amber-200" />
                                            Profile Completion
                                        </p>
                                        <p className="rounded-full bg-white/10 px-3 py-1 text-sm font-extrabold text-amber-200">
                                            {percent}%
                                        </p>
                                    </div>
                                    <div
                                        role="progressbar"
                                        aria-valuenow={percent}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Profile completion"
                                        className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/15"
                                    >
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-sienna-200 via-amber-200 to-amber transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <p className="mt-3 text-[13px] leading-relaxed text-sand-100/85">
                                        {percent < 40
                                            ? "Great start — complete the core sections so organisations can find you."
                                            : percent < 80
                                              ? "Looking strong. Add education and experience to stand out."
                                              : percent < 100
                                                ? "Almost there — a few finishing touches left."
                                                : "Excellent — your profile is complete and ready to preview."}
                                    </p>

                                    <ol className="mt-5 space-y-1">
                                        {STEPS.map((s, i) => {
                                            const st = statusById[s.id];
                                            const active = i === stepIndex;
                                            return (
                                                <li key={s.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => goTo(i)}
                                                        aria-current={
                                                            active
                                                                ? "step"
                                                                : undefined
                                                        }
                                                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                                            active
                                                                ? "bg-white/12 ring-1 ring-white/25"
                                                                : "hover:bg-white/8"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold ${
                                                                st.complete
                                                                    ? "bg-moss text-white"
                                                                    : active
                                                                      ? "bg-amber text-harbor"
                                                                      : "bg-white/12 text-sand-100"
                                                            }`}
                                                        >
                                                            {st.complete ? (
                                                                <Check className="size-4" />
                                                            ) : (
                                                                i + 1
                                                            )}
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-center gap-1.5 text-[13.5px] font-bold">
                                                                {s.shortLabel}
                                                                {!s.required && (
                                                                    <span className="text-[10.5px] font-bold text-sand-100/60 uppercase">
                                                                        ·
                                                                        optional
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/12">
                                                                <span
                                                                    className={`block h-full rounded-full ${st.complete ? "bg-moss-200" : "bg-amber-200/80"}`}
                                                                    style={{
                                                                        width: `${st.percent}%`,
                                                                    }}
                                                                />
                                                            </span>
                                                        </span>
                                                        {active && (
                                                            <ChevronRight className="size-4 shrink-0 text-amber-200" />
                                                        )}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </section>

                                <section className="hidden rounded-[1.75rem] border border-harbor/10 bg-white p-6 shadow-lg shadow-harbor/10 lg:block">
                                    <p className="inline-flex items-center gap-2 text-[13.5px] font-extrabold text-harbor">
                                        <Eye className="size-4.5 text-clay-600" />
                                        How managers see you
                                    </p>
                                    <p className="mt-2 text-[13px] leading-relaxed text-ember-500">
                                        Project Managers scan for a clear
                                        summary, relevant skills, and recent
                                        experience. Keep entries short and
                                        concrete.
                                    </p>
                                </section>
                            </aside>

                            {/* ── Main step card ── */}
                            <section
                                aria-labelledby="step-heading"
                                className="overflow-hidden rounded-[2rem] border border-harbor/10 bg-white shadow-2xl shadow-harbor/15"
                            >
                                {/* Stepper strip */}
                                <div className="border-b border-harbor/10 bg-sand-100/70 px-6 pt-4 pb-6 sm:px-8">
                                    <ol
                                        aria-label="Profile sections"
                                        className="flex items-center gap-1 overflow-x-auto pb-2"
                                    >
                                        {STEPS.map((s, i) => (
                                            <li
                                                key={s.id}
                                                className="flex items-center gap-1"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => goTo(i)}
                                                    className={`rounded-full px-3 py-1.5 text-[12px] font-extrabold whitespace-nowrap transition ${
                                                        i === stepIndex
                                                            ? "bg-harbor text-sand-50 shadow-md shadow-harbor/25"
                                                            : statusById[s.id]
                                                                    .complete
                                                              ? "bg-moss/12 text-moss-600"
                                                              : "text-ember-400 hover:bg-white hover:text-harbor"
                                                    }`}
                                                >
                                                    {i + 1}. {s.shortLabel}
                                                </button>
                                                {i < STEPS.length - 1 && (
                                                    <ChevronRight
                                                        aria-hidden
                                                        className="size-3.5 shrink-0 text-ember-400/50"
                                                    />
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="px-6 py-7 sm:px-8 sm:py-9">
                                    <p className="inline-flex items-center gap-2 text-[12px] font-extrabold tracking-widest text-sienna uppercase">
                                        Step {stepIndex + 1} of {STEPS.length}
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 normal-case ${step.required ? "bg-sienna/10 text-sienna-600" : "bg-sand-100 text-ember-500"}`}
                                        >
                                            {step.required
                                                ? "Required"
                                                : "Optional — skippable"}
                                        </span>
                                    </p>
                                    <h1
                                        id="step-heading"
                                        className="mt-2 text-2xl font-bold tracking-tight text-harbor sm:text-[28px]"
                                    >
                                        {step.label}
                                    </h1>
                                    <p className="mt-1.5 text-[14.5px] text-ember-500">
                                        {step.hint}
                                    </p>

                                    {errors.length > 0 && (
                                        <div
                                            role="alert"
                                            className="mt-5 flex gap-3 rounded-2xl border border-sienna/25 bg-sienna-100/50 p-4"
                                        >
                                            <CircleAlert className="mt-0.5 size-5 shrink-0 text-sienna" />
                                            <div>
                                                <p className="text-[14px] font-extrabold text-harbor">
                                                    Please complete the required
                                                    information
                                                </p>
                                                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13.5px] font-medium text-ember-600">
                                                    {errors.map((e) => (
                                                        <li key={e}>{e}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-7">{renderStep()}</div>

                                    {/* ── Navigation ── */}
                                    <div className="mt-9 flex flex-col gap-3 border-t border-harbor/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                        <button
                                            type="button"
                                            onClick={() => goTo(stepIndex - 1)}
                                            disabled={stepIndex === 0}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-harbor/15 px-6 text-[14.5px] font-bold text-harbor transition hover:border-harbor hover:bg-harbor hover:text-sand-50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-harbor/15 disabled:hover:bg-transparent disabled:hover:text-harbor"
                                        >
                                            <ArrowLeft className="size-4.5" />
                                            Back
                                        </button>

                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <button
                                                type="button"
                                                onClick={handleSaveDraft}
                                                disabled={isSaving}
                                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-dashed border-clay-400/60 px-6 text-[14.5px] font-bold text-clay-600 transition hover:border-clay-600 hover:bg-clay-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Save className="size-4.5" />
                                                {isSaving
                                                    ? "Saving..."
                                                    : "Save as Draft"}
                                            </button>
                                            {stepIndex < STEPS.length - 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={handleContinue}
                                                    disabled={isSaving}
                                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-sienna px-8 text-[14.5px] font-bold text-white shadow-xl shadow-sienna/35 transition-all hover:-translate-y-0.5 hover:bg-sienna-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSaving
                                                        ? "Saving..."
                                                        : "Save & Continue"}
                                                    <ArrowRight className="size-4.5" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={async () => {
                                                        // Validate all required steps before preview
                                                        const requiredSteps: StepId[] =
                                                            [
                                                                "personal",
                                                                "summary",
                                                                "skills",
                                                            ];
                                                        const allErrors =
                                                            requiredSteps.flatMap(
                                                                (id) =>
                                                                    requiredBlockingErrors(
                                                                        profile,
                                                                        id,
                                                                    ),
                                                            );
                                                        if (
                                                            allErrors.length > 0
                                                        ) {
                                                            setErrors(
                                                                allErrors,
                                                            );
                                                            scrollTop();
                                                            toast.error(
                                                                "Please complete the required sections before previewing.",
                                                                {
                                                                    description:
                                                                        allErrors[0],
                                                                },
                                                            );
                                                            return;
                                                        }
                                                        const pruned =
                                                            pruneEmpty(profile);
                                                        setProfile(pruned);
                                                        if (userId)
                                                            saveDraft(
                                                                pruned,
                                                                userId,
                                                            );
                                                        const ok =
                                                            await persistToServer(
                                                                pruned,
                                                            );
                                                        if (!ok) return;
                                                        router.visit(
                                                            "/onboarding/profile-preview",
                                                        );
                                                    }}
                                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-harbor px-8 text-[14.5px] font-bold text-sand-50 shadow-xl shadow-harbor/35 transition-all hover:-translate-y-0.5 hover:bg-harbor-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Eye className="size-4.5" />
                                                    {isSaving
                                                        ? "Saving..."
                                                        : "Preview Profile"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {!step.required &&
                                        stepIndex < STEPS.length - 1 && (
                                            <p className="mt-4 text-center text-[13px] font-medium text-ember-400 sm:text-right">
                                                Nothing to add here?{" "}
                                                <button
                                                    type="button"
                                                    onClick={handleContinue}
                                                    className="font-bold text-sienna underline-offset-2 hover:underline"
                                                >
                                                    Skip for now
                                                </button>{" "}
                                                — you can come back anytime.
                                            </p>
                                        )}
                                </div>
                            </section>

                            <div className="flex items-center justify-end text-[12.5px] font-semibold text-ember-400">
                                <span>
                                    Next:{" "}
                                    {STEPS[stepIndex + 1]?.label ??
                                        "Profile Preview"}
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );

    /* ── Per-step bodies ─────────────────────────────── */

    function renderStep() {
        switch (step.id) {
            case "personal":
                return (
                    <div className="space-y-6">
                        {/* Photo */}
                        <div className="flex flex-col items-start gap-4 rounded-2xl border border-harbor/10 bg-sand-50/60 p-5 sm:flex-row sm:items-center">
                            <span className="relative">
                                {profile.photoDataUrl ? (
                                    <img
                                        src={profile.photoDataUrl}
                                        alt="Profile photo preview"
                                        className="size-20 rounded-2xl border border-harbor/10 object-cover shadow-md"
                                    />
                                ) : (
                                    <span
                                        aria-hidden
                                        className="flex size-20 items-center justify-center rounded-2xl bg-harbor text-xl font-extrabold text-sand-50"
                                    >
                                        {initials}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => photoRef.current?.click()}
                                    aria-label="Upload profile photo"
                                    className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full bg-sienna text-white shadow-lg shadow-sienna/40 transition hover:bg-sienna-600"
                                >
                                    <Camera className="size-4" />
                                </button>
                            </span>
                            <div className="flex-1">
                                <p className="text-[14px] font-extrabold text-harbor">
                                    Profile photo{" "}
                                    <span className="ml-1 rounded-full bg-sand-100 px-2 py-0.5 text-[11px] font-bold text-ember-400">
                                        Optional
                                    </span>
                                </p>
                                <p className="mt-1 text-[13px] text-ember-500">
                                    A clear headshot helps organisations
                                    recognise you. JPG or PNG, max 5 MB.
                                </p>
                                <div className="mt-2.5 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            photoRef.current?.click()
                                        }
                                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-harbor px-4 text-[13px] font-bold text-sand-50 transition hover:bg-harbor-700"
                                    >
                                        <Upload className="size-3.5" />
                                        {profile.photoDataUrl
                                            ? "Change photo"
                                            : "Upload photo"}
                                    </button>
                                    {profile.photoDataUrl && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                patch({ photoDataUrl: null })
                                            }
                                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-harbor/15 px-4 text-[13px] font-bold text-ember-500 transition hover:border-sienna hover:text-sienna"
                                        >
                                            <X className="size-3.5" />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                            <input
                                ref={photoRef}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                aria-label="Profile photo file"
                                onChange={(e) =>
                                    handlePhotoFile(e.target.files?.[0])
                                }
                            />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="First name"
                                required
                                htmlFor="firstName"
                            >
                                <input
                                    id="firstName"
                                    className={inputCls}
                                    placeholder="e.g. Amara"
                                    autoComplete="given-name"
                                    value={profile.firstName}
                                    onChange={(e) =>
                                        patch({ firstName: e.target.value })
                                    }
                                />
                            </Field>
                            <Field
                                label="Last name"
                                required
                                htmlFor="lastName"
                            >
                                <input
                                    id="lastName"
                                    className={inputCls}
                                    placeholder="e.g. Okafor"
                                    autoComplete="family-name"
                                    value={profile.lastName}
                                    onChange={(e) =>
                                        patch({ lastName: e.target.value })
                                    }
                                />
                            </Field>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Email"
                                required
                                htmlFor="email"
                                hint="Organisations use this to contact you about projects."
                            >
                                <input
                                    id="email"
                                    type="email"
                                    className={inputCls}
                                    placeholder="you@example.org"
                                    autoComplete="email"
                                    value={profile.email}
                                    onChange={(e) =>
                                        patch({ email: e.target.value })
                                    }
                                />
                            </Field>
                            <Field
                                label="Phone number"
                                optional
                                htmlFor="phone"
                            >
                                <input
                                    id="phone"
                                    type="tel"
                                    className={inputCls}
                                    placeholder="+260 97 000 0000"
                                    autoComplete="tel"
                                    value={profile.phone}
                                    onChange={(e) =>
                                        patch({ phone: e.target.value })
                                    }
                                />
                            </Field>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Location / City"
                                optional
                                htmlFor="city"
                            >
                                <div className="relative">
                                    <MapPin className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-ember-400" />
                                    <input
                                        id="city"
                                        className={`${inputCls} pl-11`}
                                        placeholder="e.g. Lusaka"
                                        autoComplete="address-level2"
                                        value={profile.city}
                                        onChange={(e) =>
                                            patch({ city: e.target.value })
                                        }
                                    />
                                </div>
                            </Field>
                            <Field label="Country" optional htmlFor="country">
                                <input
                                    id="country"
                                    className={inputCls}
                                    placeholder="e.g. Zambia"
                                    autoComplete="country-name"
                                    value={profile.country}
                                    onChange={(e) =>
                                        patch({ country: e.target.value })
                                    }
                                />
                            </Field>
                        </div>
                    </div>
                );

            case "summary":
                return (
                    <div className="space-y-5">
                        <Field
                            label="Professional Summary"
                            required
                            htmlFor="summary"
                            hint={`${profile.summary.trim().length} characters — aim for 200+ to give managers a full picture.`}
                        >
                            <textarea
                                id="summary"
                                rows={8}
                                className={`${textareaCls} min-h-44 resize-y`}
                                placeholder="Tell organisations about your professional background, strengths, and what you can contribute to projects."
                                value={profile.summary}
                                onChange={(e) =>
                                    patch({ summary: e.target.value })
                                }
                            />
                        </Field>
                        <div className="rounded-2xl border border-moss/20 bg-moss/8 p-5">
                            <p className="inline-flex items-center gap-2 text-[13.5px] font-extrabold text-moss-600">
                                <Award className="size-4.5" />
                                What makes a strong summary?
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-ember-600">
                                <li>
                                    Your years of experience and sector focus
                                </li>
                                <li>2–3 standout strengths or specialisms</li>
                                <li>
                                    The kind of projects you want to contribute
                                    to
                                </li>
                            </ul>
                        </div>
                    </div>
                );

            case "skills":
                return (
                    <div className="space-y-5">
                        <Field
                            label="Add a skill"
                            required
                            htmlFor="skillInput"
                            hint="Press Enter to add. Add at least one — 3 or more is ideal."
                        >
                            <div className="flex gap-2">
                                <input
                                    id="skillInput"
                                    className={inputCls}
                                    placeholder="e.g. Data Analysis"
                                    value={skillInput}
                                    onChange={(e) =>
                                        setSkillInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addSkill(skillInput);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => addSkill(skillInput)}
                                    className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl bg-harbor px-5 text-[14px] font-bold text-sand-50 transition hover:bg-harbor-700"
                                >
                                    <Plus className="size-4.5" />
                                    Add
                                </button>
                            </div>
                        </Field>

                        {profile.skills.length > 0 ? (
                            <ul
                                aria-label="Your skills"
                                className="flex flex-wrap gap-2"
                            >
                                {profile.skills.map((s) => (
                                    <li
                                        key={s}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-harbor/12 bg-harbor py-1.5 pr-2 pl-4 text-[13.5px] font-bold text-sand-50 shadow-sm"
                                    >
                                        {s}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                patch({
                                                    skills: profile.skills.filter(
                                                        (x) => x !== s,
                                                    ),
                                                })
                                            }
                                            aria-label={`Remove skill ${s}`}
                                            className="flex size-5.5 items-center justify-center rounded-full bg-white/15 transition hover:bg-sienna"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="rounded-2xl border border-dashed border-harbor/20 bg-sand-50/60 p-5 text-center text-[13.5px] font-medium text-ember-400">
                                No skills yet — add your first skill above.
                            </p>
                        )}

                        <div>
                            <p className="text-[13px] font-bold text-harbor">
                                Suggestions — select to add:
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {SKILL_SUGGESTIONS.filter(
                                    (s) =>
                                        !profile.skills.some(
                                            (x) =>
                                                x.toLowerCase() ===
                                                s.toLowerCase(),
                                        ),
                                ).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => addSkill(s)}
                                        className="inline-flex items-center gap-1 rounded-full border border-clay-400/40 bg-white px-3.5 py-1.5 text-[13px] font-bold text-clay-600 transition hover:border-sienna hover:bg-sienna hover:text-white"
                                    >
                                        <Plus className="size-3.5" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "education":
                return (
                    <div className="space-y-5">
                        {profile.education.length === 0 && (
                            <p className="rounded-2xl border border-dashed border-harbor/20 bg-sand-50/60 p-5 text-center text-[13.5px] font-medium text-ember-400">
                                No education added yet. Add your most recent
                                qualification first.
                            </p>
                        )}
                        {profile.education.map((edu, idx) => (
                            <SectionCard
                                key={edu.id}
                                title={`Education ${idx + 1}`}
                                action={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            patch({
                                                education:
                                                    profile.education.filter(
                                                        (e) => e.id !== edu.id,
                                                    ),
                                            })
                                        }
                                        aria-label={`Remove education ${idx + 1}`}
                                        className="inline-flex size-9 items-center justify-center rounded-full border border-harbor/12 text-ember-400 transition hover:border-sienna hover:text-sienna"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                }
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Field
                                            label="Institution"
                                            required
                                            htmlFor={`edu-inst-${edu.id}`}
                                        >
                                            <input
                                                id={`edu-inst-${edu.id}`}
                                                className={inputCls}
                                                placeholder="e.g. University of Zambia"
                                                value={edu.institution}
                                                onChange={(e) =>
                                                    updateEducation(edu.id, {
                                                        institution:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </Field>
                                    </div>
                                    <Field
                                        label="Qualification / Degree"
                                        required
                                        htmlFor={`edu-qual-${edu.id}`}
                                    >
                                        <input
                                            id={`edu-qual-${edu.id}`}
                                            className={inputCls}
                                            placeholder="e.g. BSc, Diploma, Certificate"
                                            value={edu.qualification}
                                            onChange={(e) =>
                                                updateEducation(edu.id, {
                                                    qualification:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Field of Study"
                                        optional
                                        htmlFor={`edu-field-${edu.id}`}
                                    >
                                        <input
                                            id={`edu-field-${edu.id}`}
                                            className={inputCls}
                                            placeholder="e.g. Development Studies"
                                            value={edu.fieldOfStudy}
                                            onChange={(e) =>
                                                updateEducation(edu.id, {
                                                    fieldOfStudy:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Start Year"
                                        required
                                        htmlFor={`edu-start-${edu.id}`}
                                    >
                                        <input
                                            id={`edu-start-${edu.id}`}
                                            className={inputCls}
                                            placeholder="e.g. 2018"
                                            inputMode="numeric"
                                            value={edu.startYear}
                                            onChange={(e) =>
                                                updateEducation(edu.id, {
                                                    startYear: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="End Year"
                                        optional
                                        htmlFor={`edu-end-${edu.id}`}
                                    >
                                        <input
                                            id={`edu-end-${edu.id}`}
                                            className={inputCls}
                                            placeholder="e.g. 2022"
                                            inputMode="numeric"
                                            value={edu.endYear}
                                            onChange={(e) =>
                                                updateEducation(edu.id, {
                                                    endYear: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <div className="sm:col-span-2">
                                        <Field
                                            label="Description"
                                            optional
                                            htmlFor={`edu-desc-${edu.id}`}
                                        >
                                            <textarea
                                                id={`edu-desc-${edu.id}`}
                                                rows={3}
                                                className={`${textareaCls} min-h-20`}
                                                placeholder="Key subjects, results, or highlights…"
                                                value={edu.description}
                                                onChange={(e) =>
                                                    updateEducation(edu.id, {
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </SectionCard>
                        ))}
                        <button
                            type="button"
                            onClick={() =>
                                patch({
                                    education: [
                                        ...profile.education,
                                        emptyEducation(),
                                    ],
                                })
                            }
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-harbor/20 text-[14.5px] font-bold text-harbor transition hover:border-sienna hover:bg-sienna/5 hover:text-sienna"
                        >
                            <GraduationCap className="size-5" />
                            Add Education
                        </button>
                    </div>
                );

            case "experience":
                return (
                    <div className="space-y-5">
                        {profile.experience.length === 0 && (
                            <p className="rounded-2xl border border-dashed border-harbor/20 bg-sand-50/60 p-5 text-center text-[13.5px] font-medium text-ember-400">
                                No experience added yet. Start with your most
                                recent role.
                            </p>
                        )}
                        {profile.experience.map((exp, idx) => (
                            <SectionCard
                                key={exp.id}
                                title={`Experience ${idx + 1}`}
                                action={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            patch({
                                                experience:
                                                    profile.experience.filter(
                                                        (e) => e.id !== exp.id,
                                                    ),
                                            })
                                        }
                                        aria-label={`Remove experience ${idx + 1}`}
                                        className="inline-flex size-9 items-center justify-center rounded-full border border-harbor/12 text-ember-400 transition hover:border-sienna hover:text-sienna"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                }
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Job Title"
                                        required
                                        htmlFor={`exp-title-${exp.id}`}
                                    >
                                        <input
                                            id={`exp-title-${exp.id}`}
                                            className={inputCls}
                                            placeholder="e.g. Field Officer"
                                            value={exp.jobTitle}
                                            onChange={(e) =>
                                                updateExperience(exp.id, {
                                                    jobTitle: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Organisation"
                                        required
                                        htmlFor={`exp-org-${exp.id}`}
                                    >
                                        <input
                                            id={`exp-org-${exp.id}`}
                                            className={inputCls}
                                            placeholder="e.g. Community Health Alliance"
                                            value={exp.organisation}
                                            onChange={(e) =>
                                                updateExperience(exp.id, {
                                                    organisation:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Location"
                                        optional
                                        htmlFor={`exp-loc-${exp.id}`}
                                    >
                                        <input
                                            id={`exp-loc-${exp.id}`}
                                            className={inputCls}
                                            placeholder="e.g. Ndola, Zambia"
                                            value={exp.location}
                                            onChange={(e) =>
                                                updateExperience(exp.id, {
                                                    location: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field
                                            label="Start Date"
                                            required
                                            htmlFor={`exp-start-${exp.id}`}
                                        >
                                            <input
                                                id={`exp-start-${exp.id}`}
                                                type="month"
                                                className={inputCls}
                                                value={exp.startDate}
                                                onChange={(e) =>
                                                    updateExperience(exp.id, {
                                                        startDate:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="End Date"
                                            optional
                                            htmlFor={`exp-end-${exp.id}`}
                                        >
                                            <input
                                                id={`exp-end-${exp.id}`}
                                                type="month"
                                                className={inputCls}
                                                disabled={exp.currentlyWorking}
                                                value={exp.endDate}
                                                onChange={(e) =>
                                                    updateExperience(exp.id, {
                                                        endDate: e.target.value,
                                                    })
                                                }
                                            />
                                        </Field>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-sand-100/70 px-4 py-3 sm:col-span-2">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={exp.currentlyWorking}
                                            aria-label="Currently working here"
                                            onClick={() =>
                                                updateExperience(exp.id, {
                                                    currentlyWorking:
                                                        !exp.currentlyWorking,
                                                })
                                            }
                                            className={`relative h-6.5 w-11.5 shrink-0 rounded-full transition ${exp.currentlyWorking ? "bg-moss" : "bg-harbor/20"}`}
                                        >
                                            <span
                                                className={`absolute top-0.5 left-0.5 size-5.5 rounded-full bg-white shadow transition-transform ${exp.currentlyWorking ? "translate-x-5" : ""}`}
                                            />
                                        </button>
                                        <span className="text-[13.5px] font-bold text-harbor">
                                            Currently working here
                                        </span>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Field
                                            label="Description"
                                            optional
                                            htmlFor={`exp-desc-${exp.id}`}
                                            hint="What did you do, and what changed because of it?"
                                        >
                                            <textarea
                                                id={`exp-desc-${exp.id}`}
                                                rows={3}
                                                className={`${textareaCls} min-h-20`}
                                                placeholder="Key responsibilities and achievements…"
                                                value={exp.description}
                                                onChange={(e) =>
                                                    updateExperience(exp.id, {
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </SectionCard>
                        ))}
                        <button
                            type="button"
                            onClick={() =>
                                patch({
                                    experience: [
                                        ...profile.experience,
                                        emptyExperience(),
                                    ],
                                })
                            }
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-harbor/20 text-[14.5px] font-bold text-harbor transition hover:border-sienna hover:bg-sienna/5 hover:text-sienna"
                        >
                            <Briefcase className="size-5" />
                            Add Experience
                        </button>
                    </div>
                );

            case "certifications":
                return (
                    <div className="space-y-5">
                        {profile.certifications.length === 0 && (
                            <p className="rounded-2xl border border-dashed border-harbor/20 bg-sand-50/60 p-5 text-center text-[13.5px] font-medium text-ember-400">
                                No certifications yet — this section is
                                optional. Add professional certificates if you
                                have them.
                            </p>
                        )}
                        {profile.certifications.map((cert, idx) => (
                            <SectionCard
                                key={cert.id}
                                title={`Certification ${idx + 1}`}
                                action={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            patch({
                                                certifications:
                                                    profile.certifications.filter(
                                                        (c) => c.id !== cert.id,
                                                    ),
                                            })
                                        }
                                        aria-label={`Remove certification ${idx + 1}`}
                                        className="inline-flex size-9 items-center justify-center rounded-full border border-harbor/12 text-ember-400 transition hover:border-sienna hover:text-sienna"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                }
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Field
                                            label="Certification name"
                                            required
                                            htmlFor={`cert-name-${cert.id}`}
                                        >
                                            <input
                                                id={`cert-name-${cert.id}`}
                                                className={inputCls}
                                                placeholder="e.g. PMP, Data Analytics Professional"
                                                value={cert.name}
                                                onChange={(e) =>
                                                    updateCertification(
                                                        cert.id,
                                                        {
                                                            name: e.target
                                                                .value,
                                                        },
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                    <Field
                                        label="Issuing organisation"
                                        required
                                        htmlFor={`cert-org-${cert.id}`}
                                    >
                                        <input
                                            id={`cert-org-${cert.id}`}
                                            className={inputCls}
                                            placeholder="e.g. PMI, Google"
                                            value={cert.issuingOrganisation}
                                            onChange={(e) =>
                                                updateCertification(cert.id, {
                                                    issuingOrganisation:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Credential / reference number"
                                        optional
                                        htmlFor={`cert-cred-${cert.id}`}
                                    >
                                        <input
                                            id={`cert-cred-${cert.id}`}
                                            className={inputCls}
                                            placeholder="e.g. CERT-2024-8841"
                                            value={cert.credentialNumber}
                                            onChange={(e) =>
                                                updateCertification(cert.id, {
                                                    credentialNumber:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Issue date"
                                        optional
                                        htmlFor={`cert-issue-${cert.id}`}
                                    >
                                        <input
                                            id={`cert-issue-${cert.id}`}
                                            type="month"
                                            className={inputCls}
                                            value={cert.issueDate}
                                            onChange={(e) =>
                                                updateCertification(cert.id, {
                                                    issueDate: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Expiry date"
                                        optional
                                        htmlFor={`cert-exp-${cert.id}`}
                                    >
                                        <input
                                            id={`cert-exp-${cert.id}`}
                                            type="month"
                                            className={inputCls}
                                            value={cert.expiryDate}
                                            onChange={(e) =>
                                                updateCertification(cert.id, {
                                                    expiryDate: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                </div>
                            </SectionCard>
                        ))}
                        <button
                            type="button"
                            onClick={() =>
                                patch({
                                    certifications: [
                                        ...profile.certifications,
                                        emptyCertification(),
                                    ],
                                })
                            }
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-harbor/20 text-[14.5px] font-bold text-harbor transition hover:border-sienna hover:bg-sienna/5 hover:text-sienna"
                        >
                            <Award className="size-5" />
                            Add Certification
                        </button>
                    </div>
                );

            case "documents":
                return (
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-harbor/10 bg-sand-50/60 p-5 sm:p-6">
                            <p className="text-[14px] font-extrabold text-harbor">
                                Upload professional documents
                            </p>
                            <p className="mt-1 text-[13px] text-ember-500">
                                CV, certificates, or supporting documents. PDF,
                                DOC, or images up to 10 MB each.
                            </p>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                <label
                                    htmlFor="docCategory"
                                    className="flex flex-1 flex-col gap-1.5 text-[13px] font-bold text-harbor"
                                >
                                    Document type
                                    <select
                                        id="docCategory"
                                        value={docCategory}
                                        onChange={(e) =>
                                            setDocCategory(
                                                e.target
                                                    .value as ProfileDocument["category"],
                                            )
                                        }
                                        className={`${inputCls} appearance-none`}
                                    >
                                        <option value="CV">CV</option>
                                        <option value="Certificate">
                                            Certificate
                                        </option>
                                        <option value="Supporting document">
                                            Supporting document
                                        </option>
                                    </select>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => docsRef.current?.click()}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-harbor px-6 text-[14px] font-bold text-sand-50 transition hover:bg-harbor-700 sm:self-end"
                                >
                                    <Upload className="size-4.5" />
                                    Choose files
                                </button>
                            </div>
                            <input
                                ref={docsRef}
                                type="file"
                                multiple
                                className="sr-only"
                                aria-label="Upload documents"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={(e) =>
                                    handleDocumentFiles(e.target.files)
                                }
                            />
                        </div>

                        {profile.documents.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-harbor/20 bg-white p-5 text-center text-[13.5px] font-medium text-ember-400">
                                No documents uploaded yet — this section is
                                optional and can be completed later.
                            </p>
                        ) : (
                            <ul
                                aria-label="Uploaded documents"
                                className="space-y-3"
                            >
                                {profile.documents.map((doc) => (
                                    <li
                                        key={doc.id}
                                        className="flex items-center gap-4 rounded-2xl border border-harbor/10 bg-white p-4 shadow-sm"
                                    >
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-harbor/8 text-harbor">
                                            <FileText className="size-5" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[14px] font-extrabold text-harbor">
                                                {doc.name}
                                            </span>
                                            <span className="mt-0.5 block text-[12.5px] font-medium text-ember-400">
                                                {doc.category} ·{" "}
                                                {fileTypeLabel(
                                                    doc.type,
                                                    doc.name,
                                                )}{" "}
                                                · {formatFileSize(doc.size)} ·{" "}
                                                {new Date(
                                                    doc.uploadDate,
                                                ).toLocaleDateString()}
                                            </span>
                                        </span>
                                        {doc.dataUrl || doc.downloadUrl ? (
                                            <a
                                                href={
                                                    doc.downloadUrl ??
                                                    doc.dataUrl
                                                }
                                                download={
                                                    doc.dataUrl
                                                        ? doc.name
                                                        : undefined
                                                }
                                                aria-label={`Download ${doc.name}`}
                                                className="inline-flex size-9 items-center justify-center rounded-full border border-harbor/12 text-harbor transition hover:border-harbor hover:bg-harbor hover:text-sand-50"
                                            >
                                                <Download className="size-4" />
                                            </a>
                                        ) : (
                                            <span className="text-[11.5px] font-bold text-ember-400">
                                                Preparing…
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                patch({
                                                    documents:
                                                        profile.documents.filter(
                                                            (d) =>
                                                                d.id !== doc.id,
                                                        ),
                                                })
                                            }
                                            aria-label={`Remove ${doc.name}`}
                                            className="inline-flex size-9 items-center justify-center rounded-full border border-harbor/12 text-ember-400 transition hover:border-sienna hover:text-sienna"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="rounded-2xl border border-harbor/10 bg-harbor p-5 text-sand-50 sm:p-6">
                            <p className="inline-flex items-center gap-2 text-[14px] font-extrabold">
                                <UserRound className="size-4.5 text-amber-200" />
                                You're at the final step
                            </p>
                            <p className="mt-1.5 text-[13.5px] leading-relaxed text-sand-100/85">
                                Review everything on the next screen. Your
                                profile is {percent}% complete
                                {percent < 100
                                    ? " — you can still enter the dashboard with a partial profile and finish later."
                                    : " — nicely done."}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (userId) clearDraft(userId);
                                        setProfile(emptyProfile());
                                        setSkillInput("");
                                        setStepIndex(0);
                                        scrollTop();
                                        toast.info(
                                            "Started fresh — draft cleared.",
                                        );
                                    }}
                                    className="inline-flex h-10 items-center rounded-full border border-white/25 px-5 text-[13px] font-bold transition hover:bg-white/10"
                                >
                                    Start over
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    }
}
