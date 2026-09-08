<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreParticipantProfileRequest;
use App\Models\ParticipantDocument;
use App\Services\ParticipantProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ParticipantProfileController extends Controller
{
    public function __construct(
        private readonly ParticipantProfileService $profiles,
    ) {}

    public function show(Request $request): JsonResponse|InertiaResponse
    {
        $profile = $this->profiles->findForUser($request->user());

        if (! $profile) {
            return $this->wantsJson($request)
                ? response()->json(['profile' => null])
                : Inertia::render('onboarding/build-profile', ['profile' => null]);
        }

        $payload = $this->profiles->toPayload($profile);

        return $this->wantsJson($request)
            ? response()->json(['profile' => $payload])
            : Inertia::render('onboarding/build-profile', ['profile' => $payload]);
    }

    public function store(StoreParticipantProfileRequest $request): JsonResponse|RedirectResponse
    {
        $profile = $this->profiles->upsert($request->user(), $request->validated(), $request);
        $payload = $this->profiles->toPayload($profile);

        if ($this->wantsJson($request)) {
            return response()->json([
                'message' => 'Profile saved successfully.',
                'profile' => $payload,
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Profile saved successfully.']);

        return redirect()->route('onboarding.profile-preview');
    }

    public function update(StoreParticipantProfileRequest $request): JsonResponse|RedirectResponse
    {
        return $this->store($request);
    }

    public function downloadDocument(Request $request, int $documentId)
    {
        $doc = ParticipantDocument::with('participantProfile.user')->findOrFail($documentId);
        $user = $request->user();

        $isOwner = $doc->participantProfile->user_id === $user->id;
        $hasElevated = method_exists($user, 'hasAnyRole') ? $user->hasAnyRole(['technical_admin', 'project_manager']) : false;

        if (! $isOwner && ! $hasElevated) {
            abort(403);
        }

        if (! Storage::disk($doc->disk)->exists($doc->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk($doc->disk)->download($doc->file_path, $doc->original_name);
    }

    private function wantsJson(Request $request): bool
    {
        return $request->wantsJson() || $request->expectsJson() || $request->header('X-Inertia') === null;
    }
}
