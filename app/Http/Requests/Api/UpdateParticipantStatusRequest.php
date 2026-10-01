<?php

namespace App\Http\Requests\Api;

use App\Models\ProjectParticipant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates a participant status transition.
 *
 * Frontend contract: POST /api/projects/{project}/participants/{participant}/status
 * with {status: completed|withdrawn}. Only active members can move, to a
 * terminal state; legality of the move itself is enforced in the
 * controller (422 with {message, errors} on violation).
 */
class UpdateParticipantStatusRequest extends FormRequest
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
            'status' => ['required', Rule::in([
                ProjectParticipant::STATUS_COMPLETED,
                ProjectParticipant::STATUS_WITHDRAWN,
            ])],
        ];
    }
}
