<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParticipantProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'photo_path',
        'first_name',
        'last_name',
        'email',
        'phone',
        'city',
        'country',
        'summary',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Skill, $this> */
    public function skills(): HasMany
    {
        return $this->hasMany(Skill::class)->orderBy('name');
    }

    /** @return HasMany<Education, $this> */
    public function educations(): HasMany
    {
        return $this->hasMany(Education::class)->orderBy('sort_order')->orderBy('start_year', 'desc');
    }

    /** @return HasMany<WorkExperience, $this> */
    public function workExperiences(): HasMany
    {
        return $this->hasMany(WorkExperience::class)->orderBy('sort_order')->orderBy('start_date', 'desc');
    }

    /** @return HasMany<Certification, $this> */
    public function certifications(): HasMany
    {
        return $this->hasMany(Certification::class)->orderBy('sort_order')->orderBy('issue_date', 'desc');
    }

    /** @return HasMany<ParticipantDocument, $this> */
    public function documents(): HasMany
    {
        return $this->hasMany(ParticipantDocument::class)->latest();
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }
}
