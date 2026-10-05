<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Resources\Organisation\AuthenticatedUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Sanctum token authentication for the Organisation App API, consumed by
 * the separate organisation frontend. Register creates the account and
 * issues a token with pending onboarding, login verifies credentials and
 * issues a token, logout revokes the current token, and `me` returns the
 * token-authenticated user with organisation/role info.
 */
class AuthController extends Controller
{
    public function login(LoginRequest $request): AuthenticatedUserResource
    {
        $user = $request->authenticate();

        $token = $user->createToken('organisation-app')->plainTextToken;

        $user->load(['roles', 'organisations']);

        return (new AuthenticatedUserResource($user))->additional([
            'message' => 'Authenticated.',
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function register(RegisterRequest $request): AuthenticatedUserResource
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        $user->assignRole('candidate');

        $token = $user->createToken('organisation-app')->plainTextToken;

        $user->load(['roles', 'organisations']);

        return (new AuthenticatedUserResource($user))->additional([
            'message' => 'Registered. Continue to onboarding to create your organisation.',
            'token' => $token,
            'token_type' => 'Bearer',
            'onboarding' => ['completed' => false, 'step' => 'organisation'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $accessToken = $request->user()->currentAccessToken();

        // Session-authenticated callers carry a TransientToken instead of a
        // persistent token, so only delete actual personal access tokens.
        if (get_class($accessToken) === PersonalAccessToken::class) {
            $accessToken->delete();
        }

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): AuthenticatedUserResource
    {
        $user = $request->user()->load(['roles', 'organisations']);

        return new AuthenticatedUserResource($user);
    }
}
