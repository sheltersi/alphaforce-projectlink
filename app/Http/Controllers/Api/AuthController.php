<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ChangeTemporaryPasswordRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Resources\Organisation\AuthenticatedUserResource;
use App\Models\User;
use App\Services\OrganisationInvitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;
use Spatie\Permission\Models\Role;

/**
 * Sanctum token authentication for the Organisation App API, consumed by
 * the separate organisation frontend. Register creates the account and
 * issues a token with pending onboarding, login verifies credentials and
 * issues a token, logout revokes the current token, and `me` returns the
 * token-authenticated user with organisation/role info.
 */
class AuthController extends Controller
{
    public function __construct(protected OrganisationInvitationService $invitations) {}

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

        $mustChangePassword = false;
        if (isset($validated['invitation_token'])) {
            $invitation = $this->invitations->validateForRegistration(
                $validated['invitation_token'],
                $validated['email'],
                $validated['password']
            );
            $mustChangePassword = $invitation->temporary_password_hash !== null;
        }

        $user = DB::transaction(function () use ($validated, $mustChangePassword): User {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'must_change_password' => $mustChangePassword,
            ]);

            $user->assignRole(Role::findByName('candidate', 'web'));

            if (isset($validated['invitation_token'])) {
                $this->invitations->accept($validated['invitation_token'], $user);
            }

            return $user;
        });

        $token = $user->createToken('organisation-app')->plainTextToken;

        $user->load(['roles', 'organisations']);
        $joinedByInvitation = isset($validated['invitation_token']);

        return (new AuthenticatedUserResource($user))->additional([
            'message' => $joinedByInvitation
                ? 'Registered and joined the invited organisation.'
                : 'Registered. Continue to onboarding to create your organisation.',
            'token' => $token,
            'token_type' => 'Bearer',
            'onboarding' => [
                'completed' => $joinedByInvitation,
                'step' => $joinedByInvitation ? null : 'organisation',
            ],
        ]);
    }

    public function changeTemporaryPassword(ChangeTemporaryPasswordRequest $request): AuthenticatedUserResource
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($user->must_change_password && ! $user->organisations()->exists()) {
            abort(403, 'Accept your organisation invitation before changing the temporary password.');
        }

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The temporary password is incorrect.'],
            ]);
        }

        if (Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Choose a password different from your temporary password.'],
            ]);
        }

        $user->forceFill([
            'password' => $validated['password'],
            'must_change_password' => false,
        ])->save();
        $user->load(['roles', 'organisations']);

        return (new AuthenticatedUserResource($user))
            ->additional(['message' => 'Password updated.']);
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
