<?php

namespace Database\Seeders;

use App\Models\ParticipantProfile;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Seeder;

class ParticipantSeeder extends Seeder
{
    public function run(): void
    {
        foreach (User::SEED_NAMES as $offset => $name) {
            $index = $offset + 1;
            $user = $this->makeUser($index, $name);
            $this->seedProfile($user);
        }
    }

    private function makeUser(int $index, string $name): User
    {
        $user = User::firstOrCreate(
            ['email' => "participant{$index}@example.com"],
            ['name' => $name, 'password' => 'password'],
        );

        if (! $user->hasRole('participant')) {
            $user->assignRole('participant');
        }

        return $user;
    }

    private function seedProfile(User $user): void
    {
        if ($user->participantProfile()->exists()) {
            return;
        }

        [$firstName, $lastName] = array_pad(explode(' ', $user->name, 2), 2, $user->name);

        $profile = ParticipantProfile::create([
            'user_id' => $user->id,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $user->email,
            'phone' => fake()->optional()->phoneNumber(),
            'city' => fake()->randomElement(['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague']),
            'country' => 'Netherlands',
            'summary' => fake()->optional(0.8)->paragraph(2),
        ]);

        foreach (fake()->randomElements(Skill::SEED_NAMES, random_int(3, 5)) as $skillName) {
            Skill::firstOrCreate(
                ['participant_profile_id' => $profile->id, 'name' => $skillName],
            );
        }
    }
}
