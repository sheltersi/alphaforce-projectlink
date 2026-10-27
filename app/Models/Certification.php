<?php

namespace App\Models;

use App\Casts\YearMonth;
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
        'does_not_expire',
        'credential_url',
        'related_skills',
        'document_path',
        'document_original_name',
        'document_mime_type',
        'document_file_size',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => YearMonth::class,
            'expiry_date' => YearMonth::class,
            'does_not_expire' => 'boolean',
            'related_skills' => 'array',
            'document_file_size' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<ParticipantProfile, $this> */
    public function participantProfile(): BelongsTo
    {
        return $this->belongsTo(ParticipantProfile::class);
    }
}
