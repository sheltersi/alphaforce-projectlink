<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParticipantDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_profile_id',
        'original_name',
        'file_path',
        'disk',
        'file_size',
        'mime_type',
        'category',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    /** @return BelongsTo<ParticipantProfile, $this> */
    public function participantProfile(): BelongsTo
    {
        return $this->belongsTo(ParticipantProfile::class);
    }
}
