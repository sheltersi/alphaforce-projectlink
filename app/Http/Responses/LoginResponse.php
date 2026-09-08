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

        // Participants without a profile must complete onboarding before reaching the dashboard.
        if ($user && $this->shouldRedirectToOnboarding($user)) {
            return redirect()->intended(route('onboarding.build-profile'));
        }

        return redirect()->intended(Fortify::redirects('login') ?? route('dashboard'));
    }

    private function shouldRedirectToOnboarding($user): bool
    {
        try {
            $isParticipant = method_exists($user, 'hasRole') ? $user->hasRole('participant') : false;
            if (! $isParticipant) {
                return false;
            }

            return ! $user->participantProfile()->exists();
        } catch (\Throwable $e) {
            return false;
        }
    }
}
