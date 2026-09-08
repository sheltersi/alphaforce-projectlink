<?php

use App\Http\Controllers\ParticipantProfileController;
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

    // Participant profile persistence – saves all onboarding form data
    Route::get('onboarding/profile', [ParticipantProfileController::class, 'show'])->name('onboarding.profile.show');
    Route::post('onboarding/profile', [ParticipantProfileController::class, 'store'])->name('onboarding.profile.store');
    Route::put('onboarding/profile', [ParticipantProfileController::class, 'update'])->name('onboarding.profile.update');
    Route::get('onboarding/profile/document/{document}/download', [ParticipantProfileController::class, 'downloadDocument'])->name('onboarding.profile.document.download');
});

Route::middleware(['auth', 'verified', 'ensure.participant.profile'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
