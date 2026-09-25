<?php

namespace App\Http\Resources\Organisation;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Minimal public representation of a User for the Organisation App.
 *
 * Only id/name/email plus timestamps. Never exposes password,
 * two-factor secrets, remember tokens or notification routing data.
 *
 * @mixin User
 */
class UserBriefResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
