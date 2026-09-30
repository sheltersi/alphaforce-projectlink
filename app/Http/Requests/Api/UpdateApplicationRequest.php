<?php

namespace App\Http\Requests\Api;

use App\Models\ProjectApplication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates a reviewer decision on a project application.
 *
 * Frontend contract: PATCH /api/projects/{project}/applications/{application}
 * with {status: accepted|rejected|under_review|shortlisted} (+ optional
 * rejection_reason alongside rejected).
 */
class UpdateApplicationRequest extends FormRequest
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
        $rules = [
            'status' => ['required', Rule::in([
                ProjectApplication::STATUS_ACCEPTED,
                ProjectApplication::STATUS_REJECTED,
                ProjectApplication::STATUS_UNDER_REVIEW,
                ProjectApplication::STATUS_SHORTLISTED,
            ])],
        ];

        // rejection_reason is only meaningful alongside rejected.
        if ($this->input('status') === ProjectApplication::STATUS_REJECTED) {
            $rules['rejection_reason'] = ['nullable', 'string', 'max:1000'];
        } else {
            $rules['rejection_reason'] = ['prohibited'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rejection_reason.prohibited' => 'A rejection reason can only be given when rejecting.',
        ];
    }
}
