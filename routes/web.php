<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::redirect('onboarding', 'onboarding/build-profile');
    Route::inertia('onboarding/build-profile', 'onboarding/build-profile')->name(
        'onboarding.build-profile',
    );
    Route::inertia('onboarding/profile-preview', 'onboarding/profile-preview')->name(
        'onboarding.profile-preview',
    );
});

Route::middleware(['auth', 'verified', 'ensure.participant.profile'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
