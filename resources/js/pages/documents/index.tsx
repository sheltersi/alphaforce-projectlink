import { Head, Link, router } from '@inertiajs/react';
import {
    Check,
    CircleAlert,
    Download,
    Eye,
    FileText,
    FolderOpen,
    Pencil,
    Upload,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { formatFileSize } from '@/pages/onboarding/lib/profile';

type CandidateDocument = {
    id: number;
    name: string;
    category: string;
    size: number;
    mimeType: string | null;
    uploadedAt: string | null;
    downloadUrl: string;
};

type RequiredDocument = {
    category: string;
    uploaded: boolean;
};

type Props = {
    documents: CandidateDocument[];
    requiredDocuments: RequiredDocument[];
};

export default function DocumentsIndex({
    documents,
    requiredDocuments,
}: Props) {
    const [editingDocumentId, setEditingDocumentId] = useState<number | null>(
        null,
    );
    const [editingName, setEditingName] = useState('');
    const [updatingDocumentId, setUpdatingDocumentId] = useState<number | null>(
        null,
    );
    const uploadedRequiredCount = requiredDocuments.filter(
        (document) => document.uploaded,
    ).length;

    function handleRename(document: CandidateDocument) {
        const name = editingName.trim();
        if (!name) {
            toast.error('Enter a document name.');
            return;
        }

        setUpdatingDocumentId(document.id);
        router.patch(
            `/documents/${document.id}`,
            { original_name: name },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingDocumentId(null);
                    toast.success('Document renamed.');
                },
                onError: (errors) => {
                    toast.error(
                        Object.values(errors)[0] ??
                            'Could not rename the document.',
                    );
                },
                onFinish: () => setUpdatingDocumentId(null),
            },
        );
    }

    function handleReplace(
        document: CandidateDocument,
        file: File | undefined,
    ) {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Documents must be 10 MB or smaller.');
            return;
        }

        const formData = new FormData();
        formData.append('_method', 'patch');
        formData.append('replacement_file', file);

        setUpdatingDocumentId(document.id);
        router.post(`/documents/${document.id}`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Document replaced.'),
            onError: (errors) => {
                toast.error(
                    Object.values(errors)[0] ??
                        'Could not replace the document.',
                );
            },
            onFinish: () => setUpdatingDocumentId(null),
        });
    }

    return (
        <>
            <Head title="Documents" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-muted-foreground text-sm font-semibold">
                            Candidate workspace
                        </p>
                        <h1 className="text-harbor mt-1 text-3xl font-extrabold tracking-tight">
                            My documents
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
                            Keep your onboarding documents together. You can
                            download your uploads or update them from your
                            profile.
                        </p>
                    </div>
                    <Link
                        href="/onboarding/build-profile?step=6"
                        className="bg-harbor text-sand-50 hover:bg-harbor-700 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition"
                    >
                        <Upload className="size-4" />
                        Manage uploads
                    </Link>
                </header>

                <section
                    aria-label="Required document checklist"
                    className="border-harbor/10 rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
                >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-harbor text-base font-extrabold">
                            Onboarding checklist
                        </h2>
                        <span className="text-muted-foreground text-sm font-semibold">
                            {uploadedRequiredCount} of{' '}
                            {requiredDocuments.length} required documents
                            uploaded
                        </span>
                    </div>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                        {requiredDocuments.map((document) => (
                            <li
                                key={document.category}
                                className="border-harbor/10 bg-sand-50/70 flex items-center gap-3 rounded-xl border p-3"
                            >
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                                        document.uploaded
                                            ? 'bg-moss/10 text-moss-600'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}
                                >
                                    {document.uploaded ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <CircleAlert className="size-4" />
                                    )}
                                </span>
                                <span className="text-harbor text-sm font-bold">
                                    {document.category}
                                </span>
                                <span className="sr-only">
                                    {document.uploaded ? 'uploaded' : 'missing'}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-muted-foreground mt-3 text-xs">
                        Bank letter is optional.
                    </p>
                </section>

                <section
                    aria-label="Uploaded documents"
                    className="border-harbor/10 rounded-2xl border bg-white p-5 shadow-sm sm:p-6"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-harbor text-base font-extrabold">
                                Uploaded documents
                            </h2>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {documents.length === 1
                                    ? '1 file in your document library'
                                    : `${documents.length} files in your document library`}
                            </p>
                        </div>
                        <FolderOpen className="text-harbor/60 size-6" />
                    </div>

                    {documents.length > 0 ? (
                        <ul className="divide-harbor/10 mt-5 divide-y">
                            {documents.map((document) => (
                                <li
                                    key={document.id}
                                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                                >
                                    <span className="bg-harbor/8 text-harbor flex size-11 shrink-0 items-center justify-center rounded-xl">
                                        <FileText className="size-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        {editingDocumentId === document.id ? (
                                            <form
                                                className="flex flex-wrap items-center gap-2"
                                                onSubmit={(event) => {
                                                    event.preventDefault();
                                                    handleRename(document);
                                                }}
                                            >
                                                <input
                                                    autoFocus
                                                    aria-label={`New name for ${document.name}`}
                                                    value={editingName}
                                                    onChange={(event) =>
                                                        setEditingName(
                                                            event.target.value,
                                                        )
                                                    }
                                                    maxLength={255}
                                                    className="border-harbor/20 text-harbor focus:border-sienna focus:ring-sienna/20 h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm font-semibold outline-none focus:ring-2"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        updatingDocumentId ===
                                                        document.id
                                                    }
                                                    className="bg-harbor text-sand-50 h-10 rounded-lg px-3 text-sm font-bold disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditingDocumentId(
                                                            null,
                                                        )
                                                    }
                                                    className="border-harbor/15 text-harbor inline-flex size-10 items-center justify-center rounded-lg border"
                                                    aria-label="Cancel rename"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </form>
                                        ) : (
                                            <span className="text-harbor block truncate text-sm font-extrabold">
                                                {document.name}
                                            </span>
                                        )}
                                        <span className="text-muted-foreground mt-1 block text-xs font-medium">
                                            {document.category} ·{' '}
                                            {formatFileSize(document.size)}
                                            {document.uploadedAt && (
                                                <>
                                                    {' '}
                                                    · Uploaded{' '}
                                                    {new Date(
                                                        document.uploadedAt,
                                                    ).toLocaleDateString()}
                                                </>
                                            )}
                                        </span>
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <a
                                            href={`/documents/${document.id}/view`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="border-harbor/15 text-harbor hover:border-harbor hover:bg-harbor hover:text-sand-50 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition"
                                        >
                                            <Eye className="size-4" />
                                            View
                                        </a>
                                        <a
                                            href={document.downloadUrl}
                                            className="border-harbor/15 text-harbor hover:border-harbor hover:bg-harbor hover:text-sand-50 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition"
                                        >
                                            <Download className="size-4" />
                                            Download
                                        </a>
                                        <button
                                            type="button"
                                            disabled={
                                                updatingDocumentId !== null
                                            }
                                            onClick={() => {
                                                setEditingDocumentId(
                                                    document.id,
                                                );
                                                setEditingName(document.name);
                                            }}
                                            className="border-harbor/15 text-harbor hover:border-harbor inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition disabled:opacity-50"
                                        >
                                            <Pencil className="size-4" />
                                            Rename
                                        </button>
                                        <label className="border-harbor/15 text-harbor hover:border-harbor inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
                                            <Upload className="size-4" />
                                            {updatingDocumentId === document.id
                                                ? 'Replacing…'
                                                : 'Replace'}
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                                aria-label={`Replace ${document.name}`}
                                                disabled={
                                                    updatingDocumentId !== null
                                                }
                                                onChange={(event) => {
                                                    handleReplace(
                                                        document,
                                                        event.currentTarget
                                                            .files?.[0],
                                                    );
                                                    event.currentTarget.value =
                                                        '';
                                                }}
                                            />
                                        </label>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="border-harbor/20 bg-sand-50/60 mt-5 rounded-2xl border border-dashed px-6 py-10 text-center">
                            <FolderOpen className="text-harbor/45 mx-auto size-9" />
                            <h3 className="text-harbor mt-3 text-sm font-extrabold">
                                No documents uploaded yet
                            </h3>
                            <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
                                Upload your ID, proof of residence, and SARS
                                document to complete your onboarding. A bank
                                letter is optional.
                            </p>
                            <Link
                                href="/onboarding/build-profile?step=6"
                                className="bg-harbor text-sand-50 hover:bg-harbor-700 mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition"
                            >
                                <Upload className="size-4" />
                                Upload documents
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
