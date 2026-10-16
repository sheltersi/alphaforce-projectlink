<?php

namespace App\Policies;

use App\Models\Organisation;
use App\Models\Project;
use App\Models\User;

/**
 * Authorisation for Organisation App project management.
 *
 * - Listing projects requires membership in their organisation. Organisation
 *   admins and unassigned members can browse all; project managers and members
 *   assigned as project managers can view projects they manage or created.
 *   Creating and viewing reports requires an organisation-management role
 *   (Technical Admin or Project Manager).
 * - A member assigned as a project's creator/project manager can manage that
 *   project without gaining organisation-wide management access.
 * - Read-only application and participant data follows project visibility:
 *   unassigned members can browse across the organisation, while project
 *   managers can only see data for projects they manage. Decisions and
 *   assignment edits remain restricted to project managers / admins.
 * - Updating, deletion and application decisions additionally require the
 *   assigned project manager, the originator of an unassigned project, or an
 *   organisation admin. Project originators may publish their own projects.
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
        return $this->canViewProject($user, $project);
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
        return $this->canManage($user, $project)
            || ($project->originator_id === $user->id
                && $project->organisation_id !== null
                && $user->belongsToOrganisation($project->organisation_id)
                && $user->isOrganisationManager($project->organisation_id));
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
        return $this->canViewProject($user, $project);
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

    private function canViewProject(User $user, Project $project): bool
    {
        if ($project->organisation_id === null || ! $user->belongsToOrganisation($project->organisation_id)) {
            return false;
        }

        return ! $user->shouldRestrictProjectVisibilityToManagedProjects($project->organisation_id)
            || $project->created_by === $user->id
            || $project->originator_id === $user->id;
    }

    protected function canManage(User $user, Project $project): bool
    {
        if (! $this->inManagedOrganisation($user, $project)) {
            return false;
        }

        return $project->created_by === $user->id
            || ($project->created_by === null && $project->originator_id === $user->id)
            || $user->isOrganisationAdmin($project->organisation_id);
    }
}
