<?php

namespace App\Http\Resources\Organisation;

use App\Models\Timesheet;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Timesheet for organisation review.
 *
 * Supports filtering context via loaded `participant` (whose project
 * identifies the project filter) and `approver`. Review audit fields
 * (`approved_by`, `approved_at`) only exist here — applications have
 * no equivalent reviewer columns.
 *
 * @mixin Timesheet
 */
class TimesheetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_participant_id' => $this->project_participant_id,
            'period_start' => $this->period_start?->toDateString(),
            'period_end' => $this->period_end?->toDateString(),
            'total_hours' => $this->total_hours,
            'status' => $this->status,
            'note' => $this->note,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'entries' => TimesheetEntryResource::collection($this->whenLoaded('entries')),
            'participant' => new ProjectParticipantResource($this->whenLoaded('participant')),
            'approver' => new UserBriefResource($this->whenLoaded('approver')),

            'entries_count' => $this->whenCounted('entries'),
        ];
    }
}
