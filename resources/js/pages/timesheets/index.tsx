import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    dateFnsLocalizer,
    type Event as RBCEvent,
    type SlotInfo,
} from 'react-big-calendar';
import withDragAndDropModule from 'react-big-calendar/lib/addons/dragAndDrop';
import {
    addDays,
    format,
    getDay,
    parse,
    startOfWeek as dfStartOfWeek,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
    AlertTriangle,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Pencil,
    Plus,
    Send,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as timesheetsIndex, submit as timesheetsSubmit } from '@/routes/timesheets';
import {
    destroy as entriesDestroy,
    store as entriesStore,
    update as entriesUpdate,
} from '@/routes/timesheets/entries';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date: Date) => dfStartOfWeek(date, { weekStartsOn: 1 }),
    getDay,
    locales,
});

// The DnD addon ships as CJS only. Production Rollup unwraps its
// `__esModule` marker, but Vite dev pre-bundling hands us the raw exports
// object instead of the function — normalize both shapes at runtime.
const withDragAndDrop: typeof withDragAndDropModule =
    typeof withDragAndDropModule === 'function'
        ? withDragAndDropModule
        : (withDragAndDropModule as unknown as { default: typeof withDragAndDropModule })
            .default;

const DnDCalendar = withDragAndDrop<CalEvent, CalendarEntry>(Calendar);

type EntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

type CalendarEntry = {
    id: number;
    work_date: string;
    start_time: string | null;
    end_time: string | null;
    minutes: number | null;
    description: string | null;
    status: EntryStatus;
    review_comment: string | null;
    reviewed_by: string | null;
    project: { id: number; title: string };
    assignment: { id: number; role: string | null; team: string | null };
};

type Assignment = {
    id: number;
    role: string | null;
    team: string | null;
    project: { id: number; title: string };
};

type WeekInfo = {
    start: string;
    end: string;
    prev: string;
    next: string;
    is_current: boolean;
};

type Summary = {
    by_day: Record<string, number>;
    week_minutes: number;
    timeless_count: number;
    draft_count: number;
};

type CalEvent = Omit<RBCEvent, 'resource'> & { resource: CalendarEntry };

const statusMeta: Record<EntryStatus, { label: string; className: string }> = {
    draft: {
        label: 'Draft',
        className: 'ts-event-draft',
    },
    submitted: {
        label: 'Submitted',
        className: 'ts-event-submitted',
    },
    approved: {
        label: 'Approved',
        className: 'ts-event-approved',
    },
    rejected: {
        label: 'Needs correction',
        className: 'ts-event-rejected',
    },
};

function formatMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function toDate(day: string, time: string): Date {
    const [y, mo, d] = day.split('-').map(Number);
    const [h, mi] = time.split(':').map(Number);
    return new Date(y, mo - 1, d, h, mi);
}

function toDateString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

function toTimeString(date: Date): string {
    return format(date, 'HH:mm');
}

function isEditable(entry: CalendarEntry): boolean {
    return entry.status === 'draft' || entry.status === 'rejected';
}

function durationPreview(start: string, end: string): string | null {
    if (!start || !end || end <= start) return null;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return formatMinutes(eh * 60 + em - (sh * 60 + sm));
}

function CalEventBlock({ event }: { event: CalEvent }) {
    const entry = event.resource;
    return (
        <div className="ts-event-inner">
            <p className="ts-event-time">
                {entry.start_time}–{entry.end_time}
            </p>
            <p className="ts-event-title">{entry.project.title}</p>
            {entry.description && (
                <p className="ts-event-desc">{entry.description}</p>
            )}
        </div>
    );
}

type ModalState =
    | { mode: 'create'; date: string; start: string; end: string }
    | { mode: 'edit'; entry: CalendarEntry }
    | { mode: 'view'; entry: CalendarEntry }
    | null;

function EntryForm({
    assignments,
    initial,
    entryId,
    submitLabel,
    onSuccess,
    onDelete,
    canDelete,
}: {
    assignments: Assignment[];
    initial: {
        projectId: string;
        assignmentId: string;
        workDate: string;
        startTime: string;
        endTime: string;
        description: string;
    };
    entryId?: number;
    submitLabel: string;
    onSuccess: () => void;
    onDelete?: () => void;
    canDelete?: boolean;
}) {
    const form = useForm({
        project_id: initial.projectId,
        project_participant_id: initial.assignmentId,
        work_date: initial.workDate,
        start_time: initial.startTime,
        end_time: initial.endTime,
        description: initial.description,
    });
    const [confirmDelete, setConfirmDelete] = useState(false);

    const projects = useMemo(() => {
        const seen = new Map<number, string>();
        for (const a of assignments) seen.set(a.project.id, a.project.title);
        return [...seen.entries()].map(([id, title]) => ({ id: String(id), title }));
    }, [assignments]);

    const projectAssignments = useMemo(
        () =>
            assignments.filter(
                (a) => String(a.project.id) === String(form.data.project_id),
            ),
        [assignments, form.data.project_id],
    );

    function pickProject(projectId: string) {
        form.setData('project_id', projectId);
        const options = assignments.filter(
            (a) => String(a.project.id) === projectId,
        );
        // One assignment per project in practice — preselect it.
        form.setData(
            'project_participant_id',
            options.length === 1 ? String(options[0].id) : '',
        );
        form.clearErrors('project_participant_id');
    }

    function submit() {
        if (entryId === undefined) {
            form.post(entriesStore().url, {
                preserveScroll: true,
                onSuccess,
            });
        } else {
            form.patch(entriesUpdate({ entry: entryId }).url, {
                preserveScroll: true,
                onSuccess,
            });
        }
    }

    const preview = durationPreview(form.data.start_time, form.data.end_time);
    const inputClass =
        'w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:border-sienna focus-visible:ring-2 focus-visible:ring-sienna/40';

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <label htmlFor="ts-project" className="text-xs font-bold text-muted-foreground">
                        Project
                    </label>
                    <select
                        id="ts-project"
                        value={form.data.project_id}
                        onChange={(e) => pickProject(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select a project…</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <label htmlFor="ts-assignment" className="text-xs font-bold text-muted-foreground">
                        Assignment
                    </label>
                    <select
                        id="ts-assignment"
                        value={form.data.project_participant_id}
                        onChange={(e) => form.setData('project_participant_id', e.target.value)}
                        className={inputClass}
                        disabled={!form.data.project_id}
                    >
                        <option value="">
                            {form.data.project_id ? 'Select an assignment…' : 'Pick a project first'}
                        </option>
                        {projectAssignments.map((a) => (
                            <option key={a.id} value={String(a.id)}>
                                {[a.role ?? 'Participant', a.team].filter(Boolean).join(' · ')}
                            </option>
                        ))}
                    </select>
                    {form.errors.project_participant_id && (
                        <p className="text-xs font-semibold text-sienna">
                            {form.errors.project_participant_id}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                    <label htmlFor="ts-date" className="text-xs font-bold text-muted-foreground">
                        Date
                    </label>
                    <input
                        id="ts-date"
                        type="date"
                        value={form.data.work_date}
                        onChange={(e) => form.setData('work_date', e.target.value)}
                        className={inputClass}
                    />
                    {form.errors.work_date && (
                        <p className="text-xs font-semibold text-sienna">{form.errors.work_date}</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <label htmlFor="ts-start" className="text-xs font-bold text-muted-foreground">
                        Start time
                    </label>
                    <input
                        id="ts-start"
                        type="time"
                        value={form.data.start_time}
                        onChange={(e) => form.setData('start_time', e.target.value)}
                        className={inputClass}
                    />
                    {form.errors.start_time && (
                        <p className="text-xs font-semibold text-sienna">{form.errors.start_time}</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <label htmlFor="ts-end" className="text-xs font-bold text-muted-foreground">
                        End time
                    </label>
                    <input
                        id="ts-end"
                        type="time"
                        value={form.data.end_time}
                        onChange={(e) => form.setData('end_time', e.target.value)}
                        className={inputClass}
                    />
                    {form.errors.end_time && (
                        <p className="text-xs font-semibold text-sienna">{form.errors.end_time}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="ts-desc" className="text-xs font-bold text-muted-foreground">
                        What did you work on?
                    </label>
                    {preview && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2.5 py-0.5 text-[11px] font-extrabold text-moss-700 dark:bg-moss-800/40 dark:text-moss-300">
                            <Clock3 className="size-3" />
                            {preview}
                        </span>
                    )}
                </div>
                <textarea
                    id="ts-desc"
                    rows={3}
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                    placeholder="Summarise the work completed…"
                    className="min-h-20 w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-sienna focus-visible:ring-2 focus-visible:ring-sienna/40"
                />
                {form.errors.description && (
                    <p className="text-xs font-semibold text-sienna">{form.errors.description}</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                    Duration is calculated from start and end time — no manual hours.
                </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <button
                    type="button"
                    onClick={submit}
                    disabled={form.processing}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-harbor px-4 text-sm font-bold text-white shadow-lg shadow-harbor/20 transition-all hover:-translate-y-0.5 hover:bg-harbor-700 disabled:opacity-50 dark:bg-harbor-600 dark:hover:bg-harbor-500"
                >
                    {form.processing ? 'Saving…' : submitLabel}
                </button>
                {canDelete &&
                    (confirmDelete ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-xs font-bold text-foreground hover:bg-accent"
                            >
                                Keep
                            </button>
                            <button
                                type="button"
                                onClick={onDelete}
                                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-sienna px-4 text-xs font-bold text-white hover:bg-sienna-600"
                            >
                                <Trash2 className="size-3.5" />
                                Confirm
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            aria-label="Delete entry"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-sienna/40 hover:text-sienna"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    ))}
            </div>
        </div>
    );
}

export default function Timesheets() {
    const { week, entries, assignments, summary } = usePage().props as unknown as {
        week: WeekInfo;
        entries: CalendarEntry[];
        assignments: Assignment[];
        summary: Summary;
    };

    const [modal, setModal] = useState<ModalState>(null);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [dragError, setDragError] = useState<string | null>(null);
    const submitting = useForm({ week_start: week.start }).processing;

    const weekStart = useMemo(
        () => toDate(week.start, '00:00'),
        [week.start],
    );

    const events: CalEvent[] = useMemo(
        () =>
            entries
                .filter((e) => e.start_time && e.end_time)
                .map((e) => ({
                    id: e.id,
                    title: `${e.project.title} · ${e.description ?? ''}`,
                    start: toDate(e.work_date, e.start_time as string),
                    end: toDate(e.work_date, e.end_time as string),
                    resource: e,
                })),
        [entries],
    );

    const timeless = useMemo(
        () => entries.filter((e) => e.minutes === null),
        [entries],
    );

    const weekLabel = useMemo(() => {
        const fmtDay = (d: string) =>
            format(toDate(d, '00:00'), 'd MMM');
        return `${fmtDay(week.start)} – ${format(toDate(week.end, '00:00'), 'd MMM yyyy')}`;
    }, [week.start, week.end]);

    function visitWeek(day: string) {
        router.visit(`${timesheetsIndex({}).url}?week=${day}`, {
            preserveScroll: true,
        });
    }

    function openCreate(slot: SlotInfo) {
        const start = slot.start as Date;
        const end = slot.end as Date;
        setDragError(null);
        setModal({
            mode: 'create',
            date: toDateString(start),
            start: toTimeString(start),
            end: toTimeString(end),
        });
    }

    function openEntry(entry: CalendarEntry) {
        setDragError(null);
        setModal(isEditable(entry) ? { mode: 'edit', entry } : { mode: 'view', entry });
    }

    function persistMove(entry: CalendarEntry, start: Date, end: Date) {
        if (!isEditable(entry)) return;
        const workDate = toDateString(start);
        const startTime = toTimeString(start);
        const endTime = toTimeString(end);
        if (
            workDate === entry.work_date &&
            startTime === entry.start_time &&
            endTime === entry.end_time
        ) {
            return;
        }
        router.patch(
            entriesUpdate({ entry: entry.id }).url,
            { work_date: workDate, start_time: startTime, end_time: endTime },
            {
                preserveScroll: true,
                onError: () =>
                    setDragError(
                        'That move was rejected (overlap or invalid range) — the entry snapped back.',
                    ),
            },
        );
    }

    function deleteEntry(id: number) {
        router.delete(entriesDestroy({ entry: id }).url, {
            preserveScroll: true,
            onSuccess: () => setModal(null),
        });
    }

    function submitWeek() {
        router.post(
            timesheetsSubmit().url,
            { week_start: week.start },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmSubmit(false),
            },
        );
    }

    const modalEntry = modal && 'entry' in modal ? modal.entry : null;

    return (
        <>
            <Head title="Timesheets" />
            <main className="min-h-full bg-background px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end animate-fade-in-up">
                        <div>
                            <p className="text-sm font-bold text-sienna dark:text-sienna-300">
                                Log your work
                            </p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                Timesheets
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                Click any time slot to log work. Duration is
                                calculated for you — just pick the
                                assignment and describe what you did.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">
                                <Clock3 className="size-3.5 text-sienna dark:text-sienna-300" />
                                {formatMinutes(summary.week_minutes)} this week
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setModal({
                                        mode: 'create',
                                        date: week.is_current
                                            ? toDateString(new Date())
                                            : week.start,
                                        start: '09:00',
                                        end: '10:00',
                                    })
                                }
                                disabled={assignments.length === 0}
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-harbor px-4 text-xs font-bold text-white shadow-lg shadow-harbor/20 transition-all hover:-translate-y-0.5 hover:bg-harbor-700 disabled:opacity-50 dark:bg-harbor-600 dark:hover:bg-harbor-500"
                            >
                                <Plus className="size-4" />
                                Add entry
                            </button>
                        </div>
                    </div>

                    {dragError && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-sienna/30 bg-sienna-100 px-4 py-3 text-xs font-semibold text-sienna-800 dark:bg-sienna-900/30 dark:text-sienna-300">
                            <AlertTriangle className="size-4 shrink-0" />
                            <span className="flex-1">{dragError}</span>
                            <button
                                type="button"
                                onClick={() => setDragError(null)}
                                aria-label="Dismiss"
                                className="rounded-lg p-1 hover:bg-sienna-200/60 dark:hover:bg-sienna-800/40"
                            >
                                <X className="size-3.5" />
                            </button>
                        </div>
                    )}

                    {timeless.length > 0 && (
                        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-100 px-4 py-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            <p className="font-bold">
                                {timeless.length} older {timeless.length === 1 ? 'entry needs' : 'entries need'} start
                                and end times before {timeless.length === 1 ? 'it' : 'they'} can be submitted.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {timeless.map((e) => (
                                    <button
                                        key={e.id}
                                        type="button"
                                        onClick={() => openEntry(e)}
                                        className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold hover:bg-white dark:bg-black/20 dark:hover:bg-black/40"
                                    >
                                        <Pencil className="size-3" />
                                        {e.work_date} · {e.project.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Week toolbar */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up stagger-1">
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => visitWeek(week.prev)}
                                aria-label="Previous week"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => visitWeek(toDateString(new Date()))}
                                disabled={week.is_current}
                                className="inline-flex h-9 items-center rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => visitWeek(week.next)}
                                aria-label="Next week"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                            <p className="ml-2 text-sm font-extrabold text-foreground" role="status">
                                {weekLabel}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="hidden items-center gap-3 text-[11px] font-bold text-muted-foreground md:flex"
                                aria-label="Status legend"
                            >
                                {(['draft', 'submitted', 'approved', 'rejected'] as const).map((s) => (
                                    <span key={s} className="inline-flex items-center gap-1">
                                        <span className={cn('ts-legend-dot', `ts-legend-${s}`)} />
                                        {statusMeta[s].label}
                                    </span>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfirmSubmit(true)}
                                disabled={summary.draft_count === 0}
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-moss px-4 text-xs font-bold text-white shadow-lg shadow-moss/20 transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50 dark:bg-moss-600"
                            >
                                <Send className="size-3.5" />
                                Submit week ({summary.draft_count})
                            </button>
                        </div>
                    </div>

                    {/* Day totals */}
                    <div className="mt-3 grid grid-cols-7 gap-2 animate-fade-in-up stagger-2">
                        {Array.from({ length: 7 }, (_, i) => {
                            const day = format(addDays(toDate(week.start, '00:00'), i), 'yyyy-MM-dd');
                            const minutes = summary.by_day[day] ?? 0;
                            const isToday = day === toDateString(new Date());
                            return (
                                <div
                                    key={day}
                                    className={cn(
                                        'rounded-xl border px-2 py-1.5 text-center',
                                        isToday
                                            ? 'border-sienna/40 bg-sienna-100 dark:bg-sienna-900/30'
                                            : 'border-border bg-card',
                                    )}
                                >
                                    <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                        {format(toDate(day, '00:00'), 'EEE')}
                                    </p>
                                    <p className="text-xs font-extrabold text-foreground tabular-nums">
                                        {minutes > 0 ? formatMinutes(minutes) : '—'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Calendar */}
                    <div className="glass-card ts-cal mt-4 overflow-hidden rounded-2xl p-2 sm:p-4 animate-fade-in-up stagger-2">
                        {assignments.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-secondary">
                                    <CalendarDays className="size-5 text-sienna dark:text-sienna-300" />
                                </div>
                                <h2 className="mt-4 text-lg font-extrabold text-foreground">
                                    No active assignments
                                </h2>
                                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                                    You can log time once a project manager assigns you to a project.
                                    Discover open projects to apply.
                                </p>
                                <Link
                                    href="/projects"
                                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-harbor px-4 py-2.5 text-xs font-bold text-white hover:bg-harbor-700"
                                >
                                    Discover projects
                                </Link>
                            </div>
                        ) : (
                            <DnDCalendar
                                localizer={localizer}
                                events={events}
                                date={weekStart}
                                view="week"
                                views={['week']}
                                onNavigate={(date: Date) => visitWeek(toDateString(date))}
                                onSelectSlot={openCreate}
                                onSelectEvent={(event) => openEntry(event.resource)}
                                onEventDrop={({ event, start, end }) =>
                                    persistMove(event.resource, start as Date, end as Date)
                                }
                                onEventResize={({ event, start, end }) =>
                                    persistMove(event.resource, start as Date, end as Date)
                                }
                                resizable
                                selectable
                                toolbar={false}
                                step={30}
                                timeslots={2}
                                min={toDate(week.start, '06:00')}
                                max={toDate(week.start, '22:00')}
                                style={{ height: 640 }}
                                eventPropGetter={(event: CalEvent) => ({
                                    className: statusMeta[event.resource.status].className,
                                })}
                                draggableAccessor={(event) => isEditable(event.resource)}
                                resizableAccessor={(event) => isEditable(event.resource)}
                                components={{ event: CalEventBlock }}
                                formats={{
                                    timeGutterFormat: 'HH:mm',
                                    dayHeaderFormat: (date: Date) => format(date, 'EEE d MMM'),
                                }}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Create / edit dialog */}
            <Dialog open={modal !== null && modal.mode !== 'view'} onOpenChange={(open) => { if (!open) setModal(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {modal?.mode === 'edit' ? 'Edit entry' : 'Add timesheet entry'}
                        </DialogTitle>
                        <DialogDescription>
                            {modal?.mode === 'edit'
                                ? 'Only draft entries can be changed. Correcting a rejected entry moves it back to draft.'
                                : 'Pick the assignment, set the time, describe the work.'}
                        </DialogDescription>
                    </DialogHeader>
                    {modal && modal.mode === 'edit' && modal.entry.status === 'rejected' && modal.entry.review_comment && (
                        <div className="rounded-xl border border-sienna/30 bg-sienna-100 px-4 py-3 text-xs text-sienna-800 dark:bg-sienna-900/30 dark:text-sienna-300">
                            <p className="font-extrabold">Reviewer feedback</p>
                            <p className="mt-1 leading-relaxed">{modal.entry.review_comment}</p>
                        </div>
                    )}
                    {modal && modal.mode !== 'view' && (
                        <EntryForm
                            key={
                                modal.mode === 'edit'
                                    ? `edit-${modal.entry.id}`
                                    : `new-${modal.date}-${modal.start}`
                            }
                            assignments={assignments}
                            initial={
                                modal.mode === 'edit'
                                    ? {
                                        projectId: String(modal.entry.project.id),
                                        assignmentId: String(modal.entry.assignment.id),
                                        workDate: modal.entry.work_date,
                                        startTime: modal.entry.start_time ?? '',
                                        endTime: modal.entry.end_time ?? '',
                                        description: modal.entry.description ?? '',
                                    }
                                    : {
                                        projectId: '',
                                        assignmentId: '',
                                        workDate: modal.date,
                                        startTime: modal.start,
                                        endTime: modal.end,
                                        description: '',
                                    }
                            }
                            entryId={modal.mode === 'edit' ? modal.entry.id : undefined}
                            submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Add entry'}
                            onSuccess={() => setModal(null)}
                            onDelete={
                                modal.mode === 'edit' ? () => deleteEntry(modal.entry.id) : undefined
                            }
                            canDelete={modal.mode === 'edit' && modal.entry.status === 'draft'}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Read-only detail for submitted / approved entries */}
            <Dialog open={modal?.mode === 'view'} onOpenChange={(open) => { if (!open) setModal(null); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Timesheet entry</DialogTitle>
                        <DialogDescription>
                            {modalEntry?.project.title} · {modalEntry?.work_date}
                        </DialogDescription>
                    </DialogHeader>
                    {modalEntry && (
                        <div className="space-y-4">
                            <span
                                className={cn(
                                    'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide',
                                    modalEntry.status === 'approved' &&
                                        'bg-moss-100 text-moss-700 dark:bg-moss-800/40 dark:text-moss-300',
                                    modalEntry.status === 'submitted' &&
                                        'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300',
                                    modalEntry.status === 'rejected' &&
                                        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                                )}
                            >
                                {statusMeta[modalEntry.status].label}
                            </span>
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Time</dt>
                                    <dd className="mt-0.5 font-bold text-foreground">
                                        {modalEntry.start_time}–{modalEntry.end_time}
                                        {modalEntry.minutes !== null && (
                                            <span className="ml-1.5 font-semibold text-muted-foreground">
                                                ({formatMinutes(modalEntry.minutes)})
                                            </span>
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Assignment</dt>
                                    <dd className="mt-0.5 font-bold text-foreground">
                                        {[modalEntry.assignment.role ?? 'Participant', modalEntry.assignment.team]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </dd>
                                </div>
                            </dl>
                            {modalEntry.description && (
                                <div className="rounded-xl bg-secondary/60 p-3.5 text-sm leading-relaxed text-foreground/85">
                                    {modalEntry.description}
                                </div>
                            )}
                            {modalEntry.review_comment && (
                                <div className="rounded-xl border border-border/70 p-3.5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Reviewer {modalEntry.reviewed_by ? `· ${modalEntry.reviewed_by}` : ''}
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                                        {modalEntry.review_comment}
                                    </p>
                                </div>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                Submitted entries are locked. If changes are needed, your reviewer
                                can reject the entry with feedback.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Submit week confirm */}
            <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Submit this week?</DialogTitle>
                        <DialogDescription>
                            {summary.draft_count} {summary.draft_count === 1 ? 'entry' : 'entries'} (
                            {formatMinutes(summary.week_minutes)} total) will be sent for review and
                            locked against further edits.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setConfirmSubmit(false)}
                            className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-accent"
                        >
                            Keep editing
                        </button>
                        <button
                            type="button"
                            onClick={submitWeek}
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-moss px-4 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
                        >
                            <Send className="size-3.5" />
                            {submitting ? 'Submitting…' : 'Submit for review'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Timesheets.layout = {
    breadcrumbs: [
        { title: 'Workspace', href: dashboard().url },
        { title: 'Timesheets', href: timesheetsIndex({}).url },
    ],
};
