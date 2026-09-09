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
    credentialNumber: string;
}

export interface ProfileDocument {
    id: string;
    name: string;
    size: number;
    type: string;
    category: 'CV' | 'Certificate' | 'Supporting document';
    uploadDate: string;
    /** data: URL so the file survives reloads and can be downloaded */
    dataUrl?: string;
    /** Storage path for documents already persisted on the server */
    filePath?: string;
    /** Authenticated download URL for documents persisted on the server */
    downloadUrl?: string;
}

export interface ParticipantProfile {
    photoDataUrl: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
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
        credentialNumber: '',
    };
}

export function emptyProfile(): ParticipantProfile {
    return {
        photoDataUrl: null,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        country: '',
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
        required: false,
        hint: 'Optional — CV, certificates, supporting files',
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
    return Boolean(c.name.trim() && c.issuingOrganisation.trim());
}

export function sectionStatuses(profile: ParticipantProfile): SectionStatus[] {
    const personalFields = [
        profile.firstName.trim(),
        profile.lastName.trim(),
        profile.email.trim(),
    ];
    const personalFilled = personalFields.filter(Boolean).length;
    const personalBonus =
        (profile.phone.trim() ? 0.5 : 0) +
        (profile.city.trim() ? 0.5 : 0) +
        (profile.country.trim() ? 0.5 : 0) +
        (profile.photoDataUrl ? 0.5 : 0);
    const personalPercent = Math.min(
        100,
        Math.round(((personalFilled + personalBonus) / 5) * 100),
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

    const documentsPercent =
        profile.documents.length === 0
            ? 0
            : profile.documents.length === 1
              ? 70
              : 100;

    const raw: SectionStatus[] = [
        {
            id: 'personal',
            complete: personalFilled === 3,
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
            complete: profile.documents.length > 0,
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
