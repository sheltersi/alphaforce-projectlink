<?php

namespace App\Http\Resources\Participant;

use App\Models\TimesheetEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Single calendar timesheet entry for the Participant App.
 *
 * Duration is always derived server-side from start/end time;
 * participants never enter hours manually.
 *
 * @mixin TimesheetEntry
 */
class TimesheetEntryResource extends JsonResource
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
            'reviewed_by' => $this->whenLoaded('reviewer', fn () => $this->reviewer?->name),

            'project' => $participant?->project ? [
                'id' => $participant->project->id,
                'title' => $participant->project->title,
            ] : null,

            'assignment' => $participant ? [
                'id' => $participant->id,
                'role' => $participant->role,
                'team' => $participant->team,
            ] : null,

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
