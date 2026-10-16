<?php

namespace App\Http\Requests\Api;

use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Shared project validation. Status is managed exclusively through
 * lifecycle actions, and the organisation is always the authenticated
 * user's own, so neither is accepted as input.
 */
abstract class BaseProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Rules for the project manager assignment. A project manager must be
     * a member of the authenticated user's own organisation, or an existing
     * participant on a project in that organisation. The project creator
     * field scopes their management access to this project.
     *
     * @return array<int, mixed>
     */
    protected function projectManagerRules(): array
    {
        return [
            'sometimes', 'nullable', 'integer',
            Rule::exists('users', 'id'),
            function (string $attribute, mixed $value, Closure $fail): void {
                $organisation = $this->user()->currentOrganisation();
                $manager = User::find($value);
                $participatesInOrganisationProject = $organisation !== null && $manager !== null
                    && $manager->projectParticipants()
                        ->whereHas('project', fn ($query) => $query->where('organisation_id', $organisation->id))
                        ->exists();

                if ($organisation === null || $manager === null
                    || (! $manager->belongsToOrganisation($organisation) && ! $participatesInOrganisationProject)) {
                    $fail('The selected project manager must belong to your organisation or participate in one of its projects.');
                }
            },
        ];
    }

    /**
     * Rules for attaching skills. Project skills reference shared `skills`
     * rows (see `project_skill`), so only existing IDs can be attached.
     * Used as `'skill_ids' => $this->skillIdsRules()` plus
     * `'skill_ids.*' => $this->skillIdItemRules()`.
     *
     * @return array<int, mixed>
     */
    protected function skillIdsRules(): array
    {
        return ['sometimes', 'array'];
    }

    /**
     * @return array<int, mixed>
     */
    protected function skillIdItemRules(): array
    {
        return ['integer', 'distinct', Rule::exists('skills', 'id')];
    }
}
