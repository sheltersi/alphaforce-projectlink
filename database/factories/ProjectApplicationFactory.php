<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectApplication>
 */
class ProjectApplicationFactory extends Factory
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
            'status' => ProjectApplication::STATUS_SUBMITTED,
            'cover_letter' => fake()->paragraph(),
            'submitted_at' => now(),
        ];
    }

    /**
     * Mark the application as accepted.
     */
    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectApplication::STATUS_ACCEPTED,
        ]);
    }

    /**
     * Mark the application as rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectApplication::STATUS_REJECTED,
        ]);
    }
}