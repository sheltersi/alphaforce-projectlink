<?php

namespace App\Http\Resources\Organisation;

use App\Models\ProjectApplication;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Project application for organisation review queues.
 *
 * There are no `reviewed_at` / `reviewed_by` columns on
 * `project_applications` — only `status`, `cover_letter` and
 * `submitted_at` — so none are exposed here.
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
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'project' => new ProjectListResource($this->whenLoaded('project')),
            'applicant' => new ParticipantResource($this->whenLoaded('user')),
            'assignment' => new ProjectParticipantResource($this->whenLoaded('participant')),
        ];
    }
}
