import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    Compass,
    MapPin,
    Search,
    UsersRound,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as myProjectsIndex } from '@/routes/my-projects';
import {
    index as projectsIndex,
    show as projectsShow,
} from '@/routes/projects';

type MyProject = {
    id: number;
    title: string;
    organisation: string | null;
    location: string | null;
    project_status: string;
    membership_status: 'active' | 'completed' | 'withdrawn';
    role: string | null;
    team: string | null;
    start_date: string | null;
    end_date: string | null;
};

type MembershipFilter = 'all' | 'active' | 'completed' | 'withdrawn';

const filterOptions: { value: MembershipFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'withdrawn', label: 'Withdrawn' },
];

function statusBadge(status: MyProject['membership_status']) {
    switch (status) {
        case 'active':
            return 'bg-moss-100 text-moss-700 dark:bg-moss-800/40 dark:text-moss-300';
        case 'completed':
            return 'bg-harbor-100 text-harbor-700 dark:bg-harbor-800/40 dark:text-harbor-300';
        default:
            return 'bg-secondary text-secondary-foreground';
    }
}

function statusLabel(status: MyProject['membership_status']) {
    switch (status) {
        case 'active':
            return 'Active';
        case 'completed':
            return 'Completed';
        default:
            return 'Withdrawn';
    }
}

function ProjectRow({ project }: { project: MyProject }) {
    const meta = [
        project.organisation ?? 'Independent project',
        project.role,
        project.team,
    ]
        .filter(Boolean)
        .join(' · ');
    const dates =
        project.start_date || project.end_date
            ? [project.start_date, project.end_date].filter(Boolean).join(' — ')
            : null;

    return (
        <article className="group flex items-start justify-between gap-4 py-4 first:pt-1 last:pb-1">
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="bg-secondary text-sienna dark:text-sienna-300 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <BriefcaseBusiness className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                    <Link
                        href={projectsShow({ project: project.id }).url}
                        className="text-foreground hover:text-sienna dark:hover:text-sienna-300 block truncate text-sm font-bold hover:underline hover:underline-offset-4"
                    >
                        {project.title}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {meta}
                    </p>
                    <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium">
                        {project.location && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3" aria-hidden />
                                {project.location}
                            </span>
                        )}
                        {dates && (
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays className="size-3" aria-hidden />
                                {dates}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                    className={cn(
                        'rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase',
                        statusBadge(project.membership_status),
                    )}
                >
                    {statusLabel(project.membership_status)}
                </span>
                <Link
                    href={projectsShow({ project: project.id }).url}
                    className="text-sienna hover:bg-sienna-100 dark:text-sienna-300 dark:hover:bg-sienna-900/30 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
                >
                    View
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
        </article>
    );
}

export default function MyProjects() {
    const { myProjects } = usePage().props as unknown as {
        myProjects: { current: MyProject[]; past: MyProject[] };
    };

    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<MembershipFilter>('all');

    const all = useMemo(
        () => [...myProjects.current, ...myProjects.past],
        [myProjects],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return all.filter((project) => {
            const matchesStatus =
                filter === 'all' || project.membership_status === filter;
            if (!matchesStatus) return false;
            if (!q) return true;
            const haystack = [
                project.title,
                project.organisation,
                project.role,
                project.team,
                project.location,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [all, query, filter]);

    const currentFiltered = filtered.filter(
        (p) => p.membership_status === 'active',
    );
    // Past = everything not active, so Withdrawn stays visible alongside Completed.
    const pastFiltered = filtered.filter(
        (p) => p.membership_status !== 'active',
    );

    const hasQuery = query.trim().length > 0 || filter !== 'all';

    return (
        <>
            <Head title="My projects" />
            <main className="bg-background min-h-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header — single purpose, no discover controls mixed in */}
                    <div className="animate-fade-in-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sienna dark:text-sienna-300 text-sm font-bold">
                                Your work
                            </p>
                            <h1 className="text-foreground mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                My projects
                            </h1>
                            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
                                Projects you&apos;re assigned to, and the ones
                                you&apos;ve completed or stepped back from.
                            </p>
                        </div>
                        <Link
                            href={projectsIndex({}).url}
                            className="bg-harbor shadow-harbor/20 hover:bg-harbor-700 dark:bg-harbor-600 dark:hover:bg-harbor-500 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
                        >
                            <Compass className="size-4" />
                            Discover more
                        </Link>
                    </div>

                    {/* Stats */}
                    <div
                        className="animate-fade-in-up stagger-1 mt-6 grid grid-cols-3 gap-3"
                        role="group"
                        aria-label="Project counts"
                    >
                        {[
                            {
                                label: 'Active',
                                value: myProjects.current.length,
                            },
                            {
                                label: 'Past',
                                value: myProjects.past.length,
                            },
                            { label: 'Total', value: all.length },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="glass-card rounded-2xl px-3 py-4 text-center"
                            >
                                <p className="text-foreground text-2xl font-extrabold tabular-nums">
                                    {stat.value}
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-[10px] font-bold tracking-wider uppercase">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Toolbar: search + membership filter. Scoped to THIS page only. */}
                    <div className="animate-fade-in-up stagger-2 mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <label
                                htmlFor="my-projects-search"
                                className="sr-only"
                            >
                                Search my projects
                            </label>
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
                            <input
                                id="my-projects-search"
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search by title, organisation, role, location…"
                                className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-sienna/50 focus:ring-sienna/20 w-full rounded-xl border py-3 pr-10 pl-11 text-sm focus:ring-2 focus:outline-none"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    aria-label="Clear search"
                                    className="text-muted-foreground hover:bg-accent hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                        <div
                            role="group"
                            aria-label="Filter by membership status"
                            className="border-border bg-card flex items-center gap-1.5 rounded-xl border p-1.5"
                        >
                            {filterOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={filter === option.value}
                                    onClick={() => setFilter(option.value)}
                                    className={cn(
                                        'focus-visible:ring-sienna/40 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none',
                                        filter === option.value
                                            ? 'bg-harbor text-white shadow-sm'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p
                        className="text-muted-foreground mt-4 text-xs font-semibold"
                        role="status"
                    >
                        Showing {filtered.length} of {all.length} projects
                        {hasQuery && (
                            <>
                                {' · '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('');
                                        setFilter('all');
                                    }}
                                    className="text-sienna hover:text-sienna-600 dark:text-sienna-300 font-bold underline underline-offset-4"
                                >
                                    Clear filters
                                </button>
                            </>
                        )}
                    </p>

                    {/* Groups */}
                    {filtered.length > 0 ? (
                        <div className="mt-4 grid items-start gap-6 lg:grid-cols-2">
                            {(
                                [
                                    {
                                        title: 'Working now',
                                        description: 'Active assignments',
                                        icon: UsersRound,
                                        projects: currentFiltered,
                                        empty: hasQuery
                                            ? 'No active projects match your filters.'
                                            : 'No active project assignments.',
                                    },
                                    {
                                        title: 'Past projects',
                                        description: 'Completed or withdrawn',
                                        icon: BriefcaseBusiness,
                                        projects: pastFiltered,
                                        empty: hasQuery
                                            ? 'No past projects match your filters.'
                                            : 'Completed or withdrawn projects will appear here.',
                                    },
                                ] as const
                            ).map((group) => (
                                <section
                                    key={group.title}
                                    aria-label={group.title}
                                    className="glass-card animate-fade-in-up rounded-2xl p-5 sm:p-6"
                                >
                                    <div className="border-border flex items-center justify-between gap-3 border-b pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="bg-secondary text-sienna dark:text-sienna-300 flex size-9 items-center justify-center rounded-xl">
                                                <group.icon className="size-4.5" />
                                            </span>
                                            <div>
                                                <h2 className="text-foreground text-sm font-extrabold">
                                                    {group.title}
                                                </h2>
                                                <p className="text-muted-foreground text-[11px]">
                                                    {group.description}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-[11px] font-extrabold tabular-nums">
                                            {group.projects.length}
                                        </span>
                                    </div>
                                    {group.projects.length > 0 ? (
                                        <div className="divide-border divide-y">
                                            {group.projects.map((project) => (
                                                <ProjectRow
                                                    key={`${project.id}-${project.membership_status}`}
                                                    project={project}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground py-6 text-center text-sm">
                                            {group.empty}
                                        </p>
                                    )}
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card animate-fade-in-up mt-4 rounded-2xl p-10 text-center">
                            <div className="bg-secondary mx-auto flex size-12 items-center justify-center rounded-xl">
                                {hasQuery ? (
                                    <Search className="text-sienna dark:text-sienna-300 size-5" />
                                ) : (
                                    <BriefcaseBusiness className="text-sienna dark:text-sienna-300 size-5" />
                                )}
                            </div>
                            <h2 className="text-foreground mt-4 text-lg font-extrabold">
                                {hasQuery
                                    ? 'No projects match your filters'
                                    : 'No projects yet'}
                            </h2>
                            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                                {hasQuery
                                    ? 'Try a different search term or clearing the status filter.'
                                    : 'Once you join a project, it will show up here.'}
                            </p>
                            <div className="mt-5 flex items-center justify-center gap-2">
                                {hasQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery('');
                                            setFilter('all');
                                        }}
                                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors"
                                    >
                                        <X className="size-3.5" />
                                        Clear filters
                                    </button>
                                )}
                                <Link
                                    href={projectsIndex({}).url}
                                    className="bg-harbor hover:bg-harbor-700 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white"
                                >
                                    <Compass className="size-3.5" />
                                    Discover projects
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

MyProjects.layout = {
    breadcrumbs: [
        { title: 'Workspace', href: dashboard().url },
        { title: 'My projects', href: myProjectsIndex({}).url },
    ],
};
