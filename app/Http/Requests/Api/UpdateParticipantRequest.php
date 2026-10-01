<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates assignment / edit of a project participant.
 *
 * Frontend contract: PATCH /api/projects/{project}/participants/{participant}
 * with {role, team?, start_date?, end_date?, work_location?, working_hours?,
 * notes?}. Role is required when the member has none yet (first
 * assignment); the controller enforces that against the current row so
 * the shape stays a plain FormRequest. Status itself is never accepted
 * here (status changes go through the status action).
 */
class UpdateParticipantRequest extends FormRequest
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
            'role' => ['nullable', 'string', 'max:255'],
            'team' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'work_location' => ['nullable', 'string', 'max:255'],
            'working_hours' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'status' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.prohibited' => 'Status cannot be changed here. Use the status action instead.',
        ];
    }
}
