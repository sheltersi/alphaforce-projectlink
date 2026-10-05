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
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Models\Role;
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
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

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

    /**
     * The organisation this user primarily acts under (first membership).
     * Users with several memberships are scoped to this one for Phase 1.
     */
    public function currentOrganisation(): ?Organisation
    {
        return $this->organisations()->orderBy('organisations.id')->first();
    }

    /**
     * The user's in-progress onboarding draft: an organisation they created
     * but are not a member of yet. Membership marks onboarding complete,
     * so drafts stay invisible to all organisation-scoped endpoints.
     */
    public function onboardingDraft(): ?Organisation
    {
        return Organisation::where('created_by', $this->id)
            ->whereDoesntHave('organisationUsers', fn ($query) => $query->where('user_id', $this->id))
            ->latest('id')
            ->first();
    }

    public function organisationMembershipFor(Organisation|int $organisation): ?OrganisationUser
    {
        $organisationId = $organisation instanceof Organisation ? $organisation->id : $organisation;

        return $this->organisationUsers()->where('organisation_id', $organisationId)->first();
    }

    public function belongsToOrganisation(Organisation|int $organisation): bool
    {
        return $this->organisationMembershipFor($organisation) !== null;
    }

    /**
     * The user's pivot role within the given organisation, if any.
     */
    public function organisationRole(Organisation|int $organisation): ?string
    {
        return $this->organisationMembershipFor($organisation)?->role;
    }

    /**
     * Organisation-management roles: Technical Admin and Project Manager,
     * resolved from Spatie roles or the organisation pivot role.
     */
    public function isOrganisationManager(Organisation|int $organisation): bool
    {
        if ($this->hasRole('technical_admin') || $this->hasRole('project_manager')) {
            return true;
        }

        return in_array(strtolower((string) $this->organisationRole($organisation)), ['admin', 'manager', 'technical_admin', 'project_manager'], true);
    }

    /**
     * Technical Admin level access within the given organisation.
     */
    public function isOrganisationAdmin(Organisation|int $organisation): bool
    {
        if ($this->hasRole('technical_admin')) {
            return true;
        }

        return in_array(strtolower((string) $this->organisationRole($organisation)), ['admin', 'technical_admin'], true);
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

    /** @return HasMany<ResumeShareLink, $this> */
    public function resumeShareLinks(): HasMany
    {
        return $this->hasMany(ResumeShareLink::class);
    }

    /** @return HasMany<ProjectParticipant, $this> */
    public function projectParticipants(): HasMany
    {
        return $this->hasMany(ProjectParticipant::class);
    }

    public function syncProjectParticipationRole(): void
    {
        $isActivelyAssigned = $this->projectParticipants()
            ->where('status', ProjectParticipant::STATUS_ACTIVE)
            ->whereNotNull('role')
            ->where('role', '<>', '')
            ->exists();

        $desiredRole = Role::findByName($isActivelyAssigned ? 'participant' : 'candidate', 'web');
        $otherParticipationRole = Role::findByName($isActivelyAssigned ? 'candidate' : 'participant', 'web');

        $this->removeRole($otherParticipationRole);
        $this->assignRole($desiredRole);
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
