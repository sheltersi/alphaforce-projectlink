<?php

namespace App\Services;

use App\Models\ParticipantProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Handles persistence and retrieval of participant onboarding profiles.
 *
 * Keeps `ParticipantProfileController` thin by encapsulating:
 * - photo handling (upload vs base64)
 * - has-many sync (skills, educations, experiences, certifications, documents)
 * - file cleanup within a DB transaction
 */
class ParticipantProfileService
{
    /**
     * Load the user's profile with all relations.
     */
    public function findForUser(User $user): ?ParticipantProfile
    {
        return $user->participantProfile()->with([
            'skills',
            'educations',
            'workExperiences',
            'certifications',
            'documents',
        ])->first();
    }

    /**
     * Create or update a participant profile and all related entities.
     *
     * @param  array<string, mixed>  $validated  Validated data from StoreParticipantProfileRequest
     */
    public function upsert(User $user, array $validated, Request $request): ParticipantProfile
    {
        return DB::transaction(function () use ($user, $validated, $request): ParticipantProfile {
            $photoPath = $this->resolvePhotoPath($user, $validated, $request);

            $existingForDefaults = $user->participantProfile()->first();

            $profile = ParticipantProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'first_name' => $validated['first_name'] ?? $existingForDefaults?->first_name ?? '',
                    'last_name' => $validated['last_name'] ?? $existingForDefaults?->last_name ?? '',
                    'email' => $validated['email'] ?? $existingForDefaults?->email ?? $user->email ?? '',
                    'id_number' => array_key_exists('id_number', $validated) ? $validated['id_number'] : ($existingForDefaults?->id_number),
                    'phone' => array_key_exists('phone', $validated) ? $validated['phone'] : ($existingForDefaults?->phone),
                    'city' => array_key_exists('city', $validated) ? $validated['city'] : ($existingForDefaults?->city),
                    'country' => array_key_exists('country', $validated) ? $validated['country'] : ($existingForDefaults?->country),
                    'nationality' => array_key_exists('nationality', $validated) ? $validated['nationality'] : ($existingForDefaults?->nationality),
                    'summary' => $validated['summary'] ?? $existingForDefaults?->summary ?? '',
                    'photo_path' => $photoPath,
                ]
            );

            if (array_key_exists('skills', $validated)) {
                $this->syncSkills($profile, $validated['skills'] ?? []);
            }
            if (array_key_exists('education', $validated)) {
                $this->syncEducations($profile, $validated['education'] ?? []);
            }
            if (array_key_exists('experience', $validated)) {
                $this->syncWorkExperiences($profile, $validated['experience'] ?? []);
            }
            if (array_key_exists('certifications', $validated)) {
                $this->syncCertifications($profile, $validated['certifications'] ?? []);
            }

            // Only touch documents if the payload explicitly contains them (allows partial updates)
            if ($request->has('documents') || $request->hasFile('document_files')) {
                $this->syncDocuments($profile, $validated['documents'] ?? [], $request);
            }

            return $profile->load(['skills', 'educations', 'workExperiences', 'certifications', 'documents']);
        });
    }

    /**
     * Resolve the photo path: prefer uploaded file, fallback to base64, else keep existing or remove.
     */
    private function resolvePhotoPath(User $user, array $validated, Request $request): ?string
    {
        $existing = $user->participantProfile()->first();
        $oldPath = $existing?->photo_path;

        if ($request->hasFile('photo')) {
            $newPath = $request->file('photo')->store("participant-photos/{$user->id}", 'public');
            $this->deleteIfExists($oldPath, 'public');

            return $newPath;
        }

        if (! empty($validated['photo_data_url'])) {
            $decoded = $this->storeBase64File($validated['photo_data_url'], "participant-photos/{$user->id}", 'public');
            if ($decoded) {
                $this->deleteIfExists($oldPath, 'public');

                return $decoded['path'];
            }
        }

        // No new photo – keep old, unless frontend explicitly sent null to remove
        if (array_key_exists('photo_data_url', $validated) && empty($validated['photo_data_url']) && ! $request->hasFile('photo')) {
            $raw = $request->all();
            $rawVal = $raw['photoDataUrl'] ?? $raw['photo_data_url'] ?? null;
            if ($rawVal === null || $rawVal === '') {
                $this->deleteIfExists($oldPath, 'public');

                return null;
            }
        }

        return $oldPath;
    }

    private function syncSkills(ParticipantProfile $profile, array $skills): void
    {
        $profile->skills()->delete();

        $clean = collect($skills)
            ->filter(fn ($s) => is_string($s) && trim($s) !== '')
            ->map(fn ($s) => trim((string) preg_replace('/\s+/', ' ', $s)))
            ->unique(fn ($s) => strtolower($s))
            ->values();

        foreach ($clean as $name) {
            $profile->skills()->create(['name' => $name]);
        }
    }

    private function syncEducations(ParticipantProfile $profile, array $educations): void
    {
        $profile->educations()->delete();

        $filtered = collect($educations)
            ->filter(fn ($e) => ! empty(trim($e['institution'] ?? '')) || ! empty(trim($e['qualification'] ?? '')) || ! empty(trim($e['field_of_study'] ?? '')) || ! empty(trim($e['description'] ?? '')))
            ->values();

        foreach ($filtered as $idx => $edu) {
            if (empty(trim($edu['institution'] ?? '')) || empty(trim($edu['qualification'] ?? ''))) {
                continue;
            }

            $profile->educations()->create([
                'institution' => trim($edu['institution']),
                'qualification' => trim($edu['qualification']),
                'field_of_study' => isset($edu['field_of_study']) ? trim($edu['field_of_study']) : null,
                'start_year' => $edu['start_year'] ?? null,
                'end_year' => $edu['end_year'] ?? null,
                'description' => $edu['description'] ?? null,
                'sort_order' => $idx,
            ]);
        }
    }

    private function syncWorkExperiences(ParticipantProfile $profile, array $experiences): void
    {
        $profile->workExperiences()->delete();

        $filtered = collect($experiences)
            ->filter(fn ($e) => ! empty(trim($e['job_title'] ?? '')) || ! empty(trim($e['organisation'] ?? '')) || ! empty(trim($e['location'] ?? '')) || ! empty(trim($e['description'] ?? '')))
            ->values();

        foreach ($filtered as $idx => $exp) {
            if (empty(trim($exp['job_title'] ?? '')) || empty(trim($exp['organisation'] ?? ''))) {
                continue;
            }

            $profile->workExperiences()->create([
                'job_title' => trim($exp['job_title']),
                'organisation' => trim($exp['organisation']),
                'location' => isset($exp['location']) ? trim($exp['location']) : null,
                'start_date' => $exp['start_date'] ?? null,
                'end_date' => ! empty($exp['currently_working']) ? null : ($exp['end_date'] ?? null),
                'currently_working' => (bool) ($exp['currently_working'] ?? false),
                'description' => $exp['description'] ?? null,
                'sort_order' => $idx,
            ]);
        }
    }

    private function syncCertifications(ParticipantProfile $profile, array $certifications): void
    {
        $profile->certifications()->delete();

        $filtered = collect($certifications)
            ->filter(fn ($c) => ! empty(trim($c['name'] ?? '')) || ! empty(trim($c['issuing_organisation'] ?? '')) || ! empty(trim($c['credential_number'] ?? '')))
            ->values();

        foreach ($filtered as $idx => $cert) {
            if (empty(trim($cert['name'] ?? '')) || empty(trim($cert['issuing_organisation'] ?? ''))) {
                continue;
            }

            $profile->certifications()->create([
                'name' => trim($cert['name']),
                'issuing_organisation' => trim($cert['issuing_organisation']),
                'credential_number' => $cert['credential_number'] ?? null,
                'issue_date' => $cert['issue_date'] ?? null,
                'expiry_date' => $cert['expiry_date'] ?? null,
                'sort_order' => $idx,
            ]);
        }
    }

    private function syncDocuments(ParticipantProfile $profile, array $jsonDocuments, Request $request): void
    {
        $existing = $profile->documents()->get();
        $payloadDocuments = collect($jsonDocuments);
        $keptPaths = $payloadDocuments->pluck('file_path')->filter()->values();

        // Remove only the documents that were deleted in the UI.
        // Kept documents must keep both their DB row and their stored file.
        foreach ($existing as $doc) {
            if (! $keptPaths->contains($doc->file_path)) {
                $this->deleteIfExists($doc->file_path, $doc->disk);
                $doc->delete();
            }
        }

        foreach ($payloadDocuments as $doc) {
            $originalName = trim((string) ($doc['original_name'] ?? ''));
            if ($originalName === '') {
                continue;
            }

            $category = $doc['category'] ?? 'Supporting document';

            // New upload sent as a base64 data URL.
            if (! empty($doc['data_url'])) {
                $decoded = $this->storeBase64File($doc['data_url'], "participant-documents/{$profile->id}", 'local');
                if ($decoded) {
                    $profile->documents()->create([
                        'original_name' => $originalName,
                        'file_path' => $decoded['path'],
                        'disk' => $decoded['disk'],
                        'file_size' => $decoded['size'],
                        'mime_type' => $decoded['mime'] ?? ($doc['mime_type'] ?? 'application/octet-stream'),
                        'category' => $category,
                    ]);
                }

                continue;
            }

            // Existing document round-tripped from the frontend – keep the file, refresh metadata.
            $filePath = $doc['file_path'] ?? null;
            if ($filePath) {
                $existing->where('file_path', $filePath)->each(function ($stored) use ($originalName, $category): void {
                    $stored->update([
                        'original_name' => $originalName,
                        'category' => $category,
                    ]);
                });
            }
        }

        if ($request->hasFile('document_files')) {
            $categories = $request->input('document_categories', []);
            foreach ($request->file('document_files') as $idx => $file) {
                $path = $file->store("participant-documents/{$profile->id}", 'local');
                $profile->documents()->create([
                    'original_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'disk' => 'local',
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                    'category' => $categories[$idx] ?? 'Supporting document',
                ]);
            }
        }
    }

    private function deleteIfExists(?string $path, string $disk): void
    {
        if ($path && Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }

    /**
     * Store a base64 dataUrl to disk.
     *
     * @return array{path: string, disk: string, mime: string, size: int}|null
     */
    private function storeBase64File(string $dataUrl, string $directory, string $disk = 'public'): ?array
    {
        if (! str_contains($dataUrl, ';base64,')) {
            return null;
        }

        [$header, $base64] = explode(',', $dataUrl, 2);
        $mime = 'application/octet-stream';
        if (preg_match('/data:(.*?);base64/', $header, $m)) {
            $mime = $m[1];
        }

        $decoded = base64_decode($base64, true);
        if ($decoded === false) {
            return null;
        }

        $extension = $this->mimeToExtension($mime);
        $filename = Str::random(20).'.'.$extension;
        $path = trim($directory, '/').'/'.$filename;

        Storage::disk($disk)->put($path, $decoded);

        return [
            'path' => $path,
            'disk' => $disk,
            'mime' => $mime,
            'size' => strlen($decoded),
        ];
    }

    private function mimeToExtension(string $mime): string
    {
        return match (true) {
            str_contains($mime, 'jpeg') || str_contains($mime, 'jpg') => 'jpg',
            str_contains($mime, 'png') => 'png',
            str_contains($mime, 'pdf') => 'pdf',
            str_contains($mime, 'msword') => 'doc',
            str_contains($mime, 'officedocument.wordprocessingml') => 'docx',
            default => 'bin',
        };
    }

    /**
     * Transform a profile with relations to the frontend ParticipantProfile shape.
     *
     * @return array<string, mixed>
     */
    public function toPayload(ParticipantProfile $profile): array
    {
        $photoUrl = null;
        if ($profile->photo_path && Storage::disk('public')->exists($profile->photo_path)) {
            $photoUrl = Storage::disk('public')->url($profile->photo_path);
        }

        return [
            'photoDataUrl' => $photoUrl,
            'photoPath' => $profile->photo_path,
            'firstName' => $profile->first_name,
            'lastName' => $profile->last_name,
            'email' => $profile->email,
            'idNumber' => $profile->id_number ?? '',
            'phone' => $profile->phone ?? '',
            'city' => $profile->city ?? '',
            'country' => $profile->country ?? '',
            'nationality' => $profile->nationality ?? '',
            'summary' => $profile->summary ?? '',
            'skills' => $profile->skills->pluck('name')->toArray(),
            'education' => $profile->educations->map(fn ($e) => [
                'id' => (string) $e->id,
                'institution' => $e->institution,
                'qualification' => $e->qualification,
                'fieldOfStudy' => $e->field_of_study ?? '',
                'startYear' => $e->start_year ?? '',
                'endYear' => $e->end_year ?? '',
                'description' => $e->description ?? '',
            ])->toArray(),
            'experience' => $profile->workExperiences->map(fn ($ex) => [
                'id' => (string) $ex->id,
                'jobTitle' => $ex->job_title,
                'organisation' => $ex->organisation,
                'location' => $ex->location ?? '',
                'startDate' => $ex->start_date ?? '',
                'endDate' => $ex->end_date ?? '',
                'currentlyWorking' => (bool) $ex->currently_working,
                'description' => $ex->description ?? '',
            ])->toArray(),
            'certifications' => $profile->certifications->map(fn ($c) => [
                'id' => (string) $c->id,
                'name' => $c->name,
                'issuingOrganisation' => $c->issuing_organisation,
                'issueDate' => $c->issue_date ?? '',
                'expiryDate' => $c->expiry_date ?? '',
                'credentialNumber' => $c->credential_number ?? '',
            ])->toArray(),
            'documents' => $profile->documents->map(fn ($d) => [
                'id' => (string) $d->id,
                'name' => $d->original_name,
                'size' => $d->file_size,
                'type' => $d->mime_type,
                'category' => $d->category,
                'uploadDate' => $d->created_at?->toISOString(),
                'filePath' => $d->file_path,
                'downloadUrl' => route('onboarding.profile.document.download', ['document' => $d->id]),
            ])->toArray(),
            'updatedAt' => $profile->updated_at?->toISOString(),
        ];
    }
}
