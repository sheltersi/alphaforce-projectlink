<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certification extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_profile_id',
        'name',
        'issuing_organisation',
        'credential_number',
        'issue_date',
        'expiry_date',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<ParticipantProfile, $this> */
    public function participantProfile(): BelongsTo
    {
        return $this->belongsTo(ParticipantProfile::class);
    }
}
