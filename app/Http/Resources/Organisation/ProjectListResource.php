<?php

namespace App\Http\Resources\Organisation;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Lightweight project representation for lists/tables.
 *
 * No nested applications, participants or timesheets. Counts are
 * only present when explicitly `withCount()`-ed by the caller.
 *
 * @mixin Project
 */
class ProjectListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'status' => $this->status,
            'location' => $this->location,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'positions' => $this->positions,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'organisation' => $this->whenLoaded('organisation', fn () => [
                'id' => $this->organisation->id,
                'name' => $this->organisation->name,
                'slug' => $this->organisation->slug,
            ]),

            'skills' => $this->whenLoaded('skills', fn () => $this->skills->pluck('name')->values()->all()),

            'applications_count' => $this->whenCounted('applications'),
            'participants_count' => $this->whenCounted('participants'),
            'likes_count' => $this->whenCounted('likes'),
        ];
    }
}
