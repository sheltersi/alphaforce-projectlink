import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    Check,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Inbox,
} from 'lucide-react';
import { toast } from 'sonner';

type NotificationItem = {
    id: string;
    title: string;
    message: string;
    body: string[];
    actionLabel: string | null;
    actionUrl: string | null;
    readAt: string | null;
    createdAt: string | null;
};

type Pagination = {
    currentPage: number;
    lastPage: number;
    previousPageUrl: string | null;
    nextPageUrl: string | null;
};

type Props = {
    notifications: NotificationItem[];
    unreadCount: number;
    pagination: Pagination;
};

function formattedDate(value: string | null): string {
    if (!value) return 'Recently';

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function NotificationsIndex({
    notifications,
    unreadCount,
    pagination,
}: Props) {
    function markRead(notification: NotificationItem) {
        router.post(
            `/notifications/${notification.id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Notification marked as read.'),
                onError: () =>
                    toast.error('Could not update this notification.'),
            },
        );
    }

    function markAllRead() {
        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('All notifications marked as read.'),
                onError: () =>
                    toast.error('Could not update your notifications.'),
            },
        );
    }

    return (
        <>
            <Head title="Notifications" />
            <main className="bg-background min-h-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sienna dark:text-sienna-300 text-sm font-bold">
                                Your activity
                            </p>
                            <h1 className="text-foreground mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Notifications
                            </h1>
                            <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                                Project updates and application activity will
                                appear here.
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="border-border bg-card text-foreground hover:bg-accent inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border px-4 text-sm font-bold transition sm:self-auto"
                            >
                                <CheckCheck className="size-4" />
                                Mark all as read
                            </button>
                        )}
                    </header>

                    <div className="border-border/70 bg-card mt-6 flex items-center justify-between rounded-xl border px-4 py-3">
                        <span className="text-foreground inline-flex items-center gap-2 text-sm font-semibold">
                            <Bell className="text-sienna size-4" />
                            {unreadCount === 0
                                ? 'You are all caught up'
                                : `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`}
                        </span>
                        {notifications.length > 0 && (
                            <span className="text-muted-foreground text-xs font-medium">
                                Page {pagination.currentPage} of{' '}
                                {pagination.lastPage}
                            </span>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <section className="border-border bg-card mt-5 rounded-2xl border border-dashed px-6 py-14 text-center">
                            <span className="bg-secondary text-secondary-foreground mx-auto flex size-14 items-center justify-center rounded-full">
                                <Inbox className="size-6" />
                            </span>
                            <h2 className="text-foreground mt-4 text-lg font-extrabold">
                                No notifications yet
                            </h2>
                            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
                                We’ll let you know when there is an update to
                                your applications or projects.
                            </p>
                            <Link
                                href="/projects"
                                className="bg-sienna hover:bg-sienna/90 mt-5 inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold text-white transition"
                            >
                                Browse projects
                            </Link>
                        </section>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {notifications.map((notification) => {
                                const unread = notification.readAt === null;

                                return (
                                    <article
                                        key={notification.id}
                                        className={`bg-card rounded-2xl border p-5 shadow-sm transition ${
                                            unread
                                                ? 'border-sienna/30 ring-sienna/10 ring-1'
                                                : 'border-border/70'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${
                                                    unread
                                                        ? 'bg-sienna/10 text-sienna'
                                                        : 'bg-secondary text-muted-foreground'
                                                }`}
                                            >
                                                {unread ? (
                                                    <Bell className="size-4" />
                                                ) : (
                                                    <CircleCheck className="size-4" />
                                                )}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-foreground text-sm font-extrabold">
                                                        {notification.title}
                                                    </h2>
                                                    {unread && (
                                                        <span className="bg-sienna/10 text-sienna rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                {notification.body.length >
                                                    0 && (
                                                    <ul className="text-foreground/80 mt-3 space-y-1.5 text-sm">
                                                        {notification.body.map(
                                                            (line, index) => (
                                                                <li
                                                                    key={`${notification.id}-${index}`}
                                                                >
                                                                    {line}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                )}
                                                <p className="text-muted-foreground mt-3 text-xs font-medium">
                                                    {formattedDate(
                                                        notification.createdAt,
                                                    )}
                                                </p>
                                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                                    {notification.actionUrl &&
                                                        notification.actionLabel && (
                                                            <a
                                                                href={
                                                                    notification.actionUrl
                                                                }
                                                                className="bg-sienna hover:bg-sienna/90 inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-bold text-white transition"
                                                            >
                                                                {
                                                                    notification.actionLabel
                                                                }
                                                                <ChevronRight className="size-3.5" />
                                                            </a>
                                                        )}
                                                    {unread && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                markRead(
                                                                    notification,
                                                                )
                                                            }
                                                            className="border-border text-foreground hover:bg-accent inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-xs font-bold transition"
                                                        >
                                                            <Check className="size-3.5" />
                                                            Mark as read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {(pagination.previousPageUrl || pagination.nextPageUrl) && (
                        <nav
                            aria-label="Notification pages"
                            className="mt-6 flex items-center justify-between"
                        >
                            {pagination.previousPageUrl ? (
                                <Link
                                    href={pagination.previousPageUrl}
                                    preserveScroll
                                    className="border-border bg-card text-foreground hover:bg-accent inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition"
                                >
                                    <ChevronLeft className="size-4" />
                                    Newer
                                </Link>
                            ) : (
                                <span />
                            )}
                            {pagination.nextPageUrl && (
                                <Link
                                    href={pagination.nextPageUrl}
                                    preserveScroll
                                    className="border-border bg-card text-foreground hover:bg-accent inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition"
                                >
                                    Older
                                    <ChevronRight className="size-4" />
                                </Link>
                            )}
                        </nav>
                    )}
                </div>
            </main>
        </>
    );
}
