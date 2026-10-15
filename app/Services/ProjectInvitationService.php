<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\ProjectParticipant;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProjectInvitationService
{
    /**
     * @return array{invitation: ProjectInvitation, token: string}
     */
    public function invite(Project $project, User $inviter, User $invitee): array
    {
        $this->ensureInviteableProject($project);

        $organisation = $project->organisation;

        if ($organisation === null || ! $invitee->belongsToOrganisation($organisation)) {
            throw ValidationException::withMessages([
                'user_id' => ['Choose a member of your organisation.'],
            ]);
        }

        if ($invitee->isOrganisationAdmin($organisation)) {
            throw ValidationException::withMessages([
                'user_id' => ['Organisation administrators cannot be invited to join a project this way.'],
            ]);
        }

        if ($project->participants()->where('user_id', $invitee->id)->exists()) {
            throw ValidationException::withMessages([
                'user_id' => ['This member is already part of the project.'],
            ]);
        }

        return DB::transaction(function () use ($project, $inviter, $invitee): array {
            $invitation = ProjectInvitation::query()
                ->where('project_id', $project->id)
                ->where('user_id', $invitee->id)
                ->lockForUpdate()
                ->first();

            if ($invitation?->accepted_at !== null) {
                throw ValidationException::withMessages([
                    'user_id' => ['This member has already accepted the project invitation.'],
                ]);
            }

            if ($invitation !== null && $invitation->expires_at->isFuture()) {
                throw ValidationException::withMessages([
                    'user_id' => ['A project invitation is already pending for this member.'],
                ]);
            }

            $token = Str::random(64);
            $attributes = [
                'invited_by' => $inviter->id,
                'token_hash' => hash('sha256', $token),
                'expires_at' => now()->addDays(7),
                'accepted_at' => null,
            ];

            if ($invitation === null) {
                $invitation = ProjectInvitation::create([
                    ...$attributes,
                    'project_id' => $project->id,
                    'user_id' => $invitee->id,
                ]);
            } else {
                $invitation->update($attributes);
            }

            return ['invitation' => $invitation, 'token' => $token];
        });
    }

    /**
     * @return array{participant: ProjectParticipant, invitation: ProjectInvitation, newly_accepted: bool}
     */
    public function accept(string $token, User $user): array
    {
        $invitation = ProjectInvitation::query()
            ->where('token_hash', hash('sha256', $token))
            ->with(['project.organisation', 'inviter'])
            ->first();

        if ($invitation === null) {
            $this->invalidInvitation();
        }

        if ($invitation->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'token' => ['This invitation was sent to a different account. Sign in with the invited email address.'],
            ]);
        }

        return DB::transaction(function () use ($invitation, $user): array {
            $locked = ProjectInvitation::query()
                ->with(['project.organisation', 'inviter'])
                ->lockForUpdate()
                ->findOrFail($invitation->id);

            $existingParticipant = ProjectParticipant::query()
                ->where('project_id', $locked->project_id)
                ->where('user_id', $user->id)
                ->first();

            if ($locked->accepted_at !== null) {
                if ($existingParticipant !== null) {
                    return [
                        'participant' => $existingParticipant->load(['project.organisation', 'user']),
                        'invitation' => $locked,
                        'newly_accepted' => false,
                    ];
                }

                $this->invalidInvitation();
            }

            if ($locked->expires_at->isPast()) {
                $this->invalidInvitation();
            }

            $project = $locked->project;
            $this->ensureInviteableProject($project);
            $organisation = $project->organisation;
            if ($organisation === null || ! $user->belongsToOrganisation($organisation)) {
                throw ValidationException::withMessages([
                    'token' => ['You must belong to this organisation to join the project.'],
                ]);
            }

            if ($user->isOrganisationAdmin($organisation)) {
                throw ValidationException::withMessages([
                    'token' => ['Organisation administrators cannot join projects through member invitations.'],
                ]);
            }

            if ($existingParticipant !== null) {
                throw ValidationException::withMessages([
                    'token' => ['You are already part of this project.'],
                ]);
            }

            $participant = ProjectParticipant::create([
                'project_id' => $project->id,
                'user_id' => $user->id,
                'application_id' => null,
                'role' => null,
                'status' => ProjectParticipant::STATUS_ACTIVE,
                'joined_at' => Carbon::today(),
            ]);

            $locked->update(['accepted_at' => now()]);

            return [
                'participant' => $participant->load(['project.organisation', 'user']),
                'invitation' => $locked,
                'newly_accepted' => true,
            ];
        });
    }

    private function invalidInvitation(): never
    {
        throw ValidationException::withMessages([
            'token' => ['This project invitation is invalid, expired, or has already been used.'],
        ]);
    }

    private function ensureInviteableProject(Project $project): void
    {
        if (! in_array($project->status, [
            Project::STATUS_DRAFT,
            Project::STATUS_OPEN,
            Project::STATUS_IN_PROGRESS,
        ], true)) {
            throw ValidationException::withMessages([
                'project' => ['This project is no longer accepting member invitations.'],
            ]);
        }
    }
}
