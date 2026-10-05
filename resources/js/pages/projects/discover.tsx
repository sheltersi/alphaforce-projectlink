import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    Compass,
    Heart,
    MapPin,
    Search,
    Send,
    Sparkles,
    UsersRound,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { dashboard } from "@/routes";
import { index as myProjectsIndex } from "@/routes/my-projects";
import { index as projectsIndex, show as projectsShow, apply as projectsApply, like as projectsLike } from "@/routes/projects";

type DiscoverProject = {
    id: number;
    title: string;
    slug: string | null;
    description: string | null;
    location: string | null;
    status: "open" | "in_progress";
    match: number;
    positions: number;
    start_date: string | null;
    end_date: string | null;
    organisation: string | null;
    skills: string[];
    likes_count: number;
    liked_by_me: boolean;
    application_status: string | null;
};

type ApplicationMeta = {
    label: string;
    className: string;
};

const gradients = [
    "bg-gradient-to-br from-sienna-500 to-sienna-700 dark:from-sienna-600 dark:to-sienna-800",
    "bg-gradient-to-br from-moss-500 to-moss-700 dark:from-moss-600 dark:to-moss-800",
    "bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800",
    "bg-gradient-to-br from-harbor-500 to-harbor-700 dark:from-harbor-600 dark:to-harbor-800",
    "bg-gradient-to-br from-clay-400 to-clay-600 dark:from-clay-600 dark:to-clay-800",
];

function applicationMeta(status: string | null): ApplicationMeta | null {
    switch (status) {
        case "submitted":
            return {
                label: "Applied",
                className: "bg-harbor-100 text-harbor-700 dark:bg-harbor-800/40 dark:text-harbor-300",
            };
        case "under_review":
            return {
                label: "Under review",
                className: "bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300",
            };
        case "shortlisted":
            return {
                label: "Shortlisted",
                className: "bg-moss-100 text-moss-700 dark:bg-moss-800/40 dark:text-moss-300",
            };
        case "accepted":
            return {
                label: "Accepted",
                className: "bg-moss-100 text-moss-700 dark:bg-moss-800/40 dark:text-moss-300",
            };
        case "rejected":
            return {
                label: "Rejected",
                className: "bg-clay-100 text-clay-700 dark:bg-clay-700/40 dark:text-clay-300",
            };
        default:
            return null;
    }
}

export default function DiscoverProjects() {
    const { projects } = usePage().props as unknown as {
        projects: DiscoverProject[];
    };

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress">("all");
    const [savedOnly, setSavedOnly] = useState(false);
    const [liking, setLiking] = useState<Set<number>>(new Set());
    const [applyProject, setApplyProject] = useState<DiscoverProject | null>(null);

    const form = useForm<{ cover_letter: string }>({ cover_letter: "" });

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return projects.filter((project) => {
            if (statusFilter !== "all" && project.status !== statusFilter) return false;
            if (savedOnly && !project.liked_by_me) return false;
            if (!q) return true;
            const haystack = (
                [project.title, project.organisation, project.location, ...project.skills].join(" ")
            ).toLowerCase();
            return haystack.includes(q);
        });
    }, [projects, query, statusFilter, savedOnly]);

    const hasActiveFilters = query.trim().length > 0 || statusFilter !== "all" || savedOnly;
    const totalLikes = projects.filter((p) => p.liked_by_me).length;

    function clearFilters() {
        setQuery("");
        setStatusFilter("all");
        setSavedOnly(false);
    }

    function toggleLike(project: DiscoverProject) {
        if (liking.has(project.id)) {
            return;
        }
        setLiking((prev) => new Set(prev).add(project.id));
        router.post(projectsLike({ project: project.id }).url, {}, {
            preserveScroll: true,
            onFinish: () =>
                setLiking((prev) => {
                    const next = new Set(prev);
                    next.delete(project.id);
                    return next;
                }),
        });
    }

    function submitApplication() {
        if (!applyProject) {
            return;
        }
        form.post(projectsApply({ project: applyProject.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setApplyProject(null);
            },
        });
    }

    return (
        <>
            <Head title="Discover projects" />
            <main className="min-h-full bg-background px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header — discover-only. "My projects" lives on /my-projects. */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end animate-fade-in-up">
                        <div>
                            <p className="text-sm font-bold text-sienna dark:text-sienna-300">
                                Explore the network
                            </p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                Discover projects
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                Browse open opportunities, save the ones you love, and
                                apply in a few clicks. Your assignments live under{" "}
                                <Link href={myProjectsIndex({}).url} className="font-bold text-sienna underline underline-offset-4 hover:text-sienna-600 dark:text-sienna-300">
                                    My projects
                                </Link>
                                .
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSavedOnly((v) => !v)}
                            aria-pressed={savedOnly}
                            title={savedOnly ? "Show all projects" : "Show saved projects only"}
                            className={cn(
                                "inline-flex h-9 items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:self-auto",
                                savedOnly
                                    ? "bg-sienna text-white shadow-sm hover:bg-sienna-600"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                            )}
                        >
                            <Heart className={cn("size-3.5", savedOnly ? "fill-current" : "text-sienna dark:text-sienna-300")} />
                            {totalLikes} saved
                        </button>
                    </div>

                    {/* Toolbar: search + filters. Scoped to discovery results only. */}
                    <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center animate-fade-in-up stagger-1">
                        <div className="relative flex-1">
                            <label htmlFor="discover-search" className="sr-only">
                                Search projects, organisations, skills, locations
                            </label>
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="discover-search"
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search projects, organisations, skills, locations…"
                                autoComplete="off"
                                className="w-full rounded-xl border border-border bg-card py-3 pr-10 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-sienna/50 focus:ring-2 focus:ring-sienna/20 focus:outline-none transition-shadow"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    aria-label="Clear search"
                                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                        <div
                            role="group"
                            aria-label="Filter by project status"
                            className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1.5"
                        >
                            {([
                                { value: "all", label: "All" },
                                { value: "open", label: "Open" },
                                { value: "in_progress", label: "In progress" },
                            ] as const).map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={statusFilter === option.value}
                                    onClick={() => setStatusFilter(option.value)}
                                    className={cn(
                                        "rounded-lg px-3.5 py-2 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-harbor/40 focus-visible:outline-none",
                                        statusFilter === option.value
                                            ? "bg-harbor text-white shadow-sm"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="mt-4 text-xs font-semibold text-muted-foreground" role="status" aria-live="polite">
                        Showing {filtered.length} of {projects.length} projects
                        {hasActiveFilters && (
                            <>
                                {" · "}
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="font-bold text-sienna underline underline-offset-4 hover:text-sienna-600 dark:text-sienna-300"
                                >
                                    Clear filters
                                </button>
                            </>
                        )}
                    </p>

                    {/* Results */}
                    {filtered.length > 0 ? (
                        <div className="mt-4 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filtered.map((project, idx) => {
                                const meta = applicationMeta(project.application_status);
                                const gradient = gradients[idx % gradients.length];
                                const isLiking = liking.has(project.id);
                                return (
                                    <article
                                        key={project.id}
                                        className="glass-card premium-shadow-hover group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 pt-6 transition-all duration-300 animate-fade-in-up"
                                        style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
                                    >
                                        <div
                                            aria-hidden
                                            className={cn(
                                                "pointer-events-none absolute inset-x-0 top-0 h-1.5",
                                                gradient,
                                            )}
                                        />
                                        <div className="flex items-start justify-between gap-3">
                                            <span
                                                aria-hidden
                                                className={cn(
                                                    "flex size-11 items-center justify-center rounded-xl text-white shadow-lg",
                                                    gradient,
                                                )}
                                            >
                                                <BriefcaseBusiness className="size-5" />
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => toggleLike(project)}
                                                disabled={isLiking}
                                                aria-pressed={project.liked_by_me}
                                                aria-label={project.liked_by_me ? `Unsave ${project.title}` : `Save ${project.title}`}
                                                title={project.liked_by_me ? "Saved — click to unsave" : "Save this project"}
                                                className={cn(
                                                    "flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-sienna/40 focus-visible:outline-none",
                                                    project.liked_by_me
                                                        ? "bg-sienna-100 text-sienna dark:bg-sienna-900/40 dark:text-sienna-300"
                                                        : "text-muted-foreground hover:bg-accent hover:text-sienna",
                                                    isLiking && "opacity-50",
                                                )}
                                            >
                                                <Heart
                                                    className={cn(
                                                        "size-4",
                                                        project.liked_by_me && "fill-current",
                                                    )}
                                                />
                                                <span className="text-[11px] font-bold tabular-nums">
                                                    {project.likes_count}
                                                </span>
                                            </button>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            {project.match > 0 && (
                                                <span className="inline-flex items-center rounded-full bg-moss-100 px-2.5 py-0.5 text-[11px] font-extrabold text-moss-700 dark:bg-moss-800/40 dark:text-moss-300">
                                                    {project.match}% match
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                                                {project.status === "open" ? "Open" : "In progress"}
                                            </span>
                                        </div>

                                        <h2 className="mt-2 text-[16px] leading-snug font-extrabold text-foreground">
                                            <Link
                                                href={projectsShow({ project: project.id }).url}
                                                className="transition-colors hover:text-sienna hover:underline hover:underline-offset-4 dark:hover:text-sienna-300"
                                            >
                                                {project.title}
                                            </Link>
                                        </h2>
                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                            {project.organisation ?? "Independent project"}
                                        </p>

                                        <p className="mt-3 line-clamp-2 min-h-10 text-[13px] leading-relaxed text-muted-foreground">
                                            {project.description ?? "No description provided."}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground">
                                            {project.location && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="size-3.5 shrink-0 text-sienna dark:text-sienna-300" />
                                                    <span className="truncate">{project.location}</span>
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1">
                                                <UsersRound className="size-3.5 shrink-0 text-sienna dark:text-sienna-300" />
                                                {project.positions} positions
                                            </span>
                                            {project.end_date && (
                                                <span className="inline-flex items-center gap-1">
                                                    <CalendarDays className="size-3.5 shrink-0 text-sienna dark:text-sienna-300" />
                                                    Ends {new Date(project.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            )}
                                        </div>

                                        {project.skills.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Required skills">
                                                {project.skills.slice(0, 4).map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-secondary-foreground"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {project.skills.length > 4 && (
                                                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">
                                                        +{project.skills.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto pt-4">
                                            <div className="flex w-full items-center gap-2 border-t border-border/60 pt-4">
                                            {meta ? (
                                                <span
                                                    className={cn(
                                                        "inline-flex h-10 flex-1 items-center justify-center rounded-xl px-4 text-xs font-extrabold",
                                                        meta.className,
                                                    )}
                                                >
                                                    {meta.label}
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setApplyProject(project)}
                                                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-harbor px-4 text-sm font-bold text-white shadow-lg shadow-harbor/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-harbor-700 hover:shadow-xl hover:shadow-harbor/25 focus-visible:ring-2 focus-visible:ring-harbor/40 focus-visible:outline-none dark:bg-harbor-600 dark:hover:bg-harbor-500"
                                                >
                                                    <Send className="size-4" />
                                                    {project.application_status === "rejected"
                                                        ? "Apply again"
                                                        : "Apply"}
                                                </button>
                                            )}
                                            <Link
                                                href={projectsShow({ project: project.id }).url}
                                                aria-label={`View details for ${project.title}`}
                                                className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-border px-4 text-xs font-bold text-foreground transition-colors hover:border-sienna/40 hover:bg-sienna-100 hover:text-sienna-700 focus-visible:ring-2 focus-visible:ring-sienna/40 focus-visible:outline-none dark:hover:bg-sienna-900/30 dark:hover:text-sienna-300"
                                            >
                                                Details
                                                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                            </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="glass-card mt-4 rounded-2xl p-10 text-center animate-fade-in-up">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-secondary">
                                {hasActiveFilters ? (
                                    <Search className="size-5 text-sienna dark:text-sienna-300" />
                                ) : (
                                    <Compass className="size-5 text-sienna dark:text-sienna-300" />
                                )}
                            </div>
                            <h2 className="mt-4 text-lg font-extrabold text-foreground">
                                {hasActiveFilters
                                    ? savedOnly && filtered.length === 0 && query.trim() === "" && statusFilter === "all"
                                        ? "No saved projects yet"
                                        : "No projects match your filters"
                                    : "No projects to discover yet"}
                            </h2>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? "Try a different search term, clearing the status filter, or turning off “saved only”."
                                    : "New projects will appear here as organisations publish them."}
                            </p>
                            <div className="mt-5 flex items-center justify-center gap-2">
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
                                    >
                                        <X className="size-3.5" />
                                        Clear filters
                                    </button>
                                )}
                                <Link
                                    href={myProjectsIndex({}).url}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-accent"
                                >
                                    <BriefcaseBusiness className="size-3.5" />
                                    Go to My projects
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Apply dialog */}
            <Dialog open={applyProject !== null} onOpenChange={(open) => { if (!open) { setApplyProject(null); form.reset(); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-harbor text-white">
                                <Sparkles className="size-4" />
                            </span>
                            Apply to {applyProject?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {applyProject?.organisation ?? "Independent project"} ·{" "}
                            {applyProject?.location ?? "Remote"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1">
                        <label htmlFor="cover-letter" className="text-xs font-bold text-foreground">
                            Cover letter <span className="font-medium text-muted-foreground">(optional)</span>
                        </label>
                        <textarea
                            id="cover-letter"
                            rows={5}
                            value={form.data.cover_letter}
                            onChange={(event) => form.setData("cover_letter", event.target.value)}
                            placeholder="Tell the project team why you're a great fit…"
                            className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-sienna/50 focus:ring-2 focus:ring-sienna/20 focus:outline-none transition-shadow"
                        />
                        {form.errors.cover_letter && (
                            <p className="text-xs font-medium text-red-600">{form.errors.cover_letter}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => { setApplyProject(null); form.reset(); }}
                            className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-accent"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={submitApplication}
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-harbor px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-harbor/20 transition-all duration-300 hover:bg-harbor-700 disabled:opacity-50 dark:bg-harbor-600"
                        >
                            <Send className="size-3.5" />
                            {form.processing ? "Submitting…" : "Submit application"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

DiscoverProjects.layout = {
    breadcrumbs: [
        { title: "Workspace", href: dashboard().url },
        { title: "Discover projects", href: projectsIndex({}).url },
    ],
};
