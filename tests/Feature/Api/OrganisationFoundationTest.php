<?php

use App\Models\Organisation;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/**
 * @return array{org: Organisation, otherOrg: Organisation, admin: User, manager: User, participant: User, outsider: User, otherAdmin: User}
 */
function makeOrganisationSetup(): array
{
    $org = Organisation::factory()->create();
    $otherOrg = Organisation::factory()->create();

    $admin = User::factory()->create();
    $admin->assignRole('technical_admin');
    $org->users()->attach($admin->id, ['role' => 'admin']);

    $manager = User::factory()->create();
    $manager->assignRole('project_manager');
    $org->users()->attach($manager->id, ['role' => 'manager']);

    $participant = User::factory()->create();
    $participant->assignRole('participant');
    $org->users()->attach($participant->id, ['role' => 'member']);

    $outsider = User::factory()->create();
    $outsider->assignRole('project_manager');

    $otherAdmin = User::factory()->create();
    $otherAdmin->assignRole('technical_admin');
    $otherOrg->users()->attach($otherAdmin->id, ['role' => 'admin']);

    return compact('org', 'otherOrg', 'admin', 'manager', 'participant', 'outsider', 'otherAdmin');
}

/**
 * Authenticate as the given user via a real Sanctum Bearer token,
 * exercising the same token flow the separate frontend uses.
 *
 * @return array{0: User, 1: array<string, string>}
 */
function asBearer(User $user): array
{
    $token = $user->createToken('test-token')->plainTextToken;

    return [$user, ['Authorization' => "Bearer {$token}"]];
}

it('logs in with valid credentials and issues a token', function () {
    ['admin' => $admin, 'org' => $org] = makeOrganisationSetup();

    $response = $this->postJson('/api/auth/login', [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.email', $admin->email)
        ->assertJsonPath('message', 'Authenticated.')
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonStructure(['data', 'token']);

    expect($response->json('data.roles'))->toContain('technical_admin');
    expect($response->json('data.organisations.0'))->toMatchArray([
        'id' => $org->id,
        'role' => 'admin',
    ]);

    $this->assertDatabaseHas('personal_access_tokens', [
        'tokenable_id' => $admin->id,
        'tokenable_type' => User::class,
        'name' => 'organisation-app',
    ]);

    // The issued token authenticates subsequent requests.
    $this->getJson('/api/auth/me', ['Authorization' => 'Bearer '.$response->json('token')])
        ->assertOk()
        ->assertJsonPath('data.email', $admin->email);
});

it('rejects invalid credentials', function () {
    ['admin' => $admin] = makeOrganisationSetup();

    $response = $this->postJson('/api/auth/login', [
        'email' => $admin->email,
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(422)->assertJsonValidationErrors('email');
    $this->assertGuest('sanctum');
});

it('validates login input', function () {
    $response = $this->postJson('/api/auth/login', []);

    $response->assertStatus(422)->assertJsonValidationErrors(['email', 'password']);
    $this->assertGuest('sanctum');
});

it('returns the authenticated user with organisation and role information', function () {
    ['admin' => $admin, 'org' => $org] = makeOrganisationSetup();
    [, $headers] = asBearer($admin);

    $response = $this->getJson('/api/auth/me', $headers);

    $response->assertOk()
        ->assertJsonPath('data.id', $admin->id)
        ->assertJsonPath('data.email', $admin->email);

    expect($response->json('data.roles'))->toContain('technical_admin');
    expect($response->json('data.organisations.0'))->toMatchArray([
        'id' => $org->id,
        'name' => $org->name,
        'role' => 'admin',
    ]);

    $json = $response->json('data');
    expect($json)->not->toHaveKeys(['password', 'remember_token', 'two_factor_secret']);
});

it('rejects unauthenticated access', function () {
    $user = User::factory()->create();

    $this->getJson('/api/auth/me')->assertUnauthorized();
    $this->postJson('/api/auth/logout')->assertUnauthorized();
    $this->getJson('/api/organisation')->assertUnauthorized();
    $this->putJson('/api/organisation', ['name' => 'Nope'])->assertUnauthorized();
    $this->getJson('/api/organisation/users')->assertUnauthorized();
    $this->getJson("/api/organisation/users/{$user->id}")->assertUnauthorized();
});

it('rejects invalid tokens', function () {
    $this->getJson('/api/auth/me', ['Authorization' => 'Bearer invalid-token'])
        ->assertUnauthorized();
});

it('shows the authenticated organisation with the viewer role', function () {
    ['admin' => $admin, 'org' => $org] = makeOrganisationSetup();
    [, $headers] = asBearer($admin);

    $response = $this->getJson('/api/organisation', $headers);

    $response->assertOk()
        ->assertJsonPath('data.id', $org->id)
        ->assertJsonPath('data.name', $org->name)
        ->assertJsonPath('data.my_role', 'admin');

    expect($response->json('data'))->toHaveKeys([
        'id', 'name', 'slug', 'description', 'email', 'phone',
        'website', 'logo_url', 'city', 'country', 'my_role',
    ]);

    $response->assertJsonMissing(['created_by' => $org->created_by]);
});

it('lets a technical admin update the organisation', function () {
    ['admin' => $admin, 'org' => $org] = makeOrganisationSetup();
    [, $headers] = asBearer($admin);

    $response = $this->putJson('/api/organisation', [
        'name' => 'Renamed Organisation',
        'city' => 'Utrecht',
    ], $headers);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Renamed Organisation')
        ->assertJsonPath('data.city', 'Utrecht')
        ->assertJsonPath('message', 'Organisation updated.');

    expect($org->fresh()->only(['name', 'city']))->toMatchArray([
        'name' => 'Renamed Organisation',
        'city' => 'Utrecht',
    ]);
});

it('validates organisation updates', function () {
    ['admin' => $admin] = makeOrganisationSetup();
    [, $headers] = asBearer($admin);

    $response = $this->putJson('/api/organisation', [
        'email' => 'not-an-email',
        'website' => 'not-a-url',
    ], $headers);

    $response->assertStatus(422)->assertJsonValidationErrors(['email', 'website']);
});

it('allows project managers to view but not update the organisation', function () {
    ['manager' => $manager, 'org' => $org] = makeOrganisationSetup();
    [, $headers] = asBearer($manager);

    $this->getJson('/api/organisation', $headers)
        ->assertOk()
        ->assertJsonPath('data.id', $org->id)
        ->assertJsonPath('data.my_role', 'manager');

    $this->putJson('/api/organisation', ['name' => 'Hijacked'], $headers)
        ->assertForbidden();

    expect($org->fresh()->name)->not->toBe('Hijacked');
});

it('denies participants organisation access', function () {
    ['participant' => $participant] = makeOrganisationSetup();
    [, $headers] = asBearer($participant);

    $this->getJson('/api/organisation', $headers)->assertForbidden();
    $this->getJson('/api/organisation/users', $headers)->assertForbidden();
    $this->putJson('/api/organisation', ['name' => 'Hijacked'], $headers)->assertForbidden();
});

it('denies users without an organisation', function () {
    ['outsider' => $outsider, 'admin' => $admin] = makeOrganisationSetup();
    [, $headers] = asBearer($outsider);

    $this->getJson('/api/organisation', $headers)->assertForbidden();
    $this->getJson('/api/organisation/users', $headers)->assertForbidden();
    $this->getJson("/api/organisation/users/{$admin->id}", $headers)->assertForbidden();
});

it('lists organisation users with role and status', function () {
    ['admin' => $admin, 'manager' => $manager, 'participant' => $participant, 'otherAdmin' => $otherAdmin] = makeOrganisationSetup();
    [, $headers] = asBearer($admin);

    $response = $this->getJson('/api/organisation/users', $headers);

    $response->assertOk()->assertJsonStructure([
        'data' => [['id', 'name', 'email', 'role', 'status', 'created_at']],
        'links',
        'meta',
    ]);

    $emails = collect($response->json('data'))->pluck('email');
    expect($emails)->toContain($admin->email, $manager->email, $participant->email)
        ->and($emails)->not->toContain($otherAdmin->email);

    $byEmail = collect($response->json('data'))->keyBy('email');
    expect($byEmail[$admin->email])->toMatchArray(['role' => 'admin', 'status' => 'verified']);
    expect($byEmail[$participant->email])->toMatchArray(['role' => 'member', 'status' => 'verified']);

    $response->assertJsonMissing(['password']);
});

it('shows a single organisation user', function () {
    ['manager' => $manager, 'participant' => $participant] = makeOrganisationSetup();
    [, $headers] = asBearer($manager);

    $this->getJson("/api/organisation/users/{$participant->id}", $headers)
        ->assertOk()
        ->assertJsonPath('data.id', $participant->id)
        ->assertJsonPath('data.email', $participant->email)
        ->assertJsonPath('data.role', 'member')
        ->assertJsonPath('data.status', 'verified');
});

it('marks unverified accounts accordingly', function () {
    ['admin' => $admin, 'org' => $org] = makeOrganisationSetup();
    [, $headers] = asBearer($admin);

    $unverified = User::factory()->unverified()->create();
    $unverified->assignRole('project_manager');
    $org->users()->attach($unverified->id, ['role' => 'manager']);

    $this->getJson("/api/organisation/users/{$unverified->id}", $headers)
        ->assertOk()
        ->assertJsonPath('data.status', 'unverified');
});

it('prevents access to another organisation users', function () {
    ['admin' => $admin, 'otherAdmin' => $otherAdmin] = makeOrganisationSetup();
    [, $headers] = asBearer($admin);

    $this->getJson("/api/organisation/users/{$otherAdmin->id}", $headers)->assertNotFound();
});

it('logs out by revoking the current token', function () {
    ['admin' => $admin] = makeOrganisationSetup();

    $token = $admin->createToken('organisation-app')->plainTextToken;
    $headers = ['Authorization' => "Bearer {$token}"];

    $this->postJson('/api/auth/logout', [], $headers)
        ->assertOk()
        ->assertJsonPath('message', 'Logged out.');

    $this->assertDatabaseMissing('personal_access_tokens', [
        'tokenable_id' => $admin->id,
        'name' => 'organisation-app',
    ]);

    // Drop the guard instance cached from the logout request so the revoked
    // token is re-validated from storage (fresh app boot in production).
    Auth::forgetGuards();

    // The revoked token no longer authenticates.
    $this->getJson('/api/auth/me', $headers)->assertUnauthorized();
});
