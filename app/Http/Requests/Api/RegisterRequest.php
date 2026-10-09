<?php

namespace App\Http\Requests\Api;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Organisation App registration. Reuses the same name/email/password
 * rules as web registration; organisation users get no role here and
 * become Technical Admin when completing onboarding instead.
 */
class RegisterRequest extends FormRequest
{
    use PasswordValidationRules, ProfileValidationRules;

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
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'invitation_token' => ['sometimes', 'required', 'string', 'size:64', 'alpha_num'],
        ];
    }
}
