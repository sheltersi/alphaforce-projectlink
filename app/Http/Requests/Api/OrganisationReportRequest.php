<?php

namespace App\Http\Requests\Api;

use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectParticipant;
use App\Models\Timesheet;
use App\Models\TimesheetEntry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Shared, optional filters for organisation reports.
 *
 * IDs are validated as integers here and scoped against the current
 * organisation in the report controller, keeping foreign records from
 * leaking through existence-sensitive validation messages.
 */
class OrganisationReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'project_id' => ['sometimes', 'integer'],
            'participant_id' => ['sometimes', 'integer'],
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date', 'after_or_equal:from'],
            'status' => ['sometimes', Rule::in([
                Project::STATUS_DRAFT,
                Project::STATUS_OPEN,
                Project::STATUS_IN_PROGRESS,
                Project::STATUS_COMPLETED,
                Project::STATUS_CANCELLED,
                Project::STATUS_ARCHIVED,
                ProjectApplication::STATUS_SUBMITTED,
                ProjectApplication::STATUS_UNDER_REVIEW,
                ProjectApplication::STATUS_SHORTLISTED,
                ProjectApplication::STATUS_ACCEPTED,
                ProjectApplication::STATUS_REJECTED,
                ProjectApplication::STATUS_WITHDRAWN,
                ProjectParticipant::STATUS_ACTIVE,
                ProjectParticipant::STATUS_COMPLETED,
                ProjectParticipant::STATUS_WITHDRAWN,
                Timesheet::STATUS_DRAFT,
                Timesheet::STATUS_SUBMITTED,
                Timesheet::STATUS_APPROVED,
                Timesheet::STATUS_REJECTED,
                TimesheetEntry::STATUS_DRAFT,
                TimesheetEntry::STATUS_SUBMITTED,
                TimesheetEntry::STATUS_APPROVED,
                TimesheetEntry::STATUS_REJECTED,
            ])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
