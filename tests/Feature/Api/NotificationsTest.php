<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/** @return array<string, string> */
function notificationsApiHeaders(User $user): array
{
    Auth::forgetGuards();

    return ['Authorization' => 'Bearer '.$user->createToken('notifications-test')->plainTextToken];
}

/** @param array<string, mixed> $data */
function makeStoredNotification(User $user, array $data, ?string $readAt = null): string
{
    $id = (string) Str::uuid();
    $user->notifications()->create([
        'id' => $id,
        'type' => 'App\\Notifications\\TestNotification',
        'data' => $data,
        'read_at' => $readAt,
    ]);

    return $id;
}

it('lists only the authenticated user’s notifications with unread count', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $unreadId = makeStoredNotification($user, [
        'title' => 'Project assigned',
        'message' => 'You have a new project.',
        'action_label' => 'View projects',
        'action_url' => '/projects',
    ]);
    makeStoredNotification($user, ['title' => 'Already read'], now()->toISOString());
    makeStoredNotification($otherUser, ['title' => 'Private to another user']);

    $this->getJson('/api/notifications', notificationsApiHeaders($user))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('unread_count', 1)
        ->assertJsonPath('data.0.action_url', '/projects')
        ->assertJsonFragment(['id' => $unreadId, 'title' => 'Project assigned']);
});

it('lets a user mark their notifications read without exposing another user’s records', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $firstId = makeStoredNotification($user, ['title' => 'First update', 'message' => 'First update']);
    $secondId = makeStoredNotification($user, ['title' => 'Second update', 'message' => 'Second update']);
    $otherId = makeStoredNotification($otherUser, ['title' => 'Not yours']);
    $headers = notificationsApiHeaders($user);

    $marked = $this->postJson("/api/notifications/{$firstId}/read", [], $headers)
        ->assertOk()
        ->assertJsonPath('data.title', 'First update')
        ->assertJsonPath('data.body.0', 'First update')
        ->assertJsonPath('unread_count', 1);
    expect($marked->json('data.read_at'))->toBeString();
    $this->postJson("/api/notifications/{$otherId}/read", [], $headers)->assertNotFound();
    $this->postJson('/api/notifications/read-all', [], $headers)
        ->assertOk()
        ->assertJsonPath('unread_count', 0);

    expect($user->notifications()->whereKey($firstId)->first()->read_at)->not->toBeNull()
        ->and($user->notifications()->whereKey($secondId)->first()->read_at)->not->toBeNull()
        ->and($otherUser->notifications()->whereKey($otherId)->first()->read_at)->toBeNull();
});

it('requires authentication to access notifications', function () {
    $this->getJson('/api/notifications')->assertUnauthorized();
    $this->getJson('/api/notifications/unread-count')->assertUnauthorized();
});
