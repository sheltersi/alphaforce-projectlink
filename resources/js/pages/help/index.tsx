import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    BriefcaseBusiness,
    Check,
    ChevronDown,
    Clock3,
    FileText,
    FolderOpen,
    LifeBuoy,
    Search,
    UserRound,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type HelpCategory = 'account' | 'applications' | 'timesheets' | 'documents';

type HelpArticle = {
    category: HelpCategory;
    question: string;
    answer: string;
    link?: { label: string; href: string };
};

const categories: {
    id: HelpCategory;
    title: string;
    description: string;
    icon: typeof UserRound;
    color: string;
}[] = [
    {
        id: 'account',
        title: 'Account & profile',
        description: 'Your profile, sign-in, and settings',
        icon: UserRound,
        color: 'bg-harbor-100 text-harbor-700 dark:bg-harbor-700/40 dark:text-harbor-200',
    },
    {
        id: 'applications',
        title: 'Projects & applications',
        description: 'Finding opportunities and tracking progress',
        icon: BriefcaseBusiness,
        color: 'bg-sienna-100 text-sienna-700 dark:bg-sienna-700/30 dark:text-sienna-200',
    },
    {
        id: 'timesheets',
        title: 'Timesheets',
        description: 'Logging and submitting your hours',
        icon: Clock3,
        color: 'bg-moss-100 text-moss-700 dark:bg-moss-700/30 dark:text-moss-200',
    },
    {
        id: 'documents',
        title: 'Documents & resume',
        description: 'Managing your uploads and resume',
        icon: FolderOpen,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-200',
    },
];

const articles: HelpArticle[] = [
    {
        category: 'account',
        question: 'How do I update my profile?',
        answer: 'Open My profile from the sidebar to review and edit your details. Keeping your experience, availability, and skills current helps project teams understand what you can bring to an opportunity.',
        link: { label: 'Go to my profile', href: '/onboarding/build-profile' },
    },
    {
        category: 'account',
        question: 'I can’t sign in. What should I do?',
        answer: 'Use the Forgot password link on the sign-in page to request a reset link. If you are already signed in and need to change your password, visit Security in Settings.',
        link: { label: 'Account security', href: '/settings/security' },
    },
    {
        category: 'applications',
        question: 'Where can I find projects to apply for?',
        answer: 'Visit Discover projects to browse current opportunities. Open a project to read its requirements and submit your application when you are ready.',
        link: { label: 'Discover projects', href: '/projects' },
    },
    {
        category: 'applications',
        question: 'How can I check the status of an application?',
        answer: 'Open My applications to see your submitted applications and their latest review status. You can also check Notifications for updates from project teams.',
        link: { label: 'View my applications', href: '/applications' },
    },
    {
        category: 'applications',
        question: 'How will I know when a project team responds?',
        answer: 'Updates appear in your Notifications inbox. The unread count in the app navigation helps you spot new activity, and notification links take you directly to the relevant page.',
        link: { label: 'Open notifications', href: '/notifications' },
    },
    {
        category: 'timesheets',
        question: 'How do I log and submit my hours?',
        answer: 'Open Timesheets, choose the week you want to update, and add an entry for each work session. Review the week before submitting it for approval.',
        link: { label: 'Open timesheets', href: '/timesheets' },
    },
    {
        category: 'timesheets',
        question: 'Can I edit a timesheet after submitting it?',
        answer: 'Submitted entries may be locked while they are being reviewed. If an entry is returned or rejected, update it from Timesheets and submit the corrected week again.',
        link: { label: 'Review timesheets', href: '/timesheets' },
    },
    {
        category: 'documents',
        question: 'Where can I view or replace my documents?',
        answer: 'Your Documents page lists files already uploaded to your profile. From there, you can download, rename, or replace an upload. Use Manage uploads to add documents through your profile.',
        link: { label: 'View my documents', href: '/documents' },
    },
    {
        category: 'documents',
        question: 'How do I share my digital resume?',
        answer: 'Open Digital resume and use the sharing controls to create a private link. You can copy the link to share it, and revoke it later from the same page.',
        link: { label: 'Open digital resume', href: '/dashboard/resume' },
    },
];

const quickSearches = [
    'Update my profile',
    'Application status',
    'Submit timesheet',
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] =
        useState<HelpCategory | null>(null);

    const filteredArticles = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);

        return articles.filter((article) => {
            const matchesCategory =
                selectedCategory === null ||
                article.category === selectedCategory;
            const searchableText =
                `${article.question} ${article.answer} ${article.category}`.toLowerCase();
            const matchesSearch = searchTerms.every((term) =>
                searchableText.includes(term),
            );

            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    function chooseCategory(category: HelpCategory) {
        setSelectedCategory((current) =>
            current === category ? null : category,
        );
        document
            .getElementById('help-answers')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function resetFilters() {
        setSearchQuery('');
        setSelectedCategory(null);
    }

    return (
        <>
            <Head title="Help center" />

            <main className="bg-background min-h-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <section className="from-harbor-900 via-harbor-800 to-harbor-600 shadow-harbor-900/10 relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br px-6 py-8 text-white shadow-xl sm:px-10 sm:py-11 lg:px-12">
                        <div className="bg-sienna-500/25 pointer-events-none absolute -top-28 -right-16 -z-10 size-80 rounded-full blur-3xl" />
                        <div className="bg-harbor-300/20 pointer-events-none absolute -bottom-36 left-1/3 -z-10 size-80 rounded-full blur-3xl" />

                        <div className="relative grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-end">
                            <div className="max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-white/90">
                                    <LifeBuoy className="size-3.5" />
                                    PROJECTLINK SUPPORT
                                </span>
                                <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                                    How can we help?
                                </h1>
                                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                                    Find clear answers and helpful shortcuts to
                                    make the most of your ProjectLink workspace.
                                </p>

                                <form
                                    className="mt-7 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/60 bg-white p-2 shadow-lg shadow-black/10 focus-within:ring-4 focus-within:ring-white/20"
                                    role="search"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        document
                                            .getElementById('help-answers')
                                            ?.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start',
                                            });
                                    }}
                                >
                                    <Search className="text-harbor-500 ml-2 size-5 shrink-0" />
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(event) =>
                                            setSearchQuery(event.target.value)
                                        }
                                        placeholder="Search for an answer..."
                                        aria-label="Search help articles"
                                        className="text-harbor-900 placeholder:text-harbor-400 h-11 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            aria-label="Clear search"
                                            className="text-harbor-500 hover:bg-sand-100 hover:text-harbor-900 flex size-9 shrink-0 items-center justify-center rounded-xl transition"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="bg-sienna hover:bg-sienna-600 inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        Search
                                        <ArrowRight className="hidden size-4 sm:block" />
                                    </button>
                                </form>

                                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/65">
                                    <span className="mr-1 font-semibold text-white/80">
                                        Popular:
                                    </span>
                                    {quickSearches.map((search) => (
                                        <button
                                            key={search}
                                            type="button"
                                            onClick={() =>
                                                setSearchQuery(search)
                                            }
                                            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                                        >
                                            {search}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="hidden rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm lg:block">
                                <div className="text-sienna-200 flex size-11 items-center justify-center rounded-xl bg-white/10">
                                    <BookOpen className="size-5" />
                                </div>
                                <h2 className="mt-4 text-sm font-extrabold">
                                    A little guidance goes a long way
                                </h2>
                                <p className="mt-2 text-xs leading-relaxed text-white/65">
                                    Browse popular topics or search the help
                                    library to get back to what matters.
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/85">
                                    <Check className="text-moss-200 size-3.5" />
                                    Answers tailored to your workspace
                                </div>
                            </div>
                        </div>
                    </section>

                    <section aria-labelledby="topics-heading">
                        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-sienna dark:text-sienna-300 text-sm font-bold">
                                    Browse by topic
                                </p>
                                <h2
                                    id="topics-heading"
                                    className="text-foreground mt-1 text-xl font-extrabold tracking-tight sm:text-2xl"
                                >
                                    What do you need help with?
                                </h2>
                            </div>
                            {selectedCategory && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory(null)}
                                    className="text-sienna hover:text-sienna-700 inline-flex items-center gap-1.5 self-start text-xs font-bold transition sm:self-auto"
                                >
                                    Show all topics
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {categories.map((category) => {
                                const Icon = category.icon;
                                const active = selectedCategory === category.id;
                                const articleCount = articles.filter(
                                    (article) =>
                                        article.category === category.id,
                                ).length;

                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() =>
                                            chooseCategory(category.id)
                                        }
                                        className={`group bg-card rounded-2xl border p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                            active
                                                ? 'border-sienna/50 ring-sienna/15 ring-2'
                                                : 'border-border/70 hover:border-sienna/30'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span
                                                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${category.color}`}
                                            >
                                                <Icon className="size-5" />
                                            </span>
                                            <ArrowUpRight className="text-muted-foreground group-hover:text-sienna size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </div>
                                        <h3 className="text-foreground mt-4 text-sm font-extrabold">
                                            {category.title}
                                        </h3>
                                        <p className="text-muted-foreground mt-1 min-h-10 text-xs leading-relaxed">
                                            {category.description}
                                        </p>
                                        <p className="text-sienna mt-3 text-[11px] font-bold">
                                            {articleCount}{' '}
                                            {articleCount === 1
                                                ? 'answer'
                                                : 'answers'}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section
                        id="help-answers"
                        aria-labelledby="answers-heading"
                        className="scroll-mt-8"
                    >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-sienna dark:text-sienna-300 text-sm font-bold">
                                    Help library
                                </p>
                                <h2
                                    id="answers-heading"
                                    className="text-foreground mt-1 text-xl font-extrabold tracking-tight sm:text-2xl"
                                >
                                    {searchQuery || selectedCategory
                                        ? 'Helpful answers'
                                        : 'Frequently asked questions'}
                                </h2>
                            </div>
                            <span className="text-muted-foreground text-xs font-semibold">
                                {filteredArticles.length}{' '}
                                {filteredArticles.length === 1
                                    ? 'article'
                                    : 'articles'}
                            </span>
                        </div>

                        {filteredArticles.length > 0 ? (
                            <div className="mt-4 space-y-3">
                                {filteredArticles.map((article) => {
                                    const category = categories.find(
                                        (item) => item.id === article.category,
                                    );

                                    return (
                                        <details
                                            key={article.question}
                                            className="group border-border/70 bg-card open:border-sienna/25 rounded-2xl border shadow-sm transition open:shadow-md"
                                        >
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-4 py-4 marker:hidden sm:px-5 [&::-webkit-details-marker]:hidden">
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <span className="bg-secondary text-secondary-foreground hidden size-8 shrink-0 items-center justify-center rounded-lg sm:flex">
                                                        <FileText className="size-4" />
                                                    </span>
                                                    <span>
                                                        <span className="text-foreground block text-sm font-bold">
                                                            {article.question}
                                                        </span>
                                                        <span className="text-muted-foreground mt-1 block text-[11px] font-semibold">
                                                            {category?.title}
                                                        </span>
                                                    </span>
                                                </span>
                                                <span className="bg-secondary text-muted-foreground group-open:bg-sienna/10 group-open:text-sienna flex size-8 shrink-0 items-center justify-center rounded-full transition group-open:rotate-180">
                                                    <ChevronDown className="size-4" />
                                                </span>
                                            </summary>
                                            <div className="border-border/60 border-t px-4 pt-4 pb-5 sm:pr-6 sm:pl-16">
                                                <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                                                    {article.answer}
                                                </p>
                                                {article.link && (
                                                    <Link
                                                        href={article.link.href}
                                                        className="text-sienna hover:text-sienna-700 mt-4 inline-flex items-center gap-2 text-xs font-extrabold transition"
                                                    >
                                                        {article.link.label}
                                                        <ArrowRight className="size-3.5" />
                                                    </Link>
                                                )}
                                            </div>
                                        </details>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="border-border bg-card mt-4 rounded-2xl border border-dashed px-6 py-12 text-center">
                                <span className="bg-secondary text-secondary-foreground mx-auto flex size-12 items-center justify-center rounded-full">
                                    <Search className="size-5" />
                                </span>
                                <h3 className="text-foreground mt-4 text-base font-extrabold">
                                    No answers found
                                </h3>
                                <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
                                    Try a different search or browse all help
                                    topics to find what you need.
                                </p>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="bg-sienna hover:bg-sienna/90 mt-5 inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold text-white transition"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="border-sand-200 from-sand-50 via-card to-sienna-100/50 dark:border-border dark:from-card dark:via-card dark:to-sienna-800/10 relative overflow-hidden rounded-2xl border bg-gradient-to-r p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-7">
                        <div className="flex items-start gap-4">
                            <span className="bg-sienna shadow-sienna/20 flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md">
                                <LifeBuoy className="size-5" />
                            </span>
                            <div>
                                <p className="text-sienna text-xs font-bold tracking-[0.12em] uppercase">
                                    Keep moving forward
                                </p>
                                <h2 className="text-foreground mt-1 text-lg font-extrabold">
                                    Ready for your next opportunity?
                                </h2>
                                <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
                                    Explore projects that match your interests
                                    and put your skills to work.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/projects"
                            className="bg-harbor hover:bg-harbor-700 mt-5 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-sm transition sm:mt-0"
                        >
                            Explore projects
                            <ArrowRight className="size-4" />
                        </Link>
                    </section>
                </div>
            </main>
        </>
    );
}

HelpCenter.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Help center', href: '/help' },
    ],
};
