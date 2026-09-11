<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'created_by' => User::factory(),
            'organisation_id' => null,
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'location' => fake()->city(),
            'status' => fake()->randomElement([
                Project::STATUS_DRAFT,
                Project::STATUS_OPEN,
                Project::STATUS_IN_PROGRESS,
            ]),
            'start_date' => fake()->date(),
            'end_date' => fake()->date('Y-m-d', '+1 year'),
            'positions' => fake()->numberBetween(1, 5),
        ];
    }

    /**
     * Open the project for applications.
     */
    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Project::STATUS_OPEN,
        ]);
    }

    /**
     * Mark the project as completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Project::STATUS_COMPLETED,
        ]);
    }
}