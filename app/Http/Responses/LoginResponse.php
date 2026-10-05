<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();

        // Participants with an incomplete profile must finish onboarding before reaching the dashboard.
        if ($user && $this->shouldRedirectToOnboarding($user)) {
            return redirect()->intended(route('onboarding.build-profile'));
        }

        return redirect()->intended(Fortify::redirects('login') ?? route('dashboard'));
    }

    private function shouldRedirectToOnboarding($user): bool
    {
        try {
            $requiresParticipantProfile = method_exists($user, 'hasAnyRole')
                ? $user->hasAnyRole(['candidate', 'participant'])
                : false;
            if (! $requiresParticipantProfile) {
                return false;
            }

            $profile = $user->participantProfile()->with('skills')->first();

            return ! $profile || ! $profile->isComplete();
        } catch (\Throwable $e) {
            return false;
        }
    }
}
