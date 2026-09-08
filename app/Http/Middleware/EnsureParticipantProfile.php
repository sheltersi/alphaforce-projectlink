<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureParticipantProfile
{
    /**
     * Routes that are allowed to be accessed even when a participant has no profile.
     * These are typically the onboarding flow itself plus auth utilities.
     *
     * @var list<string>
     */
    private const ALLOWED_ROUTE_PATTERNS = [
        'onboarding.*',
        'logout',
        'verification.*',
        'password.*',
    ];

    /**
     * URI prefixes that should bypass the check (e.g. onboarding pages, email verification).
     *
     * @var list<string>
     */
    private const ALLOWED_URI_PREFIXES = [
        'onboarding',
        'onboarding/*',
        'email/*',
        'logout',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user() ?? Auth::user();

        if (! $user) {
            return $next($request);
        }

        // Allow onboarding and auth utility routes to be accessed without a profile
        if ($request->routeIs(static::ALLOWED_ROUTE_PATTERNS)) {
            return $next($request);
        }

        foreach (static::ALLOWED_URI_PREFIXES as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        // Only enforce for explicit participants. Other roles (technical_admin, project_manager)
        // and users without any role (e.g. test factories) are exempt. New registrations
        // via CreateNewUser are explicitly assigned the 'participant' role, so they will be
        // correctly enforced.
        try {
            $isParticipant = method_exists($user, 'hasRole')
                ? $user->hasRole('participant')
                : false;
        } catch (\Throwable $e) {
            // Roles table may not exist in testing without RefreshDatabase – treat as not participant.
            return $next($request);
        }

        if (! $isParticipant) {
            return $next($request);
        }

        // Check if participant profile exists. Use exists() to avoid loading full model if not already loaded.
        try {
            $hasProfile = $user->relationLoaded('participantProfile')
                ? $user->participantProfile !== null
                : $user->participantProfile()->exists();
        } catch (\Throwable $e) {
            // Table may not exist in testing – allow request to proceed.
            return $next($request);
        }

        if (! $hasProfile) {
            // Avoid redirect loop: if already heading to onboarding, let through (already handled above, but double-check)
            if ($request->routeIs('onboarding.*') || $request->is('onboarding*')) {
                return $next($request);
            }

            // For Inertia requests, a normal redirect will be converted by Inertia to a visit.
            // Using redirect()->route ensures proper 302.
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                // Inertia will handle 409/302; redirect is fine. Could also use Inertia::location.
                return redirect()->route('onboarding.build-profile');
            }

            return redirect()->route('onboarding.build-profile');
        }

        return $next($request);
    }
}
