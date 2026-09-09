<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Fortify;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 201);
        }

        $user = $request->user();

        if ($user && $this->shouldRedirectToOnboarding($user)) {
            return redirect()->intended(route('onboarding.build-profile'));
        }

        return redirect()->intended(Fortify::redirects('register') ?? route('dashboard'));
    }

    private function shouldRedirectToOnboarding($user): bool
    {
        try {
            $isParticipant = method_exists($user, 'hasRole') ? $user->hasRole('participant') : false;
            if (! $isParticipant) {
                return false;
            }

            $profile = $user->participantProfile()->with('skills')->first();

            return ! $profile || ! $profile->isComplete();
        } catch (\Throwable $e) {
            return false;
        }
    }
}
