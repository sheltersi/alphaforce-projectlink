<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentOrganisation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AcceptOrganisationInvitationRequest;
use App\Http\Requests\Api\InviteOrganisationMemberRequest;
use App\Http\Resources\Organisation\OrganisationInvitationResource;
use App\Http\Resources\Organisation\OrganisationUserResource;
use App\Models\Organisation;
use App\Notifications\OrganisationInvitationNotification;
use App\Services\OrganisationInvitationService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;

class OrganisationInvitationController extends Controller
{
    use ResolvesCurrentOrganisation;

    public function __construct(protected OrganisationInvitationService $invitations) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $organisation = $this->administeredOrganisation($request);

        $invitations = $organisation->invitations()
            ->whereNull('accepted_at')
            ->with('inviter:id,name')
            ->orderByDesc('created_at')
            ->paginate(15);

        return OrganisationInvitationResource::collection($invitations);
    }

    public function store(InviteOrganisationMemberRequest $request): OrganisationInvitationResource
    {
        $organisation = $this->administeredOrganisation($request);
        $validated = $request->validated();
        $result = $this->invitations->invite(
            $organisation,
            $request->user(),
            $validated['email']
        );

        Notification::route('mail', $result['invitation']->email)->notify(
            new OrganisationInvitationNotification(
                $organisation,
                $result['token'],
                $result['temporary_password']
            )
        );

        return (new OrganisationInvitationResource($result['invitation']))
            ->additional(['message' => 'Invitation sent.']);
    }

    public function accept(AcceptOrganisationInvitationRequest $request): OrganisationUserResource
    {
        $membership = $this->invitations->accept(
            $request->validated('token'),
            $request->user()
        );
        $user = $membership->organisation->users()
            ->whereKey($membership->user_id)
            ->firstOrFail();

        return (new OrganisationUserResource($user))
            ->additional([
                'message' => 'Invitation accepted.',
                'membership' => [
                    'organisation_id' => $membership->organisation_id,
                    'role' => $membership->role,
                ],
            ]);
    }

    private function administeredOrganisation(Request $request): Organisation
    {
        $organisation = $this->currentOrganisation($request);

        Gate::authorize('inviteMembers', $organisation);

        return $organisation;
    }
}
