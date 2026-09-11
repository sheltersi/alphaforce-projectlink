<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_OPEN = 'open';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    public const SEED = [
        [
            'title' => 'Community Garden Revitalisation',
            'status' => self::STATUS_OPEN,
            'description' => 'Wheelchair-accessible raised beds and a new composting system for the city allotment.',
            'location' => 'Amsterdam',
            'start_date' => '+3 months',
            'end_date' => '+5 months',
            'positions' => 4,
        ],
        [
            'title' => 'Digital Literacy for Seniors',
            'status' => self::STATUS_IN_PROGRESS,
            'description' => 'Weekly one-on-one workshops helping older residents use smartphones and online services.',
            'location' => 'Rotterdam',
            'start_date' => '-2 months',
            'end_date' => '+2 months',
            'positions' => 6,
        ],
        [
            'title' => 'Foodbank Volunteer Network',
            'status' => self::STATUS_COMPLETED,
            'description' => 'Coordinated a delivery roster connecting 200 volunteers with local foodbanks.',
            'location' => 'Utrecht',
            'start_date' => '-8 months',
            'end_date' => '-2 months',
            'positions' => 10,
        ],
        [
            'title' => 'River Cleanup Initiative',
            'status' => self::STATUS_OPEN,
            'description' => 'Monthly riverbank cleanups with data collection on plastic hotspots.',
            'location' => 'Rotterdam',
            'start_date' => '+1 month',
            'end_date' => '+6 months',
            'positions' => 5,
        ],
        [
            'title' => 'Youth Mentorship Program',
            'status' => self::STATUS_IN_PROGRESS,
            'description' => 'Pairing university students with at-risk youth for academic mentoring.',
            'location' => 'Amsterdam',
            'start_date' => '-1 month',
            'end_date' => '+5 months',
            'positions' => 8,
        ],
        [
            'title' => 'Neighbourhood Watch App',
            'status' => self::STATUS_DRAFT,
            'description' => 'Designing a simple safety reporting app for residential blocks.',
            'location' => 'The Hague',
            'start_date' => null,
            'end_date' => null,
            'positions' => 3,
        ],
    ];

    protected $fillable = [
        'organisation_id',
        'created_by',
        'title',
        'slug',
        'description',
        'location',
        'status',
        'start_date',
        'end_date',
        'positions',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'positions' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $project) {
            if (empty($project->slug) && ! empty($project->title)) {
                $project->slug = Str::slug($project->title).'-'.Str::lower(Str::random(6));
            }
        });
    }

    /** @return BelongsTo<Organisation, $this> */
    public function organisation(): BelongsTo
    {
        return $this->belongsTo(Organisation::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsToMany<Skill, $this> */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'project_skill');
    }

    /** @return HasMany<ProjectApplication, $this> */
    public function applications(): HasMany
    {
        return $this->hasMany(ProjectApplication::class);
    }

    /** @return HasMany<ProjectParticipant, $this> */
    public function participants(): HasMany
    {
        return $this->hasMany(ProjectParticipant::class);
    }
}