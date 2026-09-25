<?php

namespace App\Http\Resources\Organisation;

use App\Models\ProjectParticipant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Assignment of a participant (User) to a project.
 *
 * Wraps `project_participants`. The `participant` naming on Timesheet
 * is preserved there, but here the loaded `user` is exposed as
 * `participant` for frontend clarity.
 *
 * @mixin ProjectParticipant
 */
class ProjectParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'user_id' => $this->user_id,
            'application_id' => $this->application_id,
            'role' => $this->role,
            'status' => $this->status,
            'joined_at' => $this->joined_at?->toDateString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'project' => new ProjectListResource($this->whenLoaded('project')),
            'participant' => new ParticipantResource($this->whenLoaded('user')),
            'application' => new ApplicationResource($this->whenLoaded('application')),
            'timesheets' => TimesheetResource::collection($this->whenLoaded('timesheets')),

            'timesheets_count' => $this->whenCounted('timesheets'),
        ];
    }
}
