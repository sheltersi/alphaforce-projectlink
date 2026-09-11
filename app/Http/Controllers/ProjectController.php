<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApplyProjectRequest;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ProjectController extends Controller
{
    /**
     * List discoverable projects with the current user's like/application state.
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();

        $projects = Project::query()
            ->with(['organisation', 'skills'])
            ->withCount('likes as likes_count')
            ->whereIn('status', [Project::STATUS_OPEN, Project::STATUS_IN_PROGRESS])
            ->orderBy('created_at', 'desc')
            ->get();

        if ($projects->isEmpty()) {
            return Inertia::render('projects/discover', ['projects' => []]);
        }

        $projectIds = $projects->pluck('id');

        $likedIds = ProjectLike::where('user_id', $user->id)
            ->whereIn('project_id', $projectIds)
            ->pluck('project_id');

        $applicationStatuses = ProjectApplication::where('user_id', $user->id)
            ->whereIn('project_id', $projectIds)
            ->pluck('status', 'project_id');

        $userSkillNames = $user->participantProfile?->skills->pluck('name');

        $payload = $projects->map(function (Project $project) use ($userSkillNames, $likedIds, $applicationStatuses): array {
            $requiredSkills = $project->skills->pluck('name');
            $matchingSkills = $requiredSkills->intersect($userSkillNames ?? collect());
            $match = $requiredSkills->isEmpty()
                ? 0
                : (int) round($matchingSkills->count() / $requiredSkills->count() * 100);

            return [
                'id' => $project->id,
                'title' => $project->title,
                'slug' => $project->slug,
                'description' => $project->description,
                'location' => $project->location,
                'status' => $project->status,
                'match' => $match,
                'positions' => $project->positions,
                'start_date' => $project->start_date?->toDateString(),
                'end_date' => $project->end_date?->toDateString(),
                'organisation' => $project->organisation?->name,
                'skills' => $requiredSkills->values(),
                'likes_count' => $project->likes_count,
                'liked_by_me' => $likedIds->contains($project->id),
                'application_status' => $applicationStatuses[$project->id] ?? null,
            ];
        });

        return Inertia::render('projects/discover', ['projects' => $payload]);
    }

    /**
     * Toggle the current user's like on a project.
     */
    public function toggleLike(Request $request, Project $project): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        $like = ProjectLike::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();

        $liked = false;
        $message = '';

        if ($like) {
            $like->delete();
            $message = 'Removed from your liked projects.';
        } else {
            ProjectLike::create(['project_id' => $project->id, 'user_id' => $user->id]);
            $liked = true;
            $message = 'Nice! Project added to your likes.';
        }

        if ($request->expectsJson()) {
            return response()->json(['liked' => $liked, 'message' => $message]);
        }

        Inertia::flash('toast', ['type' => $liked ? 'success' : 'info', 'message' => $message]);

        return back();
    }

    /**
     * Submit an application for the current user.
     */
    public function apply(ApplyProjectRequest $request, Project $project): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        if ($project->created_by === $user->id) {
            abort(403, 'You cannot apply to a project you created.');
        }

        if (! in_array($project->status, [Project::STATUS_OPEN, Project::STATUS_IN_PROGRESS])) {
            abort(422, 'This project is not accepting applications.');
        }

        $withdrawn = [ProjectApplication::STATUS_WITHDRAWN];
        if ($user->projectApplications()->where('project_id', $project->id)->whereNotIn('status', $withdrawn)->exists()) {
            $message = 'You have already applied to this project.';

            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 409);
            }

            Inertia::flash('toast', ['type' => 'info', 'message' => $message]);

            return back();
        }

        ProjectApplication::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'status' => ProjectApplication::STATUS_SUBMITTED,
            'cover_letter' => $request->validated('cover_letter'),
            'submitted_at' => now(),
        ]);

        $message = 'Application submitted successfully.';

        if ($request->expectsJson()) {
            return response()->json(['message' => $message]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }
}