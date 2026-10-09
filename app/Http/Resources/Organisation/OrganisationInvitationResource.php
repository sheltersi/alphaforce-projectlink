<?php

namespace App\Http\Resources\Organisation;

use App\Models\OrganisationInvitation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin OrganisationInvitation */
class OrganisationInvitationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'status' => $this->accepted_at !== null
                ? 'accepted'
                : ($this->expires_at->isPast() ? 'expired' : 'pending'),
            'expires_at' => $this->expires_at->toISOString(),
            'accepted_at' => $this->accepted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
