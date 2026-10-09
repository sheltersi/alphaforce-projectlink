<?php

use App\Models\Organisation;
use App\Models\OrganisationInvitation;
use App\Models\User;
use App\Notifications\OrganisationInvitationNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/** @return array{organisation: Organisation, admin: User, manager: User, member: User, otherAdmin: User} */
function invitationSetup(): array
{
    $organisation = Organisation::factory()->create();
    $otherOrganisation = Organisation::factory()->create();
    $admin = User::factory()->create();
    $manager = User::factory()->create();
    $member = User::factory()->create();
    $otherAdmin = User::factory()->create();

    $admin->assignRole('technical_admin');
    $manager->assignRole('project_manager');
    $member->assignRole('participant');
    $otherAdmin->assignRole('technical_admin');

    $organisation->users()->attach($admin->id, ['role' => 'admin']);
    $organisation->users()->attach($manager->id, ['role' => 'manager']);
    $organisation->users()->attach($member->id, ['role' => 'member']);
    $otherOrganisation->users()->attach($otherAdmin->id, ['role' => 'admin']);

    return compact('organisation', 'admin', 'manager', 'member', 'otherAdmin');
}

/** @return array<string, string> */
function invitationHeaders(User $user): array
{
    Auth::forgetGuards();

    return ['Authorization' => 'Bearer '.$user->createToken('invitation-test')->plainTextToken];
}

it('lets organisation admins invite an email and lists only their pending invitations', function () {
    Notification::fake();
    $setup = invitationSetup();
    $email = 'new.member@example.test';

    $response = $this->postJson('/api/organisation/invitations', ['email' => $email], invitationHeaders($setup['admin']))
        ->assertCreated()
        ->assertJsonPath('data.email', $email)
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('message', 'Invitation sent.');

    $invitation = OrganisationInvitation::where('email', $email)->firstOrFail();
    expect($invitation->organisation_id)->toBe($setup['organisation']->id)
        ->and($invitation->expires_at->isFuture())->toBeTrue()
        ->and(strlen($invitation->token_hash))->toBe(64);

    Notification::assertSentOnDemand(OrganisationInvitationNotification::class, function ($notification, $channels, $notifiable) use ($email, $setup): bool {
        $mail = $notification->toMail($notifiable);

        return $notification->organisation->is($setup['organisation'])
            && $notifiable->routes['mail'] === $email
            && $notification->temporaryPassword !== null
            && collect($mail->introLines)->contains(fn ($line) => str_contains($line, $notification->temporaryPassword));
    });

    expect($invitation->temporary_password_hash)->not->toBeNull();

    $this->getJson('/api/organisation/invitations', invitationHeaders($setup['admin']))
        ->assertOk()
        ->assertJsonStructure(['data' => [['id', 'email', 'status', 'expires_at']], 'links', 'meta'])
        ->assertJsonPath('meta.total', 1);

    expect($response->json('data'))->not->toHaveKey('token');
});

it('creates invited accounts with temporary credentials and requires a password change', function () {
    Notification::fake();
    $setup = invitationSetup();
    $email = 'new.member@example.test';
    $this->postJson('/api/organisation/invitations', ['email' => $email], invitationHeaders($setup['admin']))->assertCreated();

    $token = null;
    $temporaryPassword = null;
    Notification::assertSentOnDemand(OrganisationInvitationNotification::class, function ($notification) use (&$token, &$temporaryPassword): bool {
        $token = $notification->token;
        $temporaryPassword = $notification->temporaryPassword;

        return $temporaryPassword !== null;
    });

    $user = User::where('email', $email)->firstOrFail();
    expect($user->must_change_password)->toBeTrue()
        ->and($user->organisationRole($setup['organisation']))->toBeNull();

    Auth::forgetGuards();
    $response = $this->postJson('/api/auth/login', [
        'email' => $email,
        'password' => $temporaryPassword,
    ])->assertOk()
        ->assertJsonPath('data.email', $email)
        ->assertJsonPath('data.must_change_password', true)
        ->assertJsonPath('data.onboarding.completed', false);

    $headers = ['Authorization' => 'Bearer '.$response->json('token')];
    Auth::forgetGuards();
    $this->getJson('/api/onboarding', $headers)
        ->assertForbidden()
        ->assertJsonPath('message', 'Change your temporary password before using the Organisation App.');

    Auth::forgetGuards();
    $this->putJson('/api/auth/password', [
        'current_password' => $temporaryPassword,
        'password' => 'A-new-password123!',
        'password_confirmation' => 'A-new-password123!',
    ], $headers)
        ->assertForbidden()
        ->assertJsonPath('message', 'Accept your organisation invitation before changing the temporary password.');

    Auth::forgetGuards();
    $this->postJson('/api/organisation/invitations/accept', ['token' => $token], $headers)
        ->assertOk()
        ->assertJsonPath('membership.role', 'member');

    expect($user->fresh()->organisationRole($setup['organisation']))->toBe('member')
        ->and($user->fresh()->hasRole('candidate'))->toBeTrue();

    Auth::forgetGuards();
    $this->putJson('/api/auth/password', [
        'current_password' => $temporaryPassword,
        'password' => 'A-new-password123!',
        'password_confirmation' => 'A-new-password123!',
    ], $headers)
        ->assertOk()
        ->assertJsonPath('data.current_organisation.role', 'member')
        ->assertJsonPath('data.must_change_password', false)
        ->assertJsonPath('message', 'Password updated.');

    Auth::forgetGuards();
    $this->getJson('/api/onboarding', $headers)
        ->assertOk()
        ->assertJsonPath('data.completed', true);

    Auth::forgetGuards();
    $this->getJson('/api/participant/profile', $headers)
        ->assertOk()
        ->assertJsonPath('profile', null);

    Auth::forgetGuards();
    $this->putJson('/api/participant/profile', [
        'first_name' => 'New',
        'last_name' => 'Member',
        'email' => $email,
        'id_number' => 'INVITED-1001',
        'phone' => '+1 555 0101',
        'city' => 'Amsterdam',
        'country' => 'Netherlands',
        'nationality' => 'Dutch',
        'summary' => 'An experienced community volunteer with a strong interest in supporting local teams and projects.',
        'skills' => ['Community Outreach'],
    ], $headers)
        ->assertOk()
        ->assertJsonPath('profile.firstName', 'New')
        ->assertJsonPath('profile.skills.0', 'Community Outreach');

    Auth::forgetGuards();
    $this->getJson('/api/auth/me', $headers)
        ->assertOk()
        ->assertJsonPath('data.participant_profile_complete', true);
});

it('allows an existing invited account to accept once and only for its email address', function () {
    Notification::fake();
    $setup = invitationSetup();
    $invitee = User::factory()->create(['email' => 'existing.member@example.test']);
    $this->postJson('/api/organisation/invitations', ['email' => $invitee->email], invitationHeaders($setup['admin']))->assertCreated();

    $token = null;
    $temporaryPassword = null;
    Notification::assertSentOnDemand(OrganisationInvitationNotification::class, function ($notification) use (&$token, &$temporaryPassword): bool {
        $token = $notification->token;
        $temporaryPassword = $notification->temporaryPassword;

        return true;
    });

    expect($temporaryPassword)->toBeNull();

    $this->postJson('/api/organisation/invitations/accept', ['token' => $token], invitationHeaders($setup['member']))
        ->assertUnprocessable()->assertJsonValidationErrors('invitation_token');

    $this->postJson('/api/organisation/invitations/accept', ['token' => $token], invitationHeaders($invitee))
        ->assertOk()
        ->assertJsonPath('data.id', $invitee->id)
        ->assertJsonPath('data.role', 'member')
        ->assertJsonPath('membership.organisation_id', $setup['organisation']->id)
        ->assertJsonPath('membership.role', 'member');

    $this->postJson('/api/organisation/invitations/accept', ['token' => $token], invitationHeaders($invitee))
        ->assertOk()
        ->assertJsonPath('membership.role', 'member');
});

it('restricts invitations to organisation admins and validates addresses and membership state', function () {
    Notification::fake();
    $setup = invitationSetup();
    $headers = invitationHeaders($setup['admin']);

    $this->postJson('/api/organisation/invitations', [], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('email');
    $this->postJson('/api/organisation/invitations', ['email' => 'invalid'], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('email');
    $this->postJson('/api/organisation/invitations', ['email' => $setup['member']->email], $headers)
        ->assertUnprocessable()->assertJsonValidationErrors('email');

    $this->postJson('/api/organisation/invitations', ['email' => 'manager-invite@example.test'], invitationHeaders($setup['manager']))
        ->assertForbidden();
    $this->getJson('/api/organisation/invitations', invitationHeaders($setup['manager']))
        ->assertForbidden();
    $this->postJson('/api/organisation/invitations', ['email' => 'outsider@example.test'], invitationHeaders($setup['otherAdmin']))
        ->assertCreated();
    $this->assertDatabaseHas('organisation_invitations', [
        'organisation_id' => $setup['otherAdmin']->currentOrganisation()->id,
        'email' => 'outsider@example.test',
    ]);
    Auth::forgetGuards();
    $this->postJson('/api/organisation/invitations', ['email' => 'outsider@example.test'])
        ->assertUnauthorized();
});

it('rejects expired or mismatched invitation tokens without creating a membership', function () {
    $setup = invitationSetup();
    $invitation = OrganisationInvitation::create([
        'organisation_id' => $setup['organisation']->id,
        'email' => 'expected@example.test',
        'token_hash' => hash('sha256', str_repeat('a', 64)),
        'expires_at' => now()->subMinute(),
    ]);
    $user = User::factory()->create(['email' => 'different@example.test']);

    $this->postJson('/api/organisation/invitations/accept', ['token' => str_repeat('a', 64)], invitationHeaders($user))
        ->assertUnprocessable()->assertJsonValidationErrors('invitation_token');

    expect($invitation->fresh()->accepted_at)->toBeNull()
        ->and($user->organisations()->exists())->toBeFalse();
});

it('requires the emailed temporary password to sign in to a new invited account', function () {
    Notification::fake();
    $setup = invitationSetup();
    $email = 'new.password-check@example.test';
    $this->postJson('/api/organisation/invitations', ['email' => $email], invitationHeaders($setup['admin']))
        ->assertCreated();

    Notification::assertSentOnDemand(
        OrganisationInvitationNotification::class,
        fn ($notification): bool => $notification->temporaryPassword !== null
    );

    Auth::forgetGuards();
    $this->postJson('/api/auth/login', [
        'email' => $email,
        'password' => 'not-the-temporary-password',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');

    expect(User::where('email', $email)->exists())->toBeTrue()
        ->and(User::where('email', $email)->value('must_change_password'))->toBeTrue();
});

it('repairs an older pending invitation when the admin resends it', function () {
    Notification::fake();
    $setup = invitationSetup();
    $email = 'resend.invitee@example.test';
    $oldToken = str_repeat('a', 64);
    $oldInvitation = OrganisationInvitation::create([
        'organisation_id' => $setup['organisation']->id,
        'invited_by' => $setup['admin']->id,
        'email' => $email,
        'token_hash' => hash('sha256', $oldToken),
        'expires_at' => now()->addDays(7),
    ]);

    $this->postJson('/api/organisation/invitations', ['email' => $email], invitationHeaders($setup['admin']))
        ->assertOk();

    $user = User::where('email', $email)->firstOrFail();
    $invitation = $oldInvitation->fresh();
    expect($user->must_change_password)->toBeTrue()
        ->and($invitation->token_hash)->not->toBe(hash('sha256', $oldToken))
        ->and($invitation->temporary_password_hash)->not->toBeNull();

    Notification::assertSentOnDemand(OrganisationInvitationNotification::class, function ($notification): bool {
        return $notification->temporaryPassword !== null;
    });
});

it('links invitation email to the Organisation App acceptance route', function () {
    config(['app.organisation_app_url' => 'http://localhost:3000/']);
    $organisation = Organisation::factory()->create(['name' => 'Acme Foundation']);
    $token = str_repeat('a', 64);

    $mail = (new OrganisationInvitationNotification($organisation, $token))->toMail(new stdClass);

    expect($mail->actionUrl)->toBe(
        'http://localhost:3000/invitations/accept?invitation_token='.$token
    );
});
