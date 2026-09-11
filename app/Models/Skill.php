<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_profile_id',
        'name',
    ];

    public const SEED_NAMES = [
        'Applied Research',
        'Data Analysis',
        'Community Outreach',
        'Public Speaking',
        'Project Coordination',
        'Grant Writing',
        'Graphic Design',
        'Social Media',
        'Web Development',
        'Event Planning',
        'First Aid',
        'Budgeting',
        'Volunteer Recruitment',
        'Technical Writing',
        'Mentoring',
        'Survey Design',
    ];

    /** @return BelongsTo<ParticipantProfile, $this> */
    public function participantProfile(): BelongsTo
    {
        return $this->belongsTo(ParticipantProfile::class);
    }

    /** @return BelongsToMany<Project, $this> */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_skill');
    }
}
