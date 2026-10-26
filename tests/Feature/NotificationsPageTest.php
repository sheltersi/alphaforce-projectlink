<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('notifications page lists the users activity and exposes read actions', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $unread = $user->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'App\\Notifications\\ProjectApplicationAccepted',
        'data' => [
            'title' => 'Application accepted',
            'message' => 'Your application was accepted.',
            'body' => ['The project team will contact you.'],
            'action_label' => 'View projects',
            'action_url' => '/projects',
        ],
    ]);
    $read = $user->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'App\\Notifications\\ProjectApplicationRejected',
        'data' => [
            'title' => 'Application update',
            'message' => 'Your application was not successful.',
            'action_label' => 'External link',
            'action_url' => 'https://outside.example/path',
        ],
        'created_at' => now()->subMinute(),
        'read_at' => now(),
    ]);
    $otherUser = User::factory()->create();
    $otherNotification = $otherUser->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'TestNotification',
        'data' => ['title' => 'Private update'],
    ]);

    $this->actingAs($user)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notifications/index')
            ->has('notifications', 2)
            ->where('unreadCount', 1)
            ->where('notifications.0.id', $unread->id)
            ->where('notifications.1.id', $read->id)
            ->where('notifications.0.actionUrl', '/projects')
            ->where('notifications.1.actionUrl', null),
        );

    $this->actingAs($user)
        ->post(route('notifications.read', $unread->id))
        ->assertRedirect();
    expect($unread->fresh()->read_at)->not->toBeNull();

    $this->actingAs($user)
        ->post(route('notifications.read-all'))
        ->assertRedirect();
    expect($user->fresh()->unreadNotifications()->count())->toBe(0);

    $this->actingAs($user)
        ->post(route('notifications.read', $otherNotification->id))
        ->assertNotFound();
    expect($otherNotification->fresh()->read_at)->toBeNull();
});
