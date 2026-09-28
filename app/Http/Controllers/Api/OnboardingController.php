<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\OnboardingRequest;
use App\Http\Resources\Organisation\AuthenticatedUserResource;
use App\Http\Resources\Organisation\OrganisationResource;
use App\Models\Organisation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

/**
 * Organisation onboarding for newly registered users.
 *
 * No dedicated onboarding tables: progress is an `organisations` draft row
 * owned by the user (`created_by`, no membership yet), and completion is
 * the membership itself. Drafts are invisible to organisation-scoped
 * endpoints, which all resolve through memberships.
 */
class OnboardingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($organisation = $user->currentOrganisation()) {
            return $this->status(true, null, $organisation, $request);
        }

        return $this->status(false, 'organisation', $user->onboardingDraft(), $request);
    }

    public function update(OnboardingRequest $request): OrganisationResource
    {
        $user = $request->user();

        if ($user->currentOrganisation() !== null) {
            throw ValidationException::withMessages([
                'onboarding' => ['Onboarding has already been completed. Manage your organisation via the organisation endpoints.'],
            ]);
        }

        $draft = $user->onboardingDraft();

        if ($draft === null) {
            // `organisations.name` is NOT NULL, so drafts start with an
            // empty placeholder; completion requires a real name.
            $draft = Organisation::create(array_merge(
                ['created_by' => $user->id, 'name' => ''],
                $request->validated()
            ));
        } else {
            $draft->update($request->validated());
        }

        return (new OrganisationResource($draft->fresh()))
            ->additional([
                'message' => 'Onboarding information saved.',
                'onboarding' => ['completed' => false, 'step' => 'organisation'],
            ]);
    }

    public function complete(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->currentOrganisation() !== null) {
            throw ValidationException::withMessages([
                'onboarding' => ['Onboarding has already been completed.'],
            ]);
        }

        $draft = $user->onboardingDraft();

        if ($draft === null || empty($draft->name)) {
            throw ValidationException::withMessages([
                'name' => ['Organisation name is required to complete onboarding.'],
            ]);
        }

        DB::transaction(function () use ($user, $draft): void {
            $draft->users()->syncWithoutDetaching([$user->id => ['role' => 'admin']]);
            // Explicit web-guard role: under API authentication Spatie would
            // otherwise resolve the role against the sanctum guard.
            $user->assignRole(Role::findByName('technical_admin', 'web'));
        });

        $organisation = $draft->fresh();
        $user->load(['roles', 'organisations']);

        return response()->json([
            'data' => [
                'organisation' => (new OrganisationResource($organisation))->resolve($request),
                'user' => (new AuthenticatedUserResource($user))->resolve($request),
            ],
            'message' => 'Onboarding completed.',
        ]);
    }

    protected function status(bool $completed, ?string $step, ?Organisation $organisation, Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'completed' => $completed,
                'step' => $step,
                'organisation' => $organisation === null
                    ? null
                    : (new OrganisationResource($organisation))->resolve($request),
            ],
        ]);
    }
}
