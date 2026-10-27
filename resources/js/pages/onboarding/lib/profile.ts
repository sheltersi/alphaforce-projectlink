export interface EducationEntry {
    id: string;
    institution: string;
    qualification: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
    description: string;
}

export interface ExperienceEntry {
    id: string;
    jobTitle: string;
    organisation: string;
    location: string;
    startDate: string;
    endDate: string;
    currentlyWorking: boolean;
    description: string;
}

export interface CertificationEntry {
    id: string;
    name: string;
    issuingOrganisation: string;
    issueDate: string;
    expiryDate: string;
    doesNotExpire: boolean;
    credentialNumber: string;
    credentialUrl: string;
    relatedSkills: string[];
    certificateDocument: CertificationDocument | null;
}

export interface CertificationDocument {
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
    filePath?: string;
    downloadUrl?: string;
}

export interface ProfileDocument {
    id: string;
    name: string;
    size: number;
    type: string;
    category:
        | 'CV'
        | 'Certificate'
        | 'Supporting document'
        | 'ID'
        | 'Proof of residence'
        | 'SARS document'
        | 'Bank letter';
    uploadDate: string;
    /** data: URL so the file survives reloads and can be downloaded */
    dataUrl?: string;
    /** Storage path for documents already persisted on the server */
    filePath?: string;
    /** Authenticated download URL for documents persisted on the server */
    downloadUrl?: string;
}

export const REQUIRED_DOCUMENT_CATEGORIES = [
    'ID',
    'Proof of residence',
    'SARS document',
] as const;

export interface ParticipantProfile {
    photoDataUrl: string | null;
    firstName: string;
    lastName: string;
    email: string;
    idNumber: string;
    phone: string;
    city: string;
    country: string;
    nationality: string;
    summary: string;
    skills: string[];
    education: EducationEntry[];
    experience: ExperienceEntry[];
    certifications: CertificationEntry[];
    documents: ProfileDocument[];
    updatedAt: string | null;
}

export const SKILL_SUGGESTIONS = [
    'Project Management',
    'Software Development',
    'Data Analysis',
    'Communication',
    'Research',
    'Monitoring & Evaluation',
    'Stakeholder Engagement',
    'Report Writing',
    'Financial Management',
    'Community Mobilisation',
];

export function newId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

export function emptyEducation(): EducationEntry {
    return {
        id: newId('edu'),
        institution: '',
        qualification: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
        description: '',
    };
}

export function emptyExperience(): ExperienceEntry {
    return {
        id: newId('exp'),
        jobTitle: '',
        organisation: '',
        location: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
    };
}

export function emptyCertification(): CertificationEntry {
    return {
        id: newId('cert'),
        name: '',
        issuingOrganisation: '',
        issueDate: '',
        expiryDate: '',
        doesNotExpire: false,
        credentialNumber: '',
        credentialUrl: '',
        relatedSkills: [],
        certificateDocument: null,
    };
}

export function emptyProfile(): ParticipantProfile {
    return {
        photoDataUrl: null,
        firstName: '',
        lastName: '',
        email: '',
        idNumber: '',
        phone: '',
        city: '',
        country: '',
        nationality: '',
        summary: '',
        skills: [],
        education: [],
        experience: [],
        certifications: [],
        documents: [],
        updatedAt: null,
    };
}

export type StepId =
    | 'personal'
    | 'summary'
    | 'skills'
    | 'education'
    | 'experience'
    | 'certifications'
    | 'documents';

export interface StepMeta {
    id: StepId;
    label: string;
    shortLabel: string;
    required: boolean;
    hint: string;
}

export const STEPS: StepMeta[] = [
    {
        id: 'personal',
        label: 'Personal Information',
        shortLabel: 'Personal',
        required: true,
        hint: 'Who you are and how organisations reach you',
    },
    {
        id: 'summary',
        label: 'Professional Summary',
        shortLabel: 'Summary',
        required: true,
        hint: 'Introduce yourself professionally',
    },
    {
        id: 'skills',
        label: 'Skills',
        shortLabel: 'Skills',
        required: true,
        hint: 'What you bring to projects',
    },
    {
        id: 'education',
        label: 'Education',
        shortLabel: 'Education',
        required: false,
        hint: 'Your academic background',
    },
    {
        id: 'experience',
        label: 'Experience',
        shortLabel: 'Experience',
        required: false,
        hint: 'Where you have worked',
    },
    {
        id: 'certifications',
        label: 'Certifications',
        shortLabel: 'Certifications',
        required: false,
        hint: 'Optional — add if you have them',
    },
    {
        id: 'documents',
        label: 'Documents',
        shortLabel: 'Documents',
        required: true,
        hint: 'ID, proof of residence, and SARS document required; bank letter optional',
    },
];

export interface SectionStatus {
    id: StepId;
    complete: boolean;
    percent: number;
}

function isEducationComplete(e: EducationEntry): boolean {
    return Boolean(
        e.institution.trim() && e.qualification.trim() && e.startYear.trim(),
    );
}

function isExperienceComplete(e: ExperienceEntry): boolean {
    return Boolean(
        e.jobTitle.trim() && e.organisation.trim() && e.startDate.trim(),
    );
}

function isCertificationComplete(c: CertificationEntry): boolean {
    return Boolean(
        c.name.trim() &&
            c.issuingOrganisation.trim() &&
            c.issueDate.trim() &&
            (c.doesNotExpire || c.expiryDate.trim()),
    );
}

export function sectionStatuses(profile: ParticipantProfile): SectionStatus[] {
    const personalFields = [
        profile.firstName.trim(),
        profile.lastName.trim(),
        profile.email.trim(),
        profile.idNumber.trim(),
        profile.phone.trim(),
        profile.nationality.trim(),
        profile.city.trim(),
        profile.country.trim(),
    ];
    const personalFilled = personalFields.filter(Boolean).length;
    const personalBonus = profile.photoDataUrl ? 0.5 : 0;
    const personalPercent = Math.min(
        100,
        Math.round(((personalFilled + personalBonus) / 8.5) * 100),
    );

    const summaryLen = profile.summary.trim().length;
    const summaryPercent =
        summaryLen === 0 ? 0 : summaryLen < 80 ? 60 : summaryLen < 200 ? 85 : 100;

    const skillsPercent =
        profile.skills.length === 0
            ? 0
            : profile.skills.length < 3
              ? 70
              : 100;

    const educationPercent =
        profile.education.length === 0
            ? 0
            : Math.round(
                  (profile.education.filter(isEducationComplete).length /
                      profile.education.length) *
                      100,
              );

    const experiencePercent =
        profile.experience.length === 0
            ? 0
            : Math.round(
                  (profile.experience.filter(isExperienceComplete).length /
                      profile.experience.length) *
                      100,
              );

    const certificationsPercent =
        profile.certifications.length === 0
            ? 0
            : Math.round(
                  (profile.certifications.filter(isCertificationComplete)
                      .length /
                      profile.certifications.length) *
                      100,
              );

    const documentCategories = new Set(
        profile.documents.map((document) => document.category),
    );
    const requiredDocumentsComplete = REQUIRED_DOCUMENT_CATEGORIES.filter(
        (category) => documentCategories.has(category),
    ).length;
    const documentsPercent = Math.round(
        (requiredDocumentsComplete / REQUIRED_DOCUMENT_CATEGORIES.length) *
            100,
    );

    const raw: SectionStatus[] = [
        {
            id: 'personal',
            complete: personalFilled === 8,
            percent: personalPercent,
        },
        {
            id: 'summary',
            complete: summaryLen >= 80,
            percent: summaryPercent,
        },
        {
            id: 'skills',
            complete: profile.skills.length > 0,
            percent: skillsPercent,
        },
        {
            id: 'education',
            complete:
                profile.education.length > 0 &&
                profile.education.every(isEducationComplete),
            percent: educationPercent,
        },
        {
            id: 'experience',
            complete:
                profile.experience.length > 0 &&
                profile.experience.every(isExperienceComplete),
            percent: experiencePercent,
        },
        {
            id: 'certifications',
            complete:
                profile.certifications.length > 0 &&
                profile.certifications.every(isCertificationComplete),
            percent: certificationsPercent,
        },
        {
            id: 'documents',
            complete:
                requiredDocumentsComplete ===
                REQUIRED_DOCUMENT_CATEGORIES.length,
            percent: documentsPercent,
        },
    ];
    return raw;
}

/** Weighted overall completion: core sections weigh more. */
export function completionPercent(profile: ParticipantProfile): number {
    const statuses = sectionStatuses(profile);
    const weights: Record<StepId, number> = {
        personal: 25,
        summary: 15,
        skills: 15,
        education: 15,
        experience: 15,
        certifications: 7.5,
        documents: 7.5,
    };
    let total = 0;
    for (const s of statuses) {
        total += (s.percent / 100) * (weights[s.id] ?? 0);
    }
    return Math.round(total);
}

export function requiredBlockingErrors(
    profile: ParticipantProfile,
    step: StepId,
): string[] {
    const errors: string[] = [];
    if (step === 'personal') {
        if (!profile.firstName.trim()) errors.push('First name is required.');
        if (!profile.lastName.trim()) errors.push('Last name is required.');
        if (!profile.email.trim()) {
            errors.push('Email is required.');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
            errors.push('Enter a valid email address.');
        }
        if (!profile.idNumber.trim()) errors.push('ID number or passport is required.');
        if (!profile.phone.trim()) errors.push('Phone number is required.');
        if (!profile.nationality.trim()) errors.push('Nationality is required.');
        if (!profile.city.trim()) errors.push('City is required.');
        if (!profile.country.trim()) errors.push('Country is required.');
    }
    if (step === 'summary') {
        if (profile.summary.trim().length < 40) {
            errors.push(
                'Write at least a short professional summary (40+ characters) to continue.',
            );
        }
    }
    if (step === 'skills') {
        if (profile.skills.length === 0) {
            errors.push('Add at least one skill to continue.');
        }
    }
    if (step === 'certifications') {
        profile.certifications.forEach((certification, index) => {
            const started = Boolean(
                certification.name.trim() ||
                    certification.issuingOrganisation.trim() ||
                    certification.issueDate.trim() ||
                    certification.expiryDate.trim() ||
                    certification.credentialNumber.trim() ||
                    certification.credentialUrl.trim() ||
                    certification.relatedSkills.length > 0 ||
                    certification.doesNotExpire ||
                    certification.certificateDocument,
            );

            if (!started) return;

            const entry = `Certification ${index + 1}`;
            if (!certification.name.trim()) {
                errors.push(`${entry}: certification name is required.`);
            }
            if (!certification.issuingOrganisation.trim()) {
                errors.push(`${entry}: issuing organisation is required.`);
            }
            if (!certification.issueDate.trim()) {
                errors.push(`${entry}: issue date is required.`);
            }
            if (
                !certification.doesNotExpire &&
                !certification.expiryDate.trim()
            ) {
                errors.push(
                    `${entry}: enter an expiration date or mark it as non-expiring.`,
                );
            }
        });
    }
    if (step === 'documents') {
        const documentCategories = new Set(
            profile.documents.map((document) => document.category),
        );
        const missing = REQUIRED_DOCUMENT_CATEGORIES.filter(
            (category) => !documentCategories.has(category),
        );
        if (missing.length > 0) {
            errors.push(
                `Upload the required documents to continue: ${missing.join(', ')}.`,
            );
        }
    }
    return errors;
}

export function formatFileSize(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileTypeLabel(mime: string, name: string): string {
    const ext = name.split('.').pop()?.toUpperCase() ?? '';
    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('word') || ['DOC', 'DOCX'].includes(ext)) return ext || 'DOC';
    if (mime.startsWith('image/')) return ext || 'IMG';
    return ext || 'FILE';
}
