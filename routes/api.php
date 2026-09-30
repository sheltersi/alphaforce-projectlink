<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\OrganisationController;
use App\Http\Controllers\Api\OrganisationUserController;
use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Organisation App API (Phases 1–2)
|--------------------------------------------------------------------------
|
| Stateless Sanctum token API consumed by the separate organisation
| frontend. Clients authenticate with a Bearer personal access token
| issued by the login endpoint; no session or cookies are required.
|
*/

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:login')
        ->name('api.auth.login');

    Route::post('register', [AuthController::class, 'register'])
        ->middleware('throttle:10,1')
        ->name('api.auth.register');

    Route::post('logout', [AuthController::class, 'logout'])
        ->middleware('auth:sanctum')
        ->name('api.auth.logout');

    Route::get('me', [AuthController::class, 'me'])
        ->middleware('auth:sanctum')
        ->name('api.auth.me');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('organisation', [OrganisationController::class, 'show'])
        ->name('api.organisation.show');
    Route::put('organisation', [OrganisationController::class, 'update'])
        ->name('api.organisation.update');

    Route::get('organisation/users', [OrganisationUserController::class, 'index'])
        ->name('api.organisation.users.index');
    Route::get('organisation/users/{user}', [OrganisationUserController::class, 'show'])
        ->name('api.organisation.users.show');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'show'])
        ->name('api.onboarding.show');
    Route::put('onboarding', [OnboardingController::class, 'update'])
        ->name('api.onboarding.update');
    Route::post('onboarding/complete', [OnboardingController::class, 'complete'])
        ->name('api.onboarding.complete');

    Route::name('api.')->group(function () {
        Route::apiResource('projects', ProjectController::class);
    });

    Route::get('projects/{project}/applications', [ProjectController::class, 'applications'])
        ->name('api.projects.applications.index');
    Route::get('projects/{project}/participants', [ProjectController::class, 'participants'])
        ->name('api.projects.participants.index');
    Route::get('projects/{project}/applications/{application}', [ProjectController::class, 'showApplication'])
        ->name('api.projects.applications.show');
    Route::patch('projects/{project}/applications/{application}', [ProjectController::class, 'updateApplication'])
        ->name('api.projects.applications.update');
    Route::post('projects/{project}/publish', [ProjectController::class, 'publish'])
        ->name('api.projects.publish');
    Route::post('projects/{project}/unpublish', [ProjectController::class, 'unpublish'])
        ->name('api.projects.unpublish');
    Route::post('projects/{project}/close', [ProjectController::class, 'close'])
        ->name('api.projects.close');
    Route::post('projects/{project}/archive', [ProjectController::class, 'archive'])
        ->name('api.projects.archive');
});
