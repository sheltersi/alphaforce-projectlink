<?php

use App\Models\Organisation;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/**
 * Build a Bearer header for the user. Resets resolved guards first: the
 * test application persists across requests within a test and Sanctum
 * would otherwise keep serving the first authenticated user.
 *
 * @return array<string, string>
 */
function onboardingHeaders(User $user): array
{
    Auth::forgetGuards();

    return ['Authorization' => 'Bearer '.$user->createToken('test-token')->plainTextToken];
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function registrationPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jordan Lee',
        'email' => 'jordan@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ], $overrides);
}

function registerOnboardedUser(string $email = 'owner@example.com'): User
{
    $response = test()->postJson('/api/auth/register', registrationPayload(['email' => $email]));
    $response->assertCreated();

    $user = User::where('email', $email)->firstOrFail();
    $headers = ['Authorization' => 'Bearer '.$response->json('token')];

    test()->putJson('/api/onboarding', [
        'name' => 'Example Organisation',
        'description' => 'A test organisation.',
        'email' => 'hello@example.org',
        'phone' => '+1-555-0100',
        'website' => 'https://example.org',
        'city' => 'Amsterdam',
        'country' => 'Netherlands',
    ], $headers)->assertOk();

    test()->postJson('/api/onboarding/complete', [], $headers)->assertOk();

    return $user->fresh();
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

it('registers a user with a token and pending onboarding', function () {
    $response = $this->postJson('/api/auth/register', registrationPayload());

    $response->assertCreated()
        ->assertJsonPath('data.email', 'jordan@example.com')
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonPath('onboarding.completed', false)
        ->assertJsonPath('onboarding.step', 'organisation')
        ->assertJsonStructure(['data', 'token']);

    $user = User::where('email', 'jordan@example.com')->firstOrFail();
    expect($user->roles)->toBeEmpty();
    expect($user->currentOrganisation())->toBeNull();
    $this->assertDatabaseMissing('organisations', ['created_by' => $user->id]);

    // The issued token authenticates subsequent requests.
    $this->getJson('/api/auth/me', ['Authorization' => 'Bearer '.$response->json('token')])
        ->assertOk()
        ->assertJsonPath('data.email', 'jordan@example.com')
        ->assertJsonPath('data.onboarding.completed', false);
});

it('rejects invalid registration data', function () {
    $this->postJson('/api/auth/register', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'password']);

    $this->postJson('/api/auth/register', registrationPayload(['email' => 'not-an-email']))
        ->assertStatus(422)->assertJsonValidationErrors('email');

    $this->postJson('/api/auth/register', registrationPayload([
        'password' => 'short', 'password_confirmation' => 'short',
    ]))->assertStatus(422)->assertJsonValidationErrors('password');

    $this->postJson('/api/auth/register', registrationPayload(['password_confirmation' => 'mismatch']))
        ->assertStatus(422)->assertJsonValidationErrors('password');
});

it('rejects duplicate emails on registration', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/auth/register', registrationPayload(['email' => 'taken@example.com']))
        ->assertStatus(422)->assertJsonValidationErrors('email');
});

it('reports incomplete onboarding for newly registered users', function () {
    $response = $this->postJson('/api/auth/register', registrationPayload());
    $headers = ['Authorization' => 'Bearer '.$response->json('token')];

    $this->getJson('/api/onboarding', $headers)
        ->assertOk()
        ->assertJsonPath('data.completed', false)
        ->assertJsonPath('data.step', 'organisation')
        ->assertJsonPath('data.organisation', null);
});

// ---------------------------------------------------------------------------
// Onboarding status and progressive saves
// ---------------------------------------------------------------------------

it('rejects unauthenticated onboarding access', function () {
    $this->getJson('/api/onboarding')->assertUnauthorized();
    $this->putJson('/api/onboarding', ['name' => 'Nope'])->assertUnauthorized();
    $this->postJson('/api/onboarding/complete')->assertUnauthorized();
});

it('saves onboarding information progressively', function () {
    $response = $this->postJson('/api/auth/register', registrationPayload());
    $headers = ['Authorization' => 'Bearer '.$response->json('token')];
    $user = User::where('email', 'jordan@example.com')->firstOrFail();

    $this->putJson('/api/onboarding', ['name' => 'Example Organisation'], $headers)
        ->assertOk()
        ->assertJsonPath('data.name', 'Example Organisation')
        ->assertJsonPath('data.description', null)
        ->assertJsonPath('onboarding.completed', false);

    // Later sessions keep earlier progress and add to it.
    $this->putJson('/api/onboarding', [
        'email' => 'hello@example.org',
        'city' => 'Amsterdam',
    ], $headers)->assertOk();

    $draft = $user->fresh()->onboardingDraft();
    expect($draft->name)->toBe('Example Organisation');
    expect($draft->email)->toBe('hello@example.org');
    expect($draft->city)->toBe('Amsterdam');

    // The draft is not a membership yet: Phase 1 endpoints stay forbidden.
    $this->getJson('/api/organisation', $headers)->assertForbidden();

    $this->getJson('/api/onboarding', $headers)
        ->assertOk()
        ->assertJsonPath('data.completed', false)
        ->assertJsonPath('data.organisation.name', 'Example Organisation');
});

it('updates previously saved onboarding information', function () {
    $response = $this->postJson('/api/auth/register', registrationPayload());
    $headers = ['Authorization' => 'Bearer '.$response->json('token')];

    $this->putJson('/api/onboarding', ['name' => 'First Name'], $headers)->assertOk();

    $this->putJson('/api/onboarding', ['name' => 'Second Name'], $headers)
        ->assertOk()
        ->assertJsonPath('data.name', 'Second Name');

    expect(Organisation::where('name', 'Second Name')->count())->toBe(1);
    expect(Organisation::where('name', 'First Name')->count())->toBe(0);
});

it('isolates onboarding drafts between users', function () {
    $this->postJson('/api/auth/register', registrationPayload(['email' => 'a@example.com']))->assertCreated();
    $this->postJson('/api/auth/register', registrationPayload([
        'name' => 'Kim Ray', 'email' => 'b@example.com',
    ]))->assertCreated();

    $userA = User::where('email', 'a@example.com')->firstOrFail();
    $userB = User::where('email', 'b@example.com')->firstOrFail();

    $this->putJson('/api/onboarding', ['name' => 'Org A'], onboardingHeaders($userA))->assertOk();
    $this->putJson('/api/onboarding', ['name' => 'Org B'], onboardingHeaders($userB))->assertOk();

    $this->getJson('/api/onboarding', onboardingHeaders($userA))
        ->assertOk()->assertJsonPath('data.organisation.name', 'Org A');
    $this->getJson('/api/onboarding', onboardingHeaders($userB))
        ->assertOk()->assertJsonPath('data.organisation.name', 'Org B');
});

// ---------------------------------------------------------------------------
// Completion
// ---------------------------------------------------------------------------

it('requires an organisation name before completing onboarding', function () {
    $response = $this->postJson('/api/auth/register', registrationPayload());
    $headers = ['Authorization' => 'Bearer '.$response->json('token')];

    $this->postJson('/api/onboarding/complete', [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('name');

    $this->putJson('/api/onboarding', ['city' => 'Amsterdam'], $headers)->assertOk();

    $this->postJson('/api/onboarding/complete', [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('name');
});

it('completes onboarding and makes the user technical admin', function () {
    $response = $this->postJson('/api/auth/register', registrationPayload());
    $headers = ['Authorization' => 'Bearer '.$response->json('token')];
    $user = User::where('email', 'jordan@example.com')->firstOrFail();

    $this->putJson('/api/onboarding', [
        'name' => 'Example Organisation',
        'description' => 'A test organisation.',
        'email' => 'hello@example.org',
        'city' => 'Amsterdam',
        'country' => 'Netherlands',
    ], $headers)->assertOk();

    $completed = $this->postJson('/api/onboarding/complete', [], $headers)
        ->assertOk()
        ->assertJsonPath('data.organisation.name', 'Example Organisation')
        ->assertJsonPath('data.user.email', 'jordan@example.com')
        ->assertJsonPath('message', 'Onboarding completed.');

    $organisationId = $completed->json('data.organisation.id');

    $user = $user->fresh();
    expect($user->hasRole('technical_admin'))->toBeTrue();
    expect($user->belongsToOrganisation($organisationId))->toBeTrue();
    expect($user->organisationRole($organisationId))->toBe('admin');

    $this->assertDatabaseHas('organisations', [
        'id' => $organisationId,
        'name' => 'Example Organisation',
        'created_by' => $user->id,
    ]);
    $this->assertDatabaseHas('organisation_users', [
        'organisation_id' => $organisationId,
        'user_id' => $user->id,
        'role' => 'admin',
    ]);

    // Frontend routing state reflects completion everywhere.
    $this->getJson('/api/onboarding', $headers)
        ->assertOk()
        ->assertJsonPath('data.completed', true)
        ->assertJsonPath('data.step', null)
        ->assertJsonPath('data.organisation.id', $organisationId);

    $this->getJson('/api/auth/me', $headers)
        ->assertOk()
        ->assertJsonPath('data.onboarding.completed', true)
        ->assertJsonPath('data.current_organisation.id', $organisationId)
        ->assertJsonPath('data.current_organisation.role', 'admin');

    // Phase 1 endpoints are now accessible.
    $this->getJson('/api/organisation', $headers)
        ->assertOk()->assertJsonPath('data.id', $organisationId);
});

it('does not allow completing onboarding twice', function () {
    $user = registerOnboardedUser();
    $headers = onboardingHeaders($user);

    $this->postJson('/api/onboarding/complete', [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('onboarding');

    $this->putJson('/api/onboarding', ['name' => 'Another Org'], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('onboarding');

    expect($user->organisations()->count())->toBe(1);
});

it('treats users with an existing membership as onboarded', function () {
    $org = Organisation::factory()->create();
    $manager = User::factory()->create();
    $manager->assignRole('project_manager');
    $org->users()->attach($manager->id, ['role' => 'manager']);

    $headers = onboardingHeaders($manager);

    $this->getJson('/api/onboarding', $headers)
        ->assertOk()
        ->assertJsonPath('data.completed', true)
        ->assertJsonPath('data.organisation.id', $org->id);

    $this->putJson('/api/onboarding', ['name' => 'Hijack'], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('onboarding');

    $this->postJson('/api/onboarding/complete', [], $headers)
        ->assertStatus(422)->assertJsonValidationErrors('onboarding');
});
