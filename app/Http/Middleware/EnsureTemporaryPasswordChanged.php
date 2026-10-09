<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTemporaryPasswordChanged
{
    private const ALLOWED_ROUTES = [
        'api.auth.me',
        'api.auth.logout',
        'api.auth.password.change',
        'api.organisation.invitations.accept',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user?->must_change_password
            && ! in_array($request->route()?->getName(), self::ALLOWED_ROUTES, true)
        ) {
            return response()->json([
                'message' => 'Change your temporary password before using the Organisation App.',
                'errors' => [
                    'must_change_password' => ['A new password is required before continuing.'],
                ],
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
