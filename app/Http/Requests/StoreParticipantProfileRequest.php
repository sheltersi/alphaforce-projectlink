<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreParticipantProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Personal – allow draft saves (nullable), but validate format when present
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'summary' => ['nullable', 'string', 'min:40', 'max:5000'],

            // Photo – either file upload or base64 dataUrl string
            'photo' => ['nullable', 'image', 'max:5120'], // 5 MB
            'photo_data_url' => ['nullable', 'string', 'max:8000000'], // base64 ~5MB

            // Skills – allow draft with no skills, but validate when present
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:100', 'distinct'],

            // Education – optional, multiple
            'education' => ['nullable', 'array'],
            'education.*.institution' => ['required_with:education', 'string', 'max:255'],
            'education.*.qualification' => ['required_with:education', 'string', 'max:255'],
            'education.*.field_of_study' => ['nullable', 'string', 'max:255'],
            'education.*.start_year' => ['nullable', 'string', 'regex:/^\d{4}$/'],
            'education.*.end_year' => ['nullable', 'string', 'regex:/^\d{4}$/'],
            'education.*.description' => ['nullable', 'string', 'max:2000'],

            // Work experiences – optional, multiple
            'experience' => ['nullable', 'array'],
            'experience.*.job_title' => ['required_with:experience', 'string', 'max:255'],
            'experience.*.organisation' => ['required_with:experience', 'string', 'max:255'],
            'experience.*.location' => ['nullable', 'string', 'max:255'],
            'experience.*.start_date' => ['nullable', 'string', 'regex:/^\d{4}-\d{2}$/'], // YYYY-MM
            'experience.*.end_date' => ['nullable', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'experience.*.currently_working' => ['nullable', 'boolean'],
            'experience.*.description' => ['nullable', 'string', 'max:5000'],

            // Certifications – optional, multiple
            'certifications' => ['nullable', 'array'],
            'certifications.*.name' => ['required_with:certifications', 'string', 'max:255'],
            'certifications.*.issuing_organisation' => ['required_with:certifications', 'string', 'max:255'],
            'certifications.*.credential_number' => ['nullable', 'string', 'max:255'],
            'certifications.*.issue_date' => ['nullable', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'certifications.*.expiry_date' => ['nullable', 'string', 'regex:/^\d{4}-\d{2}$/'],

            // Documents – optional, can be file uploads or base64 payloads
            'documents' => ['nullable', 'array'],
            'documents.*.original_name' => ['required_with:documents', 'string', 'max:255'],
            'documents.*.file_size' => ['nullable', 'integer', 'min:1', 'max:10485760'], // 10 MB
            'documents.*.mime_type' => ['nullable', 'string', 'max:255'],
            'documents.*.category' => ['nullable', 'string', 'in:CV,Certificate,Supporting document'],
            'documents.*.data_url' => ['nullable', 'string', 'max:15000000'], // base64 for ~10MB
            // For multipart file uploads, the frontend may send files as `document_files` array
            'document_files' => ['nullable', 'array'],
            'document_files.*' => ['file', 'max:10240', 'mimes:pdf,doc,docx,png,jpg,jpeg'],
            'document_categories' => ['nullable', 'array'],
            'document_categories.*' => ['nullable', 'string', 'in:CV,Certificate,Supporting document'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'email.required' => 'Email is required.',
            'summary.required' => 'Professional summary is required.',
            'summary.min' => 'Write at least a short professional summary (40+ characters).',
            'skills.required' => 'Add at least one skill.',
            'skills.min' => 'Add at least one skill.',
            'education.*.institution.required_with' => 'Institution is required for each education entry.',
            'education.*.qualification.required_with' => 'Qualification is required for each education entry.',
            'experience.*.job_title.required_with' => 'Job title is required for each experience entry.',
            'experience.*.organisation.required_with' => 'Organisation is required for each experience entry.',
            'certifications.*.name.required_with' => 'Certification name is required.',
            'certifications.*.issuing_organisation.required_with' => 'Issuing organisation is required.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Frontend sends camelCase (firstName, fieldOfStudy, etc.) – normalize to snake_case
        $map = [
            'firstName' => 'first_name',
            'lastName' => 'last_name',
            'photoDataUrl' => 'photo_data_url',
            'fieldOfStudy' => 'field_of_study',
            'startYear' => 'start_year',
            'endYear' => 'end_year',
            'jobTitle' => 'job_title',
            'startDate' => 'start_date',
            'endDate' => 'end_date',
            'currentlyWorking' => 'currently_working',
            'issuingOrganisation' => 'issuing_organisation',
            'credentialNumber' => 'credential_number',
            'issueDate' => 'issue_date',
            'expiryDate' => 'expiry_date',
        ];

        $input = $this->all();

        // Top-level camelCase
        foreach (['firstName' => 'first_name', 'lastName' => 'last_name', 'photoDataUrl' => 'photo_data_url'] as $from => $to) {
            if (array_key_exists($from, $input) && ! array_key_exists($to, $input)) {
                $input[$to] = $input[$from];
            }
        }

        // Normalize nested arrays
        if (isset($input['education']) && is_array($input['education'])) {
            $input['education'] = array_map(fn ($e) => $this->normalizeKeys($e, $map), $input['education']);
        }
        if (isset($input['experience']) && is_array($input['experience'])) {
            $input['experience'] = array_map(fn ($e) => $this->normalizeKeys($e, $map), $input['experience']);
        }
        if (isset($input['certifications']) && is_array($input['certifications'])) {
            $input['certifications'] = array_map(fn ($c) => $this->normalizeKeys($c, $map), $input['certifications']);
        }
        if (isset($input['documents']) && is_array($input['documents'])) {
            // documents use original_name, file_size etc. – map dataUrl -> data_url
            $input['documents'] = array_map(function ($d) {
                if (isset($d['dataUrl']) && ! isset($d['data_url'])) {
                    $d['data_url'] = $d['dataUrl'];
                }
                if (isset($d['name']) && ! isset($d['original_name'])) {
                    $d['original_name'] = $d['name'];
                }
                if (isset($d['type']) && ! isset($d['mime_type'])) {
                    $d['mime_type'] = $d['type'];
                }
                if (isset($d['size']) && ! isset($d['file_size'])) {
                    $d['file_size'] = $d['size'];
                }

                return $d;
            }, $input['documents']);
        }

        $this->merge($input);
    }

    /**
     * @param  array<string, mixed>  $item
     * @param  array<string, string>  $map
     * @return array<string, mixed>
     */
    private function normalizeKeys(array $item, array $map): array
    {
        foreach ($map as $from => $to) {
            if (array_key_exists($from, $item) && ! array_key_exists($to, $item)) {
                $item[$to] = $item[$from];
                unset($item[$from]);
            }
        }

        return $item;
    }
}
