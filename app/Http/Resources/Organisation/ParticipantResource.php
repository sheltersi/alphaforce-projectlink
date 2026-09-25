<?php

namespace App\Http\Resources\Organisation;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Organisation-facing view of a participant (User + ParticipantProfile).
 *
 * Deliberately excludes sensitive fields that exist on the tables but
 * must never leave the server for the Organisation App:
 * - `participant_profiles.id_number` (government ID)
 * - `participant_profiles.email` (redundant with users.email)
 * - `participant_documents.*` (file paths / storage internals)
 * - users.password / 2FA secrets / remember tokens (already hidden on the model)
 *
 * Nested profile collections (skills, educations, work experiences,
 * certifications) are only serialized when already eager-loaded,
 * otherwise they resolve to empty arrays without querying.
 *
 * @mixin User
 */
class ParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),

            'profile' => $this->whenLoaded('participantProfile', function () {
                $profile = $this->participantProfile;

                return [
                    'id' => $profile->id,
                    'first_name' => $profile->first_name,
                    'last_name' => $profile->last_name,
                    'full_name' => $profile->full_name,
                    'phone' => $profile->phone,
                    'city' => $profile->city,
                    'country' => $profile->country,
                    'nationality' => $profile->nationality,
                    'summary' => $profile->summary,
                    'photo_url' => $profile->photo_path ? asset('storage/'.$profile->photo_path) : null,

                    'skills' => $profile->relationLoaded('skills')
                        ? $profile->skills->map(fn ($skill) => ['id' => $skill->id, 'name' => $skill->name])->values()->all()
                        : [],

                    'educations' => $profile->relationLoaded('educations')
                        ? $profile->educations->map(fn ($education) => [
                            'id' => $education->id,
                            'institution' => $education->institution,
                            'qualification' => $education->qualification,
                            'field_of_study' => $education->field_of_study,
                            'start_year' => $education->start_year,
                            'end_year' => $education->end_year,
                            'description' => $education->description,
                        ])->values()->all()
                        : [],

                    'work_experiences' => $profile->relationLoaded('workExperiences')
                        ? $profile->workExperiences->map(fn ($experience) => [
                            'id' => $experience->id,
                            'job_title' => $experience->job_title,
                            'organisation' => $experience->organisation,
                            'location' => $experience->location,
                            'start_date' => $experience->start_date,
                            'end_date' => $experience->end_date,
                            'currently_working' => (bool) $experience->currently_working,
                            'description' => $experience->description,
                        ])->values()->all()
                        : [],

                    'certifications' => $profile->relationLoaded('certifications')
                        ? $profile->certifications->map(fn ($certification) => [
                            'id' => $certification->id,
                            'name' => $certification->name,
                            'issuing_organisation' => $certification->issuing_organisation,
                            'credential_number' => $certification->credential_number,
                            'issue_date' => $certification->issue_date,
                            'expiry_date' => $certification->expiry_date,
                        ])->values()->all()
                        : [],
                ];
            }),
        ];
    }
}
