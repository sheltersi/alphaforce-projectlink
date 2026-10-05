<?php

namespace App\Policies;

use App\Models\ProjectParticipant;
use App\Models\TimesheetEntry;
use App\Models\User;

/**
 * Authorisation for calendar timesheet entries.
 *
 * Participants own their entries: they may view/create/submit them and may
 * only modify/delete drafts (rejected entries may be corrected, which flips
 * them back to draft). Approval is reserved for managers of the entry's
 * project, and nobody may approve their own entries.
 */
class TimesheetEntryPolicy
{
    public function view(User $user, TimesheetEntry $entry): bool
    {
        return $this->isOwner($user, $entry) || $this->canReview($user, $entry);
    }

    public function create(User $user): bool
    {
        return $user->projectParticipants()
            ->where('status', ProjectParticipant::STATUS_ACTIVE)
            ->exists();
    }

    public function update(User $user, TimesheetEntry $entry): bool
    {
        return $this->isOwner($user, $entry)
            && in_array($entry->status, [TimesheetEntry::STATUS_DRAFT, TimesheetEntry::STATUS_REJECTED], true);
    }

    public function delete(User $user, TimesheetEntry $entry): bool
    {
        return $this->isOwner($user, $entry) && $entry->status === TimesheetEntry::STATUS_DRAFT;
    }

    public function submit(User $user, TimesheetEntry $entry): bool
    {
        return $this->isOwner($user, $entry)
            && in_array($entry->status, [TimesheetEntry::STATUS_DRAFT, TimesheetEntry::STATUS_REJECTED], true);
    }

    public function review(User $user, TimesheetEntry $entry): bool
    {
        if ($this->isOwner($user, $entry)) {
            return false;
        }

        return $this->canReview($user, $entry)
            && $entry->status === TimesheetEntry::STATUS_SUBMITTED;
    }

    protected function isOwner(User $user, TimesheetEntry $entry): bool
    {
        return $entry->ownerId() === $user->id;
    }

    /**
     * Managers of the entry's project organisation may review it.
     * Mirrors the ProjectPolicy precedent: organisation managers can view
     * review queues, while decisions stay with people who manage the work.
     */
    protected function canReview(User $user, TimesheetEntry $entry): bool
    {
        $project = $entry->timesheet?->participant?->project;

        if ($project === null || $project->organisation_id === null) {
            return false;
        }

        return $user->belongsToOrganisation($project->organisation_id)
            && $user->isOrganisationManager($project->organisation_id);
    }
}
