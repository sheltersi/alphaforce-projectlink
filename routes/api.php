<?php

use App\Http\Controllers\Api\AuthController;
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
    Route::name('api.')->group(function () {
        Route::apiResource('projects', ProjectController::class);
    });

    Route::post('projects/{project}/publish', [ProjectController::class, 'publish'])
        ->name('api.projects.publish');
    Route::post('projects/{project}/unpublish', [ProjectController::class, 'unpublish'])
        ->name('api.projects.unpublish');
    Route::post('projects/{project}/close', [ProjectController::class, 'close'])
        ->name('api.projects.close');
    Route::post('projects/{project}/archive', [ProjectController::class, 'archive'])
        ->name('api.projects.archive');
});
