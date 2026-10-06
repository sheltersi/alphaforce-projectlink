<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\OrganisationController;
use App\Http\Controllers\Api\OrganisationTimesheetController;
use App\Http\Controllers\Api\OrganisationUserController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TimesheetController;
use App\Http\Controllers\ParticipantController;
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

    // Manager-only timesheet review queue (Project Manager workflow).
    Route::get('organisation/timesheets', [OrganisationTimesheetController::class, 'index'])
        ->name('api.organisation.timesheets.index');
    Route::post('organisation/timesheets/{entry}/approve', [OrganisationTimesheetController::class, 'approve'])
        ->name('api.organisation.timesheets.approve');
    Route::post('organisation/timesheets/{entry}/reject', [OrganisationTimesheetController::class, 'reject'])
        ->name('api.organisation.timesheets.reject');
});

// participants
Route::middleware('auth:sanctum')->group(function () {
    Route::get('participants', [ParticipantController::class, 'participants'])
        ->name('api.participants.index');
    Route::get('participants/{participant}', [ParticipantController::class, 'showParticipant'])
        ->name('api.participants.show');
});

/*
|--------------------------------------------------------------------------
| Participant App timesheet API (Phases 1–3)
|--------------------------------------------------------------------------
|
| Stateless Sanctum token API for the participant calendar. Every query
| is scoped to the authenticated participant's own assignments;
| review/approval is manager-only via the organisation timesheet
| endpoints above.
|
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('timesheets/summary', [TimesheetController::class, 'summary'])
        ->name('api.timesheets.summary');
    Route::post('timesheets/submit', [TimesheetController::class, 'submitWeek'])
        ->name('api.timesheets.submit-week');
    Route::get('timesheets', [TimesheetController::class, 'index'])
        ->name('api.timesheets.index');
    Route::post('timesheets', [TimesheetController::class, 'store'])
        ->name('api.timesheets.store');
    Route::get('timesheets/{timesheet}', [TimesheetController::class, 'show'])
        ->name('api.timesheets.show');
    Route::put('timesheets/{timesheet}', [TimesheetController::class, 'update'])
        ->name('api.timesheets.update');
    Route::delete('timesheets/{timesheet}', [TimesheetController::class, 'destroy'])
        ->name('api.timesheets.destroy');
    Route::post('timesheets/{timesheet}/submit', [TimesheetController::class, 'submit'])
        ->name('api.timesheets.submit');
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
    Route::get('projects/{project}/roles', [ProjectController::class, 'participantRoles'])
        ->name('api.projects.roles.index');
    Route::get('projects/{project}/participants/{participant}', [ProjectController::class, 'showParticipant'])
        ->name('api.projects.participants.show');
    Route::patch('projects/{project}/participants/{participant}', [ProjectController::class, 'updateParticipant'])
        ->name('api.projects.participants.update');
    Route::post('projects/{project}/participants/{participant}/status', [ProjectController::class, 'updateParticipantStatus'])
        ->name('api.projects.participants.status');
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
