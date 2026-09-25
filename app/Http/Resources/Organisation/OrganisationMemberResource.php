<?php

namespace App\Http\Resources\Organisation;

use App\Models\OrganisationUser;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Membership row linking a User to an Organisation.
 *
 * Wraps `organisation_users`. Exposes the pivot role only —
 * Spatie roles/permissions stay in policies and controllers.
 *
 * @mixin OrganisationUser
 */
class OrganisationMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organisation_id' => $this->organisation_id,
            'user_id' => $this->user_id,
            'role' => $this->role,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'user' => new UserBriefResource($this->whenLoaded('user')),

            // Lightweight inline brief to avoid OrganisationResource recursion.
            'organisation' => $this->whenLoaded('organisation', fn () => [
                'id' => $this->organisation->id,
                'name' => $this->organisation->name,
                'slug' => $this->organisation->slug,
            ]),
        ];
    }
}
