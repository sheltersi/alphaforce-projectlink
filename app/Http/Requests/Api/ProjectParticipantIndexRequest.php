<?php

namespace App\Http\Requests\Api;

use App\Models\ProjectParticipant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the project participants listing filter.
 */
class ProjectParticipantIndexRequest extends FormRequest
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
                ProjectParticipant::STATUS_ACTIVE,
                ProjectParticipant::STATUS_COMPLETED,
                ProjectParticipant::STATUS_WITHDRAWN,
            ])],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
