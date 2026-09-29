<?php

namespace App\Http\Requests\Api;

use App\Models\ProjectApplication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the project applications listing filter.
 */
class ProjectApplicationIndexRequest extends FormRequest
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
                ProjectApplication::STATUS_SUBMITTED,
                ProjectApplication::STATUS_UNDER_REVIEW,
                ProjectApplication::STATUS_SHORTLISTED,
                ProjectApplication::STATUS_ACCEPTED,
                ProjectApplication::STATUS_REJECTED,
                ProjectApplication::STATUS_WITHDRAWN,
            ])],
        ];
    }
}
