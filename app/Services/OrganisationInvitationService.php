<?php

namespace App\Services;

use App\Models\Organisation;
use App\Models\OrganisationInvitation;
use App\Models\OrganisationUser;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class OrganisationInvitationService
{
    /**
     * @return array{invitation: OrganisationInvitation, token: string, temporary_password: string|null}
     */
    public function invite(Organisation $organisation, User $inviter, string $email): array
    {
        $email = Str::lower(trim($email));

        if ($organisation->users()->whereRaw('LOWER(users.email) = ?', [$email])->exists()) {
            throw ValidationException::withMessages([
                'email' => ['This person is already a member of the organisation.'],
            ]);
        }

        return DB::transaction(function () use ($organisation, $inviter, $email): array {
            $invite = OrganisationInvitation::query()
                ->where('organisation_id', $organisation->id)
                ->where('email', $email)
                ->whereNull('accepted_at')
                ->first();
            $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
            $temporaryPassword = null;

            if ($user === null || $user->must_change_password) {
                $temporaryPassword = Str::password(20);

                if ($user === null) {
                    $user = User::create([
                        'name' => Str::headline(Str::before($email, '@')),
                        'email' => $email,
                        'password' => $temporaryPassword,
                        'must_change_password' => true,
                    ]);
                    $user->assignRole(Role::findByName('candidate', 'web'));
                } else {
                    $user->forceFill([
                        'password' => $temporaryPassword,
                        'must_change_password' => true,
                    ])->save();
                }
            }

            $token = Str::random(64);
            $attributes = [
                'invited_by' => $inviter->id,
                'token_hash' => hash('sha256', $token),
                'temporary_password_hash' => $temporaryPassword === null ? null : Hash::make($temporaryPassword),
                'expires_at' => now()->addDays(7),
            ];

            if ($invite === null) {
                $invite = OrganisationInvitation::create([
                    ...$attributes,
                    'organisation_id' => $organisation->id,
                    'email' => $email,
                ]);
            } else {
                $invite->update($attributes);
            }

            return [
                'invitation' => $invite,
                'token' => $token,
                'temporary_password' => $temporaryPassword,
            ];
        });
    }

    public function validateForEmail(string $token, string $email): OrganisationInvitation
    {
        $invitation = $this->findUsableInvitation($token);

        if (! hash_equals($invitation->email, Str::lower(trim($email)))) {
            throw ValidationException::withMessages([
                'invitation_token' => ['This invitation was issued to a different email address.'],
            ]);
        }

        return $invitation;
    }

    public function validateForRegistration(string $token, string $email, string $password): OrganisationInvitation
    {
        $invitation = $this->validateForEmail($token, $email);

        if (
            $invitation->temporary_password_hash !== null
            && ! Hash::check($password, $invitation->temporary_password_hash)
        ) {
            throw ValidationException::withMessages([
                'password' => ['Use the temporary password from your invitation email to create your account.'],
            ]);
        }

        return $invitation;
    }

    public function accept(string $token, User $user): OrganisationUser
    {
        $invitation = OrganisationInvitation::query()
            ->where('token_hash', hash('sha256', $token))
            ->first();

        if ($invitation === null) {
            $this->invalidInvitation();
        }

        if (! hash_equals($invitation->email, Str::lower(trim($user->email)))) {
            throw ValidationException::withMessages([
                'invitation_token' => ['This invitation was issued to a different email address.'],
            ]);
        }

        return DB::transaction(function () use ($invitation, $user): OrganisationUser {
            $locked = OrganisationInvitation::query()->lockForUpdate()->findOrFail($invitation->id);
            $membership = OrganisationUser::query()
                ->where('organisation_id', $locked->organisation_id)
                ->where('user_id', $user->id)
                ->first();

            if ($locked->accepted_at !== null) {
                if ($membership !== null) {
                    return $membership->load(['organisation', 'user']);
                }

                $this->invalidInvitation();
            }

            if ($locked->expires_at->isPast()) {
                $this->invalidInvitation();
            }

            if ($membership !== null) {
                throw ValidationException::withMessages([
                    'invitation_token' => ['You are already a member of this organisation.'],
                ]);
            }

            $membership = OrganisationUser::create([
                'organisation_id' => $locked->organisation_id,
                'user_id' => $user->id,
                'role' => 'member',
            ]);

            $locked->update([
                'accepted_at' => now(),
                'temporary_password_hash' => null,
            ]);

            return $membership->load(['organisation', 'user']);
        });
    }

    private function findUsableInvitation(string $token): OrganisationInvitation
    {
        $invitation = OrganisationInvitation::query()
            ->where('token_hash', hash('sha256', $token))
            ->whereNull('accepted_at')
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($invitation === null) {
            $this->invalidInvitation();
        }

        return $invitation;
    }

    private function invalidInvitation(): never
    {
        throw ValidationException::withMessages([
            'invitation_token' => ['This invitation is invalid, expired, or has already been accepted.'],
        ]);
    }
}
