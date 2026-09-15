<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreParticipantProfileRequest;
use App\Models\ParticipantDocument;
use App\Models\ParticipantProfile;
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

    /**
     * Render the profile builder with the participant's saved profile (if any).
     */
    public function edit(Request $request): InertiaResponse
    {
        $profile = $this->profiles->findForUser($request->user());

        return Inertia::render('onboarding/build-profile', [
            'profile' => $profile ? $this->profiles->toPayload($profile) : null,
        ]);
    }

    /**
     * Render the profile preview from the database – never from local storage.
     */
    public function preview(Request $request): InertiaResponse|RedirectResponse
    {
        $profile = $this->profiles->findForUser($request->user());

        if (! $profile) {
            return redirect()->route('onboarding.build-profile');
        }

        return Inertia::render('onboarding/profile-preview', [
            'profile' => $this->profiles->toPayload($profile),
        ]);
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

        return $request->input('redirect_to') === 'dashboard'
            ? redirect()->route('dashboard')
            : redirect()->route('onboarding.profile-preview');
    }

    public function update(StoreParticipantProfileRequest $request): JsonResponse|RedirectResponse
    {
        return $this->store($request);
    }

    /**
     * Render the participant's digital resume, sourced directly from the
     * profile (skills, education, experience, certifications). If the user
     * hasn't built a profile yet, fall back to a soft empty state.
     */
    public function resume(Request $request): InertiaResponse|RedirectResponse
    {
        $profile = ParticipantProfile::with([
            'skills',
            'educations',
            'workExperiences',
            'certifications',
        ])->where('user_id', $request->user()->id)->first();

        if (! $profile) {
            return redirect()->route('onboarding.build-profile');
        }

        $resume = [
            'full_name' => $profile->full_name,
            'first_name' => $profile->first_name,
            'last_name' => $profile->last_name,
            'email' => $profile->email,
            'phone' => $profile->phone,
            'city' => $profile->city,
            'country' => $profile->country,
            'nationality' => $profile->nationality,
            'summary' => $profile->summary,
            'photo_url' => $profile->photo_path
                ? asset('storage/'.$profile->photo_path)
                : null,
            'skills' => $profile->skills->map(fn ($s) => ['name' => $s->name])->values(),
            'educations' => $profile->educations->map(fn ($e) => [
                'institution' => $e->institution,
                'qualification' => $e->qualification,
                'field_of_study' => $e->field_of_study,
                'start_year' => $e->start_year,
                'end_year' => $e->end_year,
                'description' => $e->description,
            ])->values(),
            'experiences' => $profile->workExperiences->map(fn ($w) => [
                'company' => $w->organisation,
                'role' => $w->job_title,
                'location' => $w->location,
                'description' => $w->description,
                'start_date' => $w->start_date?->format('M Y'),
                'end_date' => $w->end_date?->format('M Y'),
                'currently_working' => (bool) $w->currently_working,
            ])->values(),
            'certifications' => $profile->certifications->map(fn ($c) => [
                'name' => $c->name,
                'issuer' => $c->issuing_organisation,
                'credential_number' => $c->credential_number,
                'issue_date' => $c->issue_date?->format('M Y'),
                'expiry_date' => $c->expiry_date?->format('M Y'),
            ])->values(),
            'profile_strength' => $profile->isComplete() ? 100 : max(40, min(
                95,
                (int) round(
                    collect([
                        $profile->summary,
                        $profile->phone,
                        $profile->city,
                        $profile->nationality,
                        $profile->skills->isNotEmpty(),
                        $profile->educations->isNotEmpty(),
                        $profile->workExperiences->isNotEmpty(),
                        $profile->certifications->isNotEmpty(),
                    ])->filter(fn ($v) => (is_bool($v) && $v) || (is_string($v) && trim($v) !== ''))->count() * 12,
                ),
            )),
        ];

        return Inertia::render('resume/index', ['resume' => $resume]);
    }

    /**
     * Generate and download the participant's resume as a PDF.
     */
    public function downloadPdf(Request $request)
    {
        $profile = ParticipantProfile::with([
            'skills',
            'educations',
            'workExperiences',
            'certifications',
        ])->where('user_id', $request->user()->id)->first();

        if (! $profile) {
            abort(404, 'Profile not found.');
        }

        $resume = [
            'full_name' => $profile->full_name,
            'first_name' => $profile->first_name,
            'last_name' => $profile->last_name,
            'email' => $profile->email,
            'phone' => $profile->phone,
            'city' => $profile->city,
            'country' => $profile->country,
            'nationality' => $profile->nationality,
            'summary' => $profile->summary,
            'photo_url' => $profile->photo_path
                ? asset('storage/'.$profile->photo_path)
                : null,
            'skills' => $profile->skills->map(fn ($s) => ['name' => $s->name])->values()->all(),
            'educations' => $profile->educations->map(fn ($e) => [
                'institution' => $e->institution,
                'qualification' => $e->qualification,
                'field_of_study' => $e->field_of_study,
                'start_year' => $e->start_year,
                'end_year' => $e->end_year,
                'description' => $e->description,
            ])->values()->all(),
            'experiences' => $profile->workExperiences->map(fn ($w) => [
                'company' => $w->organisation,
                'role' => $w->job_title,
                'location' => $w->location,
                'description' => $w->description,
                'start_date' => $w->start_date?->format('M Y'),
                'end_date' => $w->end_date?->format('M Y'),
                'currently_working' => (bool) $w->currently_working,
            ])->values()->all(),
            'certifications' => $profile->certifications->map(fn ($c) => [
                'name' => $c->name,
                'issuer' => $c->issuing_organisation,
                'credential_number' => $c->credential_number,
                'issue_date' => $c->issue_date?->format('M Y'),
                'expiry_date' => $c->expiry_date?->format('M Y'),
            ])->values()->all(),
            'profile_strength' => $profile->isComplete() ? 100 : max(40, min(
                95,
                (int) round(
                    collect([
                        $profile->summary,
                        $profile->phone,
                        $profile->city,
                        $profile->nationality,
                        $profile->skills->isNotEmpty(),
                        $profile->educations->isNotEmpty(),
                        $profile->workExperiences->isNotEmpty(),
                        $profile->certifications->isNotEmpty(),
                    ])->filter(fn ($v) => (is_bool($v) && $v) || (is_string($v) && trim($v) !== ''))->count() * 12,
                ),
            )),
        ];

        $location = implode(', ', array_filter([$resume['city'], $resume['country']]));
        $tagline = $resume['summary']
            ? preg_replace('/[.!?].*/s', '', $resume['summary'])
            : 'Open to opportunities';
        $initials = collect(str_word_count($resume['full_name'], 1))
            ->map(fn ($w) => strtoupper($w[0]))
            ->implode('');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('resume.pdf', compact('resume', 'location', 'tagline', 'initials'));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download(str_replace(' ', '_', $resume['full_name']).'_resume.pdf');
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
        return $request->expectsJson();
    }
}
