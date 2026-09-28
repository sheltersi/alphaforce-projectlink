<?php

namespace App\Http\Resources\Organisation;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Authenticated user for the Organisation App (`/api/auth/*`).
 *
 * Exposes the user's identity plus their Spatie roles and organisation
 * memberships (with pivot role). Never exposes password hashes,
 * two-factor secrets or remember tokens.
 *
 * @mixin User
 */
class AuthenticatedUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),

            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')->values()),

            'organisations' => $this->whenLoaded('organisations', fn () => $this->organisations
                ->map(fn ($organisation) => [
                    'id' => $organisation->id,
                    'name' => $organisation->name,
                    'slug' => $organisation->slug,
                    'role' => $organisation->pivot->role ?? null,
                ])
                ->values()),

            'current_organisation' => $this->whenLoaded('organisations', function () {
                $current = $this->organisations->sortBy('id')->first();

                return $current === null ? null : [
                    'id' => $current->id,
                    'name' => $current->name,
                    'slug' => $current->slug,
                    'role' => $current->pivot->role ?? null,
                ];
            }),

            'onboarding' => $this->whenLoaded('organisations', fn () => [
                'completed' => $this->organisations->isNotEmpty(),
                'step' => $this->organisations->isNotEmpty() ? null : 'organisation',
            ]),
        ];
    }
}
