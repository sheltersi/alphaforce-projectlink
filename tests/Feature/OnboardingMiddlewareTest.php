<?php

use App\Models\ParticipantProfile;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('participant without profile is redirected from dashboard to onboarding', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('participant');

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertRedirect(route('onboarding.build-profile'));
});

test('participant without profile can access onboarding', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('participant');

    $response = $this->actingAs($user)->get('/onboarding/build-profile');

    $response->assertOk();
});

test('participant with profile can access dashboard', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('participant');
    $profile = ParticipantProfile::create([
        'user_id' => $user->id,
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => $user->email,
        'id_number' => 'ID-12345',
        'phone' => '+260 97 000 0000',
        'nationality' => 'Zambian',
        'city' => 'Lusaka',
        'country' => 'Zambia',
        'summary' => str_repeat('A complete participant profile summary. ', 2),
    ]);
    Skill::create(['participant_profile_id' => $profile->id, 'name' => 'Research']);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
});

test('participant with an incomplete profile is redirected from dashboard to onboarding', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('participant');
    ParticipantProfile::create([
        'user_id' => $user->id,
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => $user->email,
        'summary' => 'Partial draft',
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertRedirect(route('onboarding.build-profile'));
});

test('technical_admin without profile can access dashboard', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('technical_admin');

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
});

test('project_manager without profile can access dashboard', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('project_manager');

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
});

test('unverified participant without profile is still redirected to onboarding', function () {
    $user = User::factory()->unverified()->create();
    $user->assignRole('participant');

    // Even unverified participants must complete onboarding before reaching the dashboard.
    // Onboarding itself is now auth-only (no verified required) so they can complete it.
    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertRedirect(route('onboarding.build-profile'));
});

test('unverified participant can still access onboarding', function () {
    $user = User::factory()->unverified()->create();
    $user->assignRole('participant');

    $response = $this->actingAs($user)->get('/onboarding/build-profile');

    $response->assertOk();
});
