<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentOrganisation;
use App\Http\Controllers\Controller;
use App\Http\Resources\Organisation\OrganisationUserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

/**
 * Users belonging to the authenticated user's own organisation.
 * Membership is always scoped to the viewer's organisation, so users
 * from another organisation resolve to 404 and are never exposed.
 */
class OrganisationUserController extends Controller
{
    use ResolvesCurrentOrganisation;

    public function index(Request $request): AnonymousResourceCollection
    {
        $organisation = $this->currentOrganisation($request);

        Gate::authorize('viewMembers', $organisation);

        $users = $organisation->users()->orderBy('users.name')->paginate(15);

        return OrganisationUserResource::collection($users);
    }

    public function show(Request $request, User $user): OrganisationUserResource
    {
        $organisation = $this->currentOrganisation($request);

        Gate::authorize('viewMember', $organisation);

        $member = $organisation->users()->where('users.id', $user->id)->firstOrFail();

        return new OrganisationUserResource($member);
    }
}
