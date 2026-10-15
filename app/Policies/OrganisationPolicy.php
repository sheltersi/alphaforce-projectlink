<?php

namespace App\Policies;

use App\Models\Organisation;
use App\Models\User;

/**
 * Authorisation for the Organisation App foundation.
 *
 * - Every organisation member may view the organisation profile.
 * - Viewing the member roster requires an organisation-management role.
 * - Updating the profile is limited to organisation admins and its creator.
 *   Outsiders are denied.
 */
class OrganisationPolicy
{
    public function view(User $user, Organisation $organisation): bool
    {
        return $user->belongsToOrganisation($organisation);
    }

    public function update(User $user, Organisation $organisation): bool
    {
        return $user->belongsToOrganisation($organisation)
            && ($user->isOrganisationAdmin($organisation)
                || (int) $organisation->created_by === (int) $user->id);
    }

    public function viewMembers(User $user, Organisation $organisation): bool
    {
        return $user->belongsToOrganisation($organisation)
            && $user->isOrganisationManager($organisation);
    }

    public function viewMember(User $user, Organisation $organisation): bool
    {
        return $this->viewMembers($user, $organisation);
    }

    public function inviteMembers(User $user, Organisation $organisation): bool
    {
        return $user->belongsToOrganisation($organisation)
            && $user->isOrganisationAdmin($organisation);
    }
}
