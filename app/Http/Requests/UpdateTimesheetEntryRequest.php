<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTimesheetEntryRequest extends FormRequest
{
    /**
     * Ownership of the (possibly moved) assignment is resolved in
     * TimesheetService — never trust ids from the frontend alone.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_participant_id' => ['sometimes', 'integer', 'exists:project_participants,id'],
            'work_date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i'],
            'description' => ['sometimes', 'required', 'string', 'max:2000'],
        ];
    }
}
