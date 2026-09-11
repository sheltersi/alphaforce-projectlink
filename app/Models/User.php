<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    public const SEED_NAMES = [
        'Liam van der Berg',
        'Zara Almeida',
        'Noah Okonkwo',
        'Aisha Rahman',
        'Lucas Moreau',
        'Priya Sharma',
        'Mateo Rossi',
        'Elena Petrova',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /** @return HasOne<ParticipantProfile, $this> */
    public function participantProfile(): HasOne
    {
        return $this->hasOne(ParticipantProfile::class);
    }

    /** @return HasMany<OrganisationUser, $this> */
    public function organisationUsers(): HasMany
    {
        return $this->hasMany(OrganisationUser::class);
    }

    /** @return BelongsToMany<Organisation, $this> */
    public function organisations(): BelongsToMany
    {
        return $this->belongsToMany(Organisation::class, 'organisation_users')
            ->withPivot(['role'])
            ->withTimestamps();
    }

    /** @return HasMany<Project, $this> */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    /** @return HasMany<ProjectApplication, $this> */
    public function projectApplications(): HasMany
    {
        return $this->hasMany(ProjectApplication::class);
    }

    /** @return HasMany<ProjectParticipant, $this> */
    public function projectParticipants(): HasMany
    {
        return $this->hasMany(ProjectParticipant::class);
    }

    /** @return HasMany<ProjectLike, $this> */
    public function projectLikes(): HasMany
    {
        return $this->hasMany(ProjectLike::class);
    }

    /** @return BelongsToMany<Project, $this> */
    public function likedProjects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_likes');
    }
}
