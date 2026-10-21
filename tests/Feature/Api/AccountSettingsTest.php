<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

it('lets an authenticated user update their account name and email', function () {
    $user = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'original@example.test',
        'email_verified_at' => now(),
    ]);
    $headers = ['Authorization' => 'Bearer '.$user->createToken('account-settings-test')->plainTextToken];
    Auth::forgetGuards();

    $this->putJson('/api/auth/profile', [
        'name' => 'Updated Name',
        'email' => 'updated@example.test',
    ], $headers)
        ->assertOk()
        ->assertJsonPath('data.name', 'Updated Name')
        ->assertJsonPath('data.email', 'updated@example.test')
        ->assertJsonPath('data.email_verified_at', null)
        ->assertJsonPath('message', 'Account details updated.');

    expect($user->fresh()->name)->toBe('Updated Name')
        ->and($user->fresh()->email)->toBe('updated@example.test')
        ->and($user->fresh()->email_verified_at)->toBeNull();
});

it('rejects an account email already used by another user', function () {
    $user = User::factory()->create();
    User::factory()->create(['email' => 'taken@example.test']);
    $headers = ['Authorization' => 'Bearer '.$user->createToken('account-settings-test')->plainTextToken];
    Auth::forgetGuards();

    $this->putJson('/api/auth/profile', [
        'name' => $user->name,
        'email' => 'taken@example.test',
    ], $headers)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

it('lets an authenticated user change their password after confirming the current password', function () {
    $user = User::factory()->create(['password' => 'Current-password123!']);
    $headers = ['Authorization' => 'Bearer '.$user->createToken('account-settings-test')->plainTextToken];
    Auth::forgetGuards();

    $this->putJson('/api/auth/password', [
        'current_password' => 'Current-password123!',
        'password' => 'A-different-password123!',
        'password_confirmation' => 'A-different-password123!',
    ], $headers)
        ->assertOk()
        ->assertJsonPath('message', 'Password updated.');

    expect(Hash::check('A-different-password123!', $user->fresh()->password))->toBeTrue();
});
