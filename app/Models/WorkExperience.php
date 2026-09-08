<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkExperience extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_profile_id',
        'job_title',
        'organisation',
        'location',
        'start_date',
        'end_date',
        'currently_working',
        'description',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'currently_working' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<ParticipantProfile, $this> */
    public function participantProfile(): BelongsTo
    {
        return $this->belongsTo(ParticipantProfile::class);
    }
}
