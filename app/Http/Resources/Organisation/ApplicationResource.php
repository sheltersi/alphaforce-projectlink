<?php

namespace App\Http\Resources\Organisation;

use App\Models\ProjectApplication;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Project application for organisation review queues.
 *
 * Exposes reviewer audit fields (`reviewed_at`, `reviewed_by`,
 * `rejection_reason`) alongside `status`, `cover_letter` and
 * `submitted_at`.
 *
 * The `assignment` key holds the post-acceptance `ProjectParticipant`
 * row (relation `participant`); it is named for what it is to avoid
 * confusion with the `applicant` (User) representation.
 *
 * @mixin ProjectApplication
 */
class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'cover_letter' => $this->cover_letter,
            'submitted_at' => $this->submitted_at?->toISOString(),
            'reviewed_at' => $this->reviewed_at?->toISOString(),
            'reviewed_by' => $this->reviewed_by,
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'project' => new ProjectListResource($this->whenLoaded('project')),
            'applicant' => new ParticipantResource($this->whenLoaded('user')),
            'reviewer' => new ParticipantResource($this->whenLoaded('reviewer')),
            'assignment' => new ProjectParticipantResource($this->whenLoaded('participant')),
        ];
    }
}
