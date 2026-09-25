<?php

namespace App\Http\Resources\Organisation;

use App\Models\Organisation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * Organisation for the Organisation App.
 *
 * Serializes only columns that exist on `organisations` plus
 * optionally-loaded relationships and counts. No business logic.
 *
 * @mixin Organisation
 */
class OrganisationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'email' => $this->email,
            'phone' => $this->phone,
            'website' => $this->website,
            'logo_url' => $this->logo_path ? Storage::url($this->logo_path) : null,
            'city' => $this->city,
            'country' => $this->country,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'creator' => new UserBriefResource($this->whenLoaded('creator')),
            'members' => OrganisationMemberResource::collection($this->whenLoaded('organisationUsers')),
            'users' => UserBriefResource::collection($this->whenLoaded('users')),
            'projects' => ProjectListResource::collection($this->whenLoaded('projects')),

            'members_count' => $this->whenCounted('organisationUsers'),
            'users_count' => $this->whenCounted('users'),
            'projects_count' => $this->whenCounted('projects'),
        ];
    }
}
