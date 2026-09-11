<?php

namespace Database\Factories;

use App\Models\Timesheet;
use App\Models\TimesheetEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TimesheetEntry>
 */
class TimesheetEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'timesheet_id' => Timesheet::factory(),
            'work_date' => fake()->date(),
            'hours' => fake()->randomFloat(2, 1, 8),
            'description' => fake()->sentence(),
        ];
    }
}