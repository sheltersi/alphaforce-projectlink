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

    /** List participant accounts for members of the user's organisation. */
    public function participants(Request $request): AnonymousResourceCollection
    {
        $organisation = $this->currentOrganisation($request);
        $user = $request->user();
        abort_unless($user->belongsToOrganisation($organisation), 403);

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $participants = User::query()
            ->role('participant', 'web')
            ->with('participantProfile.skills')
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
        abort_unless($user->belongsToOrganisation($organisation), 403);

        $member = User::query()
            ->role('participant', 'web')
            ->where('users.id', $participant->id)
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
