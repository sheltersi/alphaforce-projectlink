<?php

namespace Database\Factories;

use App\Models\Organisation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Organisation>
 */
class OrganisationFactory extends Factory
{
    protected $model = Organisation::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'description' => fake()->paragraph(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'website' => fake()->url(),
            'city' => fake()->randomElement([
                'Cape Town',
                'Johannesburg',
                'Durban',
                'Pretoria',
                'Gqeberha',
                'Bloemfontein',
                'Polokwane',
                'Stellenbosch',
            ]),
            'country' => 'South Africa',
            'created_by' => User::factory(),
        ];
    }
}
