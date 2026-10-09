<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentOrganisation;
use App\Http\Resources\Organisation\ParticipantResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ParticipantController extends Controller
{
    use ResolvesCurrentOrganisation;

    /** List participants across the organisation or projects managed by the current user. */
    public function participants(Request $request): AnonymousResourceCollection
    {
        $organisation = $this->currentOrganisation($request);
        $user = $request->user();
        $canViewAll = $user->isOrganisationManager($organisation);
        $managedProjectIds = $organisation->projects()->where('created_by', $user->id)->select('id');

        abort_unless($canViewAll || $managedProjectIds->exists(), 403);

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $participants = User::query()
            ->role('participant', 'web')
            ->with('participantProfile.skills')
            ->when(! $canViewAll, fn ($query) => $query->whereHas(
                'projectParticipants',
                fn ($participants) => $participants->whereIn('project_id', $managedProjectIds)
            ))
            ->when(isset($filters['search']), function ($query) use ($filters) {
                $like = "%{$filters['search']}%";

                $query->where(function ($query) use ($like) {
                    $query->where('users.name', 'like', $like)
                        ->orWhere('users.email', 'like', $like)
                        ->orWhereHas('participantProfile', fn ($query) => $query
                            ->where('first_name', 'like', $like)
                            ->orWhere('last_name', 'like', $like));
                });
            })
            ->orderBy('users.name')
            ->orderBy('users.id')
            ->paginate(15)
            ->withQueryString();

        return ParticipantResource::collection($participants);
    }

    public function showParticipant(Request $request, User $participant): ParticipantResource
    {
        $organisation = $this->currentOrganisation($request);
        $user = $request->user();
        $canViewAll = $user->isOrganisationManager($organisation);
        $managedProjectIds = $organisation->projects()->where('created_by', $user->id)->select('id');

        if (! $canViewAll) {
            abort_unless($managedProjectIds->exists(), 403);
            abort_unless(
                $participant->projectParticipants()->whereIn('project_id', $managedProjectIds)->exists(),
                404
            );
        }

        $member = User::query()
            ->role('participant', 'web')
            ->where('users.id', $participant->id)
            ->when(! $canViewAll, fn ($query) => $query->whereHas(
                'projectParticipants',
                fn ($participants) => $participants->whereIn('project_id', $managedProjectIds)
            ))
            ->with([
                'participantProfile.skills',
                'participantProfile.educations',
                'participantProfile.workExperiences',
                'participantProfile.certifications',
            ])
            ->firstOrFail();

        return new ParticipantResource($member);
    }
}
