<?php

namespace App\Http\Requests\Api;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates project listing filters. All filters are optional; unknown
 * query parameters are ignored rather than rejected.
 */
class ProjectIndexRequest extends FormRequest
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
                Project::STATUS_DRAFT,
                Project::STATUS_OPEN,
                Project::STATUS_IN_PROGRESS,
                Project::STATUS_COMPLETED,
                Project::STATUS_CANCELLED,
                Project::STATUS_ARCHIVED,
            ])],
            'search' => ['sometimes', 'string', 'max:255'],
            'project_manager' => ['sometimes', 'integer', Rule::exists('users', 'id')],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
        ];
    }
}
