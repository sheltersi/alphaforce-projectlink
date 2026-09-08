<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::redirect('onboarding', 'onboarding/build-profile');
    Route::inertia('onboarding/build-profile', 'onboarding/build-profile')->name(
        'onboarding.build-profile',
    );
    Route::inertia('onboarding/profile-preview', 'onboarding/profile-preview')->name(
        'onboarding.profile-preview',
    );
});

require __DIR__.'/settings.php';
