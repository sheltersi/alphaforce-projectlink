<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Services\OrganisationInvitationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'invitation_token' => ['nullable', 'string', 'size:64', 'alpha_num'],
        ])->validate();

        $invitations = app(OrganisationInvitationService::class);
        $mustChangePassword = false;
        if (! empty($input['invitation_token'])) {
            $invitation = $invitations->validateForRegistration(
                $input['invitation_token'],
                $input['email'],
                $input['password']
            );
            $mustChangePassword = $invitation->temporary_password_hash !== null;
        }

        return DB::transaction(function () use ($input, $invitations, $mustChangePassword): User {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'must_change_password' => $mustChangePassword,
            ]);

            if (method_exists($user, 'assignRole')) {
                try {
                    $user->assignRole('candidate');
                } catch (\Throwable $e) {
                    // Role may not exist in testing without seeder – ignore.
                }
            }

            if (! empty($input['invitation_token'])) {
                $invitations->accept($input['invitation_token'], $user);
            }

            return $user;
        });
    }
}
