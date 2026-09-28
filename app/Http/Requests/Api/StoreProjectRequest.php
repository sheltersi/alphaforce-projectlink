<?php

namespace App\Http\Requests\Api;

/**
 * Validation for creating a project. New projects always start as drafts;
 * publishing happens through the lifecycle actions.
 */
class StoreProjectRequest extends BaseProjectRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
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
            'status.prohibited' => 'Projects always start as drafts. Use the publish action instead.',
            'organisation_id.prohibited' => 'Projects are always created for your own organisation.',
        ];
    }
}
