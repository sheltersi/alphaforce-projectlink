<?php

namespace App\Http\Requests\Api;

use App\Models\TimesheetEntry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Filters for the organisation timesheet review queue.
 *
 * Every filter is optional. `status` defaults to `submitted` in the
 * controller (the review queue); `project_id` is validated as an integer
 * only — organisation scoping (404 for foreign projects) happens in the
 * controller so cross-org existence never leaks through validation.
 * Unknown query parameters are ignored.
 */
class OrganisationTimesheetIndexRequest extends FormRequest
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
            'status' => ['sometimes', Rule::in([
                TimesheetEntry::STATUS_DRAFT,
                TimesheetEntry::STATUS_SUBMITTED,
                TimesheetEntry::STATUS_APPROVED,
                TimesheetEntry::STATUS_REJECTED,
            ])],
            'project_id' => ['sometimes', 'integer'],
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date', 'after_or_equal:from'],
        ];
    }
}
