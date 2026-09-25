<?php

namespace App\Http\Resources\Organisation;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full project representation for the Organisation App detail view.
 *
 * Relationships and counts are only serialized when explicitly
 * loaded/counted by the caller (`whenLoaded` / `whenCounted`),
 * so list queries never accidentally N+1.
 *
 * @mixin Project
 */
class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organisation_id' => $this->organisation_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'location' => $this->location,
            'status' => $this->status,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'positions' => $this->positions,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'organisation' => new OrganisationResource($this->whenLoaded('organisation')),
            'creator' => new UserBriefResource($this->whenLoaded('creator')),

            'skills' => $this->whenLoaded('skills', fn () => $this->skills->pluck('name')->values()->all()),

            'applications' => ApplicationResource::collection($this->whenLoaded('applications')),
            'participants' => ProjectParticipantResource::collection($this->whenLoaded('participants')),

            'applications_count' => $this->whenCounted('applications'),
            'participants_count' => $this->whenCounted('participants'),
            'likes_count' => $this->whenCounted('likes'),
        ];
    }
}
