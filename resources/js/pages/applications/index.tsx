import {
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    FileText,
    MapPin,
} from 'lucide-react';

import { Head, Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

type ApplicationItem = {
    id: number;
    project_id: number | null;
    title: string | null;
    slug: string | null;
    status: string;
    submitted_at: string | null;
    organisation: string | null;
    location: string | null;
    description: string | null;
    skills: string[];
    cover_letter: string | null;
    project_url: string | null;
};

function applicationStatusClasses(status: string): string {
    switch (status) {
        case 'submitted':
            return 'bg-harbor-100 text-harbor-700 dark:bg-harbor-800/40 dark:text-harbor-300';
        case 'under_review':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300';
        case 'shortlisted':
            return 'bg-moss-100 text-moss-700 dark:bg-moss-800/40 dark:text-moss-300';
        case 'accepted':
            return 'bg-moss-100 text-moss-700 dark:bg-moss-800/40 dark:text-moss-300';
        case 'rejected':
            return 'bg-clay-100 text-clay-700 dark:bg-clay-700/40 dark:text-clay-300';
        case 'withdrawn':
            return 'bg-muted text-muted-foreground';
        default:
            return 'bg-secondary text-secondary-foreground';
    }
}

function applicationStatusLabel(status: string): string {
    switch (status) {
        case 'submitted':
            return 'Applied';
        case 'under_review':
            return 'Under review';
        case 'shortlisted':
            return 'Shortlisted';
        case 'accepted':
            return 'Accepted';
        case 'rejected':
            return 'Rejected';
        case 'withdrawn':
            return 'Withdrawn';
        default:
            return status.replace(/_/g, ' ');
    }
}

// This page renders the authenticated user's application history from the Inertia payload.
// Each card displays the project summary, review status, and the submitted cover letter.
export default function ApplicationsIndex() {
    const { applications } = usePage().props as unknown as {
        applications: ApplicationItem[];
    };

    return (
        <>
            <Head title="My applications" />

            <main className="bg-background min-h-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="animate-fade-in-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sienna dark:text-sienna-300 text-sm font-bold">
                                Your activity
                            </p>
                            <h1 className="text-foreground mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                My applications
                            </h1>
                            <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                                Track every opportunity you have applied to, and
                                keep an eye on review updates.
                            </p>
                        </div>
                        <Link
                            href="/projects"
                            className="border-border bg-card text-foreground hover:bg-accent inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition-colors"
                        >
                            Discover more
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>

                    {applications.length === 0 ? (
                        <div className="glass-card animate-fade-in-up mt-8 rounded-2xl p-8 text-center">
                            <div className="bg-secondary text-secondary-foreground mx-auto flex size-14 items-center justify-center rounded-full">
                                <FileText className="size-6" />
                            </div>
                            <h2 className="text-foreground mt-4 text-xl font-extrabold">
                                No applications yet
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Start exploring aligned projects and apply to
                                the ones that match your skills and goals.
                            </p>
                            <Link
                                href="/projects"
                                className="bg-sienna hover:bg-sienna/90 mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors"
                            >
                                Browse projects
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-8 space-y-4">
                            {applications.map((application) => (
                                <article
                                    key={application.id}
                                    className="glass-card premium-shadow-hover animate-fade-in-up rounded-2xl p-5"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="from-sienna-500 to-sienna-700 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                                                <BriefcaseBusiness className="size-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-foreground text-xl font-extrabold">
                                                        {application.title ??
                                                            'Untitled project'}
                                                    </h2>
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] uppercase ${applicationStatusClasses(application.status)}`}
                                                    >
                                                        {applicationStatusLabel(
                                                            application.status,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-4 text-sm">
                                                    {application.organisation ? (
                                                        <span className="text-foreground/80 font-medium">
                                                            {
                                                                application.organisation
                                                            }
                                                        </span>
                                                    ) : null}
                                                    {application.location ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <MapPin className="size-3.5" />
                                                            {
                                                                application.location
                                                            }
                                                        </span>
                                                    ) : null}
                                                    {application.submitted_at ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <CalendarDays className="size-3.5" />
                                                            Applied{' '}
                                                            {
                                                                application.submitted_at
                                                            }
                                                        </span>
                                                    ) : null}
                                                </div>
                                                {application.description ? (
                                                    <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
                                                        {
                                                            application.description
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        {application.project_url ? (
                                            <Link
                                                href={application.project_url}
                                                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors"
                                            >
                                                View project
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        ) : null}
                                    </div>

                                    {application.skills.length > 0 ? (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {application.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-[11px] font-bold"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}

                                    {application.cover_letter ? (
                                        <div className="border-border bg-card/50 mt-4 rounded-xl border p-3">
                                            <p className="text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase">
                                                Your cover letter
                                            </p>
                                            <p className="text-foreground/80 mt-2 text-sm leading-6">
                                                {application.cover_letter}
                                            </p>
                                        </div>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
