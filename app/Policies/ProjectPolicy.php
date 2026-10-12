<?php

namespace App\Policies;

use App\Models\Organisation;
use App\Models\Project;
use App\Models\User;

/**
 * Authorisation for Organisation App project management.
 *
 * - Listing and viewing projects requires membership in their organisation.
 *   Creating and viewing reports requires an organisation-management role
 *   (Technical Admin or Project Manager).
 * - A member assigned as a project's creator/project manager can manage that
 *   project without gaining organisation-wide management access.
 * - Read-only browsing of organisation application/participant data is open
 *   to all organisation members. Decisions and assignment edits remain
 *   restricted to project managers / admins.
 * - Updating, lifecycle transitions, deletion and application decisions
 *   additionally require the user to be the project creator or a Technical
 *   Admin, following the existing creator-or-admin precedent
 *   (ProjectController@showApplication).
 * - Participants and outsiders are denied; cross-org access is denied.
 */
class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        $organisation = $user->currentOrganisation();

        return $organisation !== null && $user->belongsToOrganisation($organisation);
    }

    public function viewReports(User $user): bool
    {
        $organisation = $user->currentOrganisation();

        return $organisation !== null && $user->isOrganisationManager($organisation);
    }

    public function view(User $user, Project $project): bool
    {
        return $project->organisation_id !== null
            && $user->belongsToOrganisation($project->organisation_id);
    }

    public function create(User $user): bool
    {
        $organisation = $user->currentOrganisation();

        return $organisation !== null && $user->isOrganisationManager($organisation);
    }

    public function update(User $user, Project $project): bool
    {
        return $this->canManage($user, $project);
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->canManage($user, $project);
    }

    public function publish(User $user, Project $project): bool
    {
        return $this->canManage($user, $project);
    }

    public function unpublish(User $user, Project $project): bool
    {
        return $this->canManage($user, $project);
    }

    public function close(User $user, Project $project): bool
    {
        return $this->canManage($user, $project);
    }

    public function archive(User $user, Project $project): bool
    {
        return $this->canManage($user, $project);
    }

    public function viewApplications(User $user, Project $project): bool
    {
        return $project->organisation_id !== null
            && $user->belongsToOrganisation($project->organisation_id);
    }

    public function reviewApplications(User $user, Project $project): bool
    {
        return $this->canManage($user, $project);
    }

    protected function inManagedOrganisation(User $user, Project $project): bool
    {
        if ($project->organisation_id === null) {
            return false;
        }

        return $user->belongsToOrganisation($project->organisation_id)
            && ($user->isOrganisationManager($project->organisation_id)
                || $project->created_by === $user->id);
    }

    protected function canManage(User $user, Project $project): bool
    {
        if (! $this->inManagedOrganisation($user, $project)) {
            return false;
        }

        return $project->created_by === $user->id
            || $user->isOrganisationAdmin($project->organisation_id);
    }
}
