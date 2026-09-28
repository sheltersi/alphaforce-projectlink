<?php

namespace App\Http\Requests\Api;

/**
 * Validation for updating a project. Status changes go through the
 * lifecycle actions; closed, cancelled and archived projects are rejected
 * in the controller with a 422 business-rule response.
 */
class UpdateProjectRequest extends BaseProjectRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
            'positions' => ['sometimes', 'integer', 'min:1', 'max:10000'],
            'project_manager_id' => $this->projectManagerRules(),
            'skill_ids' => $this->skillIdsRules(),
            'skill_ids.*' => $this->skillIdItemRules(),
            'status' => ['prohibited'],
            'organisation_id' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.prohibited' => 'Project status is managed through the lifecycle actions.',
            'organisation_id.prohibited' => 'Projects cannot be moved to another organisation.',
        ];
    }
}
