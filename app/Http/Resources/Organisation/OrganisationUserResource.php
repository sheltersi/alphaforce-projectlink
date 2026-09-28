<?php

namespace App\Http\Resources\Organisation;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A user belonging to the authenticated organisation.
 *
 * Wraps a User loaded through the organisation membership relation, so
 * `pivot.role` holds the user's role within the organisation. Account
 * status is derived from email verification (the users table has no
 * status column). Never exposes credentials or tokens.
 *
 * @mixin User
 */
class OrganisationUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->pivot->role ?? null,
            'status' => $this->email_verified_at ? 'verified' : 'unverified',
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
