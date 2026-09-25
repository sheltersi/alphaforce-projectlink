<?php

namespace App\Http\Resources\Organisation;

use App\Models\TimesheetEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Single day entry inside a timesheet period.
 *
 * @mixin TimesheetEntry
 */
class TimesheetEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'timesheet_id' => $this->timesheet_id,
            'work_date' => $this->work_date?->toDateString(),
            'hours' => $this->hours,
            'description' => $this->description,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
