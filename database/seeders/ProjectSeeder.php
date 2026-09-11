<?php

namespace Database\Seeders;

use App\Models\Organisation;
use App\Models\ParticipantProfile;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectParticipant;
use App\Models\Skill;
use App\Models\Timesheet;
use App\Models\TimesheetEntry;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProjectSeeder extends Seeder
{
    /**
     * Seed projects and their related tables.
     */
    public function run(): void
    {
        $this->resetProjectTables();

        $admin = $this->user('admin@example.com', 'Admin User', 'technical_admin');
        $manager = $this->user('manager@example.com', 'Manager User', 'project_manager');

        $participants = collect([]);
        foreach (range(1, 8) as $i) {
            $participants->push($this->user("participant{$i}@example.com", $this->participantName($i), 'participant'));
        }

        $this->seedParticipantProfiles($participants);

        $organisations = $this->seedOrganisations($admin);
        $this->seedOrganisationUsers($organisations, $admin, $manager, $participants);

        $this->seedProjects($manager);

        $this->seedApplications($participants);
        $this->seedParticipants($admin, $participants);
        $this->seedTimesheets($manager);
    }

    private function seedOrganisations(User $admin): Collection
    {
        $seeded = collect([]);

        foreach (Organisation::SEED as $name => $details) {
            $seeded->push(
                Organisation::firstOrCreate(
                    ['name' => $name],
                    array_merge($details, ['created_by' => $admin->id]),
                ),
            );
        }

        return $seeded;
    }

    private function seedOrganisationUsers(
        Collection $organisations,
        User $admin,
        User $manager,
        Collection $participants,
    ): void {
        foreach ($organisations as $organisation) {
            $organisation->users()->syncWithoutDetaching([
                $admin->id => ['role' => 'admin'],
                $manager->id => ['role' => 'manager'],
            ]);

            foreach ($participants->shuffle()->take(random_int(2, 4)) as $member) {
                $organisation->users()->syncWithoutDetaching([
                    $member->id => ['role' => 'member'],
                ]);
            }
        }
    }

    private function resetProjectTables(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        foreach ([
            'timesheet_entries',
            'timesheets',
            'project_participants',
            'project_applications',
            'project_skill',
            'projects',
        ] as $table) {
            DB::table($table)->truncate();
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    private function user(string $email, string $name, string $role): User
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => 'password'],
        );

        $user->assignRole($role);

        return $user;
    }

    private function participantName(int $index): string
    {
        return User::SEED_NAMES[($index - 1) % count(User::SEED_NAMES)]
            ?? fake()->name();
    }

    private function seedParticipantProfiles(iterable $participants): void
    {
        foreach ($participants as $participant) {
            if ($participant->participantProfile) {
                continue;
            }

            [$firstName, $lastName] = array_pad(explode(' ', $participant->name, 2), 2, $participant->name);

            $profile = ParticipantProfile::create([
                'user_id' => $participant->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $participant->email,
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

    private function seedProjects(User $manager): void
    {
        foreach (Project::SEED as $data) {
            $project = Project::create([
                'organisation_id' => Organisation::inRandomOrder()->value('id'),
                'created_by' => $manager->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'location' => $data['location'],
                'status' => $data['status'],
                'start_date' => $data['start_date'] ? Carbon::parse($data['start_date']) : null,
                'end_date' => $data['end_date'] ? Carbon::parse($data['end_date']) : null,
                'positions' => $data['positions'],
            ]);

            $skillIds = Skill::query()->inRandomOrder()->limit(random_int(3, 4))->pluck('id');
            $project->skills()->sync($skillIds);
        }
    }

    private function seedApplications(iterable $participants): void
    {
        $projects = Project::whereIn('status', [Project::STATUS_OPEN, Project::STATUS_IN_PROGRESS])->get();

        foreach ($projects as $project) {
            $maxApplications = min($project->positions + 3, count($participants));
            $candidates = collect($participants)->shuffle()->take($maxApplications);

            foreach ($candidates as $candidate) {
                $status = match (random_int(1, 10)) {
                    1 => ProjectApplication::STATUS_REJECTED,
                    2 => ProjectApplication::STATUS_WITHDRAWN,
                    3 => ProjectApplication::STATUS_SHORTLISTED,
                    4 => ProjectApplication::STATUS_UNDER_REVIEW,
                    5 => ProjectApplication::STATUS_ACCEPTED,
                    default => ProjectApplication::STATUS_SUBMITTED,
                };

                ProjectApplication::create([
                    'project_id' => $project->id,
                    'user_id' => $candidate->id,
                    'status' => $status,
                    'cover_letter' => fake()->optional(0.7)->paragraph(),
                    'submitted_at' => fake()->dateTimeBetween('-3 weeks', '-1 day'),
                ]);
            }
        }
    }

    private function seedParticipants(User $admin, iterable $participants): void
    {
        $activeProjects = Project::whereIn('status', [Project::STATUS_OPEN, Project::STATUS_IN_PROGRESS])->get();

        foreach ($activeProjects as $project) {
            $slots = max(1, $project->positions);
            $accepted = $project->applications()
                ->where('status', ProjectApplication::STATUS_ACCEPTED)
                ->limit($slots)
                ->get();

            foreach ($accepted as $application) {
                ProjectParticipant::firstOrCreate(
                    ['project_id' => $project->id, 'user_id' => $application->user_id],
                    [
                        'application_id' => $application->id,
                        'role' => fake()->randomElement(['participant', 'participant', 'lead']),
                        'status' => ProjectParticipant::STATUS_ACTIVE,
                        'joined_at' => $project->status === Project::STATUS_IN_PROGRESS
                            ? fake()->dateTimeBetween('-2 months', '-2 weeks')
                            : Carbon::today(),
                    ],
                );
            }
        }

        $completedProjects = Project::where('status', Project::STATUS_COMPLETED)->get();

        foreach ($completedProjects as $project) {
            foreach (collect($participants)->shuffle()->take(random_int(2, 4)) as $participant) {
                ProjectParticipant::firstOrCreate(
                    ['project_id' => $project->id, 'user_id' => $participant->id],
                    [
                        'application_id' => null,
                        'role' => 'participant',
                        'status' => ProjectParticipant::STATUS_COMPLETED,
                        'joined_at' => fake()->dateTimeBetween('-6 months', '-3 months'),
                    ],
                );
            }
        }

        // Ensure the admin is listed as the contact on a couple of projects
        $adminProject = Project::inRandomOrder()->first();
        if ($adminProject) {
            ProjectParticipant::firstOrCreate(
                ['project_id' => $adminProject->id, 'user_id' => $admin->id],
                [
                    'application_id' => null,
                    'role' => 'lead',
                    'status' => ProjectParticipant::STATUS_ACTIVE,
                    'joined_at' => Carbon::today(),
                ],
            );
        }
    }

    private function seedTimesheets(User $manager): void
    {
        $members = ProjectParticipant::where('status', ProjectParticipant::STATUS_ACTIVE)
            ->whereHas('project', fn ($query) => $query->where('status', Project::STATUS_IN_PROGRESS))
            ->get();

        $weekStart = Carbon::now()->startOfWeek();
        $lastWeekStart = $weekStart->copy()->subWeek();

        foreach ($members as $member) {
            $this->makeTimesheet(
                $member,
                $lastWeekStart,
                $lastWeekStart->copy()->addDays(6),
                Timesheet::STATUS_APPROVED,
                $manager,
            );

            $this->makeTimesheet(
                $member,
                $weekStart,
                $weekStart->copy()->addDays(6),
                fake()->randomElement([Timesheet::STATUS_DRAFT, Timesheet::STATUS_SUBMITTED]),
                null,
            );
        }
    }

    private function makeTimesheet(
        ProjectParticipant $participant,
        Carbon $periodStart,
        Carbon $periodEnd,
        string $status,
        ?User $approver,
    ): void {
        $entries = [];
        $totalHours = 0;
        $usedDays = [];

        foreach (range(1, random_int(2, 4)) as $i) {
            $day = random_int(0, 4);

            while (in_array($day, $usedDays, true)) {
                $day = random_int(0, 4);
            }

            $usedDays[] = $day;
            $hours = random_int(2, 8);
            $totalHours += $hours;

            $entries[] = [
                'work_date' => $periodStart->copy()->addDays($day),
                'hours' => $hours,
                'description' => fake()->sentence(6),
            ];
        }

        $timesheet = Timesheet::create([
            'project_participant_id' => $participant->id,
            'period_start' => $periodStart->toDateString(),
            'period_end' => $periodEnd->toDateString(),
            'total_hours' => $totalHours,
            'status' => $status,
            'note' => fake()->optional(0.4)->sentence(),
            'approved_by' => $approver?->id,
            'approved_at' => $approver ? $periodEnd->copy()->addDay() : null,
        ]);

        foreach ($entries as $entry) {
            TimesheetEntry::create([
                'timesheet_id' => $timesheet->id,
                'work_date' => $entry['work_date'],
                'hours' => $entry['hours'],
                'description' => $entry['description'],
            ]);
        }
    }
}