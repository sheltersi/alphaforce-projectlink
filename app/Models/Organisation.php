<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Organisation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'email',
        'phone',
        'website',
        'logo_path',
        'city',
        'country',
        'created_by',
    ];

    public const SEED = [
        'Alpha Force Foundation' => [
            'description' => 'A community foundation focused on neighbourhood support and local impact.',
            'email' => 'hello@alphaforce.example',
            'phone' => '+1-555-0101',
            'website' => 'https://alphaforce.example',
            'city' => 'Amsterdam',
            'country' => 'Netherlands',
        ],
        'Greenbridge Collective' => [
            'description' => 'Environmental volunteers restoring urban green spaces across the city.',
            'email' => 'team@greenbridge.example',
            'phone' => '+1-555-0102',
            'website' => 'https://greenbridge.example',
            'city' => 'Rotterdam',
            'country' => 'Netherlands',
        ],
    ];

    protected static function booted(): void
    {
        static::creating(function (self $organisation) {
            if (empty($organisation->slug) && ! empty($organisation->name)) {
                $organisation->slug = Str::slug($organisation->name).'-'.Str::lower(Str::random(6));
            }
        });
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<OrganisationUser, $this> */
    public function organisationUsers(): HasMany
    {
        return $this->hasMany(OrganisationUser::class);
    }

    /** @return BelongsToMany<User, $this> */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'organisation_users')
            ->withPivot(['role'])
            ->withTimestamps();
    }

    /** @return HasMany<Project, $this> */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
