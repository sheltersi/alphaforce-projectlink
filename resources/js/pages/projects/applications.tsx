import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    FileText,
    Inbox,
} from 'lucide-react';

type ProjectSummary = {
    id: number;
    title: string;
    organisation: string | null;
};

type ProjectApplication = {
    id: number;
    applicant_name: string;
    status: string;
    submitted_at: string | null;
    cover_letter: string | null;
    url: string;
};

function statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
}

function statusClasses(status: string): string {
    switch (status) {
        case 'accepted':
            return 'bg-moss-100 text-moss-700 dark:bg-moss-800/40 dark:text-moss-300';
        case 'rejected':
            return 'bg-clay-100 text-clay-700 dark:bg-clay-700/40 dark:text-clay-300';
        case 'shortlisted':
            return 'bg-sienna-100 text-sienna-700 dark:bg-sienna-800/40 dark:text-sienna-300';
        case 'under_review':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300';
        default:
            return 'bg-harbor-100 text-harbor-700 dark:bg-harbor-800/40 dark:text-harbor-300';
    }
}

export default function ProjectApplications() {
    const { project, applications } = usePageProps();

    return (
        <>
            <Head title={`Applications · ${project.title}`} />
            <main className="bg-background min-h-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href={`/projects/${project.id}`}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-bold transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Back to project
                    </Link>

                    <header className="animate-fade-in-up mt-5">
                        <p className="text-sienna dark:text-sienna-300 text-sm font-bold">
                            {project.organisation ?? 'Project review'}
                        </p>
                        <h1 className="text-foreground mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Applications
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {project.title} · {applications.length}{' '}
                            {applications.length === 1
                                ? 'application'
                                : 'applications'}
                        </p>
                    </header>

                    {applications.length === 0 ? (
                        <section className="glass-card animate-fade-in-up mt-8 rounded-2xl p-8 text-center">
                            <div className="bg-secondary text-secondary-foreground mx-auto flex size-14 items-center justify-center rounded-full">
                                <Inbox className="size-6" />
                            </div>
                            <h2 className="text-foreground mt-4 text-xl font-extrabold">
                                No applications yet
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Applications for this project will appear here.
                            </p>
                        </section>
                    ) : (
                        <div className="mt-6 space-y-3">
                            {applications.map((application) => (
                                <article
                                    key={application.id}
                                    className="glass-card premium-shadow-hover animate-fade-in-up rounded-2xl p-5 transition-shadow"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-foreground text-lg font-extrabold">
                                                    {application.applicant_name}
                                                </h2>
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] uppercase ${statusClasses(application.status)}`}
                                                >
                                                    {statusLabel(
                                                        application.status,
                                                    )}
                                                </span>
                                            </div>
                                            {application.submitted_at ? (
                                                <p className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-xs font-medium">
                                                    <CalendarDays className="size-3.5" />
                                                    Applied{' '}
                                                    {application.submitted_at}
                                                </p>
                                            ) : null}
                                            {application.cover_letter ? (
                                                <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed">
                                                    {application.cover_letter}
                                                </p>
                                            ) : null}
                                        </div>
                                        <Link
                                            href={application.url}
                                            className="bg-sienna hover:bg-sienna-700 focus-visible:ring-sienna/40 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                        >
                                            <FileText className="size-4" />
                                            Review application
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

function usePageProps(): {
    project: ProjectSummary;
    applications: ProjectApplication[];
} {
    return usePage().props as unknown as {
        project: ProjectSummary;
        applications: ProjectApplication[];
    };
}
