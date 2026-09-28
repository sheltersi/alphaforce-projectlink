<?php

namespace App\Policies;

use App\Models\Organisation;
use App\Models\User;

/**
 * Authorisation for the Organisation App foundation.
 *
 * - Viewing the organisation and its users requires membership plus an
 *   organisation-management role (Technical Admin or Project Manager).
 * - Updating the organisation additionally requires Technical Admin level
 *   access. Participants and outsiders are denied.
 */
class OrganisationPolicy
{
    public function view(User $user, Organisation $organisation): bool
    {
        return $user->belongsToOrganisation($organisation)
            && $user->isOrganisationManager($organisation);
    }

    public function update(User $user, Organisation $organisation): bool
    {
        return $user->belongsToOrganisation($organisation)
            && $user->isOrganisationAdmin($organisation);
    }

    public function viewMembers(User $user, Organisation $organisation): bool
    {
        return $this->view($user, $organisation);
    }

    public function viewMember(User $user, Organisation $organisation): bool
    {
        return $this->view($user, $organisation);
    }
}
