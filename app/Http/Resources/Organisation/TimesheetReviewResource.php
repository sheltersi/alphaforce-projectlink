<?php

namespace App\Http\Resources\Organisation;

use App\Models\TimesheetEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Timesheet entry for the organisation review queue.
 *
 * Extends the participant entry shape with the review context managers
 * need: the participant (privacy-filtered, same as the application queue),
 * the project/assignment, and the reviewer audit trail (`reviewed_at`,
 * `reviewer`, `review_comment`). Duration stays server-derived from the
 * stored start/end times, never from client-side math.
 *
 * @mixin TimesheetEntry
 */
class TimesheetReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $participant = $this->whenLoaded('timesheet') ? $this->timesheet->participant : null;

        return [
            'id' => $this->id,
            'work_date' => $this->work_date->toDateString(),
            'start_time' => $this->start_time !== null ? substr((string) $this->start_time, 0, 5) : null,
            'end_time' => $this->end_time !== null ? substr((string) $this->end_time, 0, 5) : null,
            'minutes' => $this->durationMinutes(),
            'hours' => (float) $this->hours,
            'description' => $this->description,
            'status' => $this->status,
            'review_comment' => $this->review_comment,
            'reviewed_at' => $this->reviewed_at?->toISOString(),

            'project' => $participant?->project ? [
                'id' => $participant->project->id,
                'title' => $participant->project->title,
            ] : null,

            'assignment' => $participant ? [
                'id' => $participant->id,
                'role' => $participant->role,
                'team' => $participant->team,
            ] : null,

            'participant' => $participant?->user !== null
                ? new ParticipantResource($participant->user)
                : null,

            'reviewer' => $this->whenLoaded('reviewer', fn () => $this->reviewer !== null
                ? new ParticipantResource($this->reviewer)
                : null),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
