<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\ProjectParticipant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectParticipant>
 */
class ProjectParticipantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'application_id' => null,
            'role' => 'participant',
            'status' => ProjectParticipant::STATUS_ACTIVE,
            'joined_at' => now(),
        ];
    }
}