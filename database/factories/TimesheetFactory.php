<?php

namespace Database\Factories;

use App\Models\ProjectParticipant;
use App\Models\Timesheet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Timesheet>
 */
class TimesheetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $periodStart = fake()->date();

        return [
            'project_participant_id' => ProjectParticipant::factory(),
            'period_start' => $periodStart,
            'period_end' => fake()->date('Y-m-d', '+7 days'),
            'total_hours' => fake()->randomFloat(2, 0, 40),
            'status' => Timesheet::STATUS_DRAFT,
            'note' => fake()->sentence(),
        ];
    }

    /**
     * Submit the timesheet for approval.
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Timesheet::STATUS_SUBMITTED,
        ]);
    }

    /**
     * Mark the timesheet as approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Timesheet::STATUS_APPROVED,
            'approved_at' => now(),
        ]);
    }
}