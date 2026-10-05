<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class TimesheetEntry extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    /** Maximum bookable minutes for a single calendar entry (16h). */
    public const MAX_MINUTES = 960;

    protected $fillable = [
        'timesheet_id',
        'work_date',
        'start_time',
        'end_time',
        'hours',
        'description',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_comment',
    ];

    protected function casts(): array
    {
        return [
            'work_date' => 'date',
            'hours' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Timesheet, $this> */
    public function timesheet(): BelongsTo
    {
        return $this->belongsTo(Timesheet::class);
    }

    /** @return BelongsTo<User, $this> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Duration in whole minutes derived from start/end time.
     * Null when the legacy row has no time range.
     */
    public function durationMinutes(): ?int
    {
        if ($this->start_time === null || $this->end_time === null) {
            return null;
        }

        $start = Carbon::parse($this->work_date->toDateString().' '.$this->start_time);
        $end = Carbon::parse($this->work_date->toDateString().' '.$this->end_time);

        return (int) $start->diffInMinutes($end);
    }

    /**
     * Owning participant user id, resolved through the weekly header.
     */
    public function ownerId(): ?int
    {
        return $this->timesheet?->participant?->user_id;
    }
}
