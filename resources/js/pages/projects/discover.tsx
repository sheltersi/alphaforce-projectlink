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

function canApplyTo(status: string | null): boolean {
    return status === null || status === "withdrawn" || status === "rejected";
}

export default function DiscoverProjects() {
    const { projects } = usePage().props as unknown as { projects: DiscoverProject[] };

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress">("all");
    const [liking, setLiking] = useState<Set<number>>(new Set());
    const [applyProject, setApplyProject] = useState<DiscoverProject | null>(null);

    const form = useForm<{ cover_letter: string }>({ cover_letter: "" });

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return projects.filter((project) => {
            const matchesStatus = statusFilter === "all" || project.status === statusFilter;
            if (!q) {
                return matchesStatus;
            }
            const haystack = (
                [project.title, project.organisation, project.location, ...project.skills].join(" ")
            ).toLowerCase();
            return matchesStatus && haystack.includes(q);
        });
    }, [projects, query, statusFilter]);

    const totalLikes = projects.filter((p) => p.liked_by_me).length;

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
                    {/* Header */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end animate-fade-in-up">
                        <div>
                            <p className="text-sm font-bold text-sienna dark:text-sienna-300">
                                Explore the network
                            </p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                Discover projects
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                Browse open opportunities, like the ones you love, and
                                apply in a few clicks.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">
                                <Heart className="size-3.5 text-sienna dark:text-sienna-300" />
                                {totalLikes} saved
                            </span>
                        </div>
                    </div>

                    {/* Toolbar: search + filters */}
                    <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center animate-fade-in-up stagger-1">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search projects, organisations, skills, locations…"
                                className="w-full rounded-xl border border-border bg-card py-3 pr-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-sienna/50 focus:ring-2 focus:ring-sienna/20 focus:outline-none transition-shadow"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1.5">
                            {([
                                { value: "all", label: "All" },
                                { value: "open", label: "Open" },
                                { value: "in_progress", label: "In progress" },
                            ] as const).map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setStatusFilter(option.value)}
                                    className={cn(
                                        "rounded-lg px-3.5 py-2 text-xs font-bold transition-colors",
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

                    {/* Results */}
                    {filtered.length > 0 ? (
                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filtered.map((project, idx) => {
                                const meta = applicationMeta(project.application_status);
                                const gradient = gradients[idx % gradients.length];
                                return (
                                    <article
                                        key={project.id}
                                        className="glass-card premium-shadow-hover group relative flex flex-col overflow-hidden rounded-2xl p-5 transition-all duration-300 animate-fade-in-up"
                                        style={{ animationDelay: `${idx * 40}ms` }}
                                    >
                                        <div
                                            className={cn(
                                                "pointer-events-none absolute inset-x-0 top-0 h-1.5 opacity-80",
                                                gradient,
                                            )}
                                        />
                                        <div className="flex items-start justify-between gap-3">
                                            <span
                                                className={cn(
                                                    "flex size-11 items-center justify-center rounded-xl text-white shadow-lg",
                                                    gradient,
                                                )}
                                            >
                                                <BriefcaseBusiness className="size-5" />
                                            </span>
                                            <button
                                                onClick={() => toggleLike(project)}
                                                disabled={liking.has(project.id)}
                                                className={cn(
                                                    "flex items-center gap-1 rounded-lg px-1.5 py-1 transition-colors",
                                                    project.liked_by_me
                                                        ? "text-sienna"
                                                        : "text-muted-foreground hover:bg-accent hover:text-sienna",
                                                    liking.has(project.id) && "opacity-50",
                                                )}
                                                aria-label={project.liked_by_me ? `Unlike ${project.title}` : `Like ${project.title}`}
                                            >
                                                <Heart
                                                    className={cn(
                                                        "size-4 transition-transform group-hover:scale-110",
                                                        project.liked_by_me && "fill-sienna",
                                                    )}
                                                />
                                                <span className="text-[11px] font-bold">
                                                    {project.likes_count}
                                                </span>
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
                                            {project.match > 0 && (
                                                <span className="inline-flex items-center rounded-full bg-moss-100 px-2.5 py-0.5 text-[11px] font-extrabold text-moss-700 dark:bg-moss-800/40 dark:text-moss-300">
                                                    {project.match}% match
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                                                {project.status === "open" ? "Open" : "In progress"}
                                            </span>
                                        </div>

                                        <h2 className="mt-2 text-[16px] font-extrabold leading-snug text-foreground">
                                            <Link
                                                href={projectsShow({ project: project.id }).url}
                                                className="transition-colors hover:text-sienna dark:hover:text-sienna-300"
                                            >
                                                {project.title}
                                            </Link>
                                        </h2>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {project.organisation ?? "Independent project"}
                                        </p>

                                        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                                            {project.description ?? "No description provided."}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground">
                                            {project.location && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="size-3.5 text-sienna dark:text-sienna-300" />
                                                    {project.location}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1">
                                                <UsersRound className="size-3.5 text-sienna dark:text-sienna-300" />
                                                {project.positions} positions
                                            </span>
                                            {project.end_date && (
                                                <span className="inline-flex items-center gap-1">
                                                    <CalendarDays className="size-3.5 text-sienna dark:text-sienna-300" />
                                                    Ends {new Date(project.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            )}
                                        </div>

                                        {project.skills.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
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

                                        <div className="mt-4 flex items-center gap-2 pt-1">
                                            {meta ? (
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center rounded-xl px-4 py-2.5 text-xs font-extrabold",
                                                        meta.className,
                                                    )}
                                                >
                                                    {meta.label}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setApplyProject(project)}
                                                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-harbor px-4 text-sm font-bold text-white shadow-lg shadow-harbor/20 transition-all duration-300 hover:bg-harbor-700 hover:shadow-xl hover:shadow-harbor/25 hover:-translate-y-0.5 dark:bg-harbor-600 dark:hover:bg-harbor-500"
                                                >
                                                    <Send className="size-4" />
                                                    {project.application_status === "rejected"
                                                        ? "Apply again"
                                                        : "Apply"}
                                                </button>
                                            )}
                                            <Link
                                                href={projectsShow({ project: project.id }).url}
                                                className="inline-flex items-center justify-center text-xs font-bold text-sienna hover:text-sienna-600 dark:text-sienna-300 dark:hover:text-sienna-200"
                                            >
                                                Details
                                                <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="glass-card mt-6 rounded-2xl p-10 text-center animate-fade-in-up">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-secondary">
                                {query || statusFilter !== "all" ? (
                                    <Search className="size-5 text-sienna dark:text-sienna-300" />
                                ) : (
                                    <Compass className="size-5 text-sienna dark:text-sienna-300" />
                                )}
                            </div>
                            <h2 className="mt-4 text-lg font-extrabold text-foreground">
                                {query || statusFilter !== "all"
                                    ? "No projects match your filters"
                                    : "No projects to discover yet"}
                            </h2>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                                {query || statusFilter !== "all"
                                    ? "Try a different search term or clearing the status filter."
                                    : "New projects will appear here as organisations publish them."}
                            </p>
                            {(query || statusFilter !== "all") && (
                                <button
                                    onClick={() => {
                                        setQuery("");
                                        setStatusFilter("all");
                                    }}
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
                                >
                                    <X className="size-3.5" />
                                    Clear filters
                                </button>
                            )}
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
                            onClick={() => { setApplyProject(null); form.reset(); }}
                            className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-accent"
                        >
                            Cancel
                        </button>
                        <button
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
        { title: "Workspace", href: projectsIndex({}).url },
        { title: "Discover projects", href: projectsIndex({}).url },
    ],
};