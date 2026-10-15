<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentOrganisation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AcceptProjectInvitationRequest;
use App\Http\Requests\Api\InviteProjectMemberRequest;
use App\Http\Resources\Organisation\ProjectParticipantResource;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\ProjectParticipant;
use App\Notifications\ProjectMemberInvitation;
use App\Notifications\ProjectMemberJoined;
use App\Services\ProjectInvitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProjectInvitationController extends Controller
{
    use ResolvesCurrentOrganisation;

    public function memberStatuses(Request $request): JsonResponse
    {
        $organisation = $this->currentOrganisation($request);
        Gate::authorize('viewMembers', $organisation);

        $projectIds = $organisation->projects()
            ->where('created_by', $request->user()->id)
            ->pluck('projects.id');

        if ($projectIds->isEmpty()) {
            return response()->json(['data' => []]);
        }

        $joinedUserIds = ProjectParticipant::query()
            ->whereIn('project_id', $projectIds)
            ->distinct()
            ->pluck('user_id')
            ->map(fn ($id) => (int) $id);

        $pendingUserIds = ProjectInvitation::query()
            ->whereIn('project_id', $projectIds)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->distinct()
            ->pluck('user_id')
            ->map(fn ($id) => (int) $id)
            ->diff($joinedUserIds);

        $statuses = $joinedUserIds
            ->map(fn (int $userId) => ['user_id' => $userId, 'status' => 'joined'])
            ->concat($pendingUserIds->map(fn (int $userId) => ['user_id' => $userId, 'status' => 'invited']))
            ->values();

        return response()->json(['data' => $statuses]);
    }

    public function store(
        InviteProjectMemberRequest $request,
        Project $project,
        ProjectInvitationService $invitations,
    ): JsonResponse {
        $organisation = $this->currentOrganisation($request);

        if ($project->organisation_id !== $organisation->id) {
            throw new NotFoundHttpException;
        }

        Gate::authorize('reviewApplications', $project);

        $invitee = $organisation->users()->whereKey($request->validated('user_id'))->firstOrFail();
        $result = $invitations->invite($project, $request->user(), $invitee);
        $invitee->notify(new ProjectMemberInvitation(
            $project->load('organisation'),
            $request->user(),
            $result['token'],
        ));

        return response()->json([
            'data' => [
                'id' => $result['invitation']->id,
                'project_id' => $project->id,
                'user_id' => $invitee->id,
                'expires_at' => $result['invitation']->expires_at->toISOString(),
            ],
            'message' => 'Project invitation sent.',
        ], 201);
    }

    public function accept(
        AcceptProjectInvitationRequest $request,
        ProjectInvitationService $invitations,
    ): ProjectParticipantResource {
        $acceptance = $invitations->accept($request->validated('token'), $request->user());
        $participant = $acceptance['participant'];

        if ($acceptance['newly_accepted'] && $acceptance['invitation']->inviter !== null) {
            $acceptance['invitation']->inviter->notify(new ProjectMemberJoined(
                $participant->user,
                $participant->project,
            ));
        }

        return (new ProjectParticipantResource($participant))
            ->additional(['message' => 'You joined '.$participant->project->title.'.']);
    }
}
