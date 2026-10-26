<?php

namespace Database\Seeders;

use App\Models\ParticipantProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ParticipantSeeder extends Seeder
{
    /** @var array<string, array<string, mixed>> */
    private const PROFILES = [
        'Thandi Nkosi' => [
            'id_number' => '9607180092081', 'phone' => '+27 82 555 0109', 'city' => 'Pietermaritzburg', 'country' => 'South Africa', 'nationality' => 'South African',
            'summary' => 'Youth development practitioner passionate about mentorship, life-skills training, and creating safe spaces where young people can thrive.',
            'skills' => ['Mentoring', 'Event Planning', 'Public Speaking', 'Volunteer Recruitment'],
            'education' => [['University of KwaZulu-Natal', 'Bachelor of Arts', 'Psychology', '2015', '2018', 'Focused on developmental psychology and group facilitation.']],
            'experience' => [['Youth Programme Facilitator', 'Thrive Youth Collective', 'Pietermaritzburg, South Africa', '2020-03', null, true, 'Facilitates life-skills workshops and coordinates peer mentor networks.'], ['Aftercare Assistant', 'Sunrise Community Centre', 'Pietermaritzburg, South Africa', '2018-06', '2020-02', false, 'Supported after-school programmes and holiday activities.']],
            'certifications' => [['Child Protection in the Community', 'UNICEF South Africa', 'UNICEF-CP-2023-4410', '2023-06', null]],
        ],
        'Johan van Wyk' => [
            'id_number' => '8709245059083', 'phone' => '+27 83 555 0110', 'city' => 'Bloemfontein', 'country' => 'South Africa', 'nationality' => 'South African',
            'summary' => 'Logistics-minded operations volunteer with hands-on experience in warehouse coordination, driver scheduling, and supply distribution.',
            'skills' => ['Project Coordination', 'Budgeting', 'First Aid', 'Community Outreach'],
            'education' => [['Central University of Technology', 'Diploma', 'Logistics Management', '2010', '2012', 'Covered supply chain basics, warehousing, and transport planning.']],
            'experience' => [['Distribution Coordinator', 'FoodForward SA', 'Bloemfontein, South Africa', '2019-11', null, true, 'Coordinates food parcel packing, driver routes, and beneficiary registrations.'], ['Warehouse Assistant', 'Free State Relief Stores', 'Bloemfontein, South Africa', '2013-02', '2019-10', false, 'Managed stock counts, loading schedules, and delivery paperwork.']],
            'certifications' => [['First Aid Level 3', 'South African Red Cross Society', 'SARC-FA3-2022-8834', '2022-09', '2025-09']],
        ],
        'Naledi Dlamini' => [
            'id_number' => '9801150207088', 'phone' => '+27 84 555 0111', 'city' => 'Polokwane', 'country' => 'South Africa', 'nationality' => 'South African',
            'summary' => 'Environmental science graduate eager to apply field research, water monitoring, and community education to local conservation efforts.',
            'skills' => ['Applied Research', 'Data Analysis', 'Community Outreach', 'Technical Writing'],
            'education' => [['University of Limpopo', 'Bachelor of Science', 'Environmental Science', '2017', '2020', 'Research project on groundwater quality in rural catchments.']],
            'experience' => [['Field Research Assistant', 'Limpopo Water Watch', 'Polokwane, South Africa', '2021-08', null, true, 'Collects water samples, maintains monitoring equipment, and drafts site reports.'], ['Eco Club Coordinator', 'Green Schools Limpopo', 'Polokwane, South Africa', '2020-03', '2021-07', false, 'Ran school recycling drives and indigenous tree planting days.']],
            'certifications' => [['Water Quality Monitoring', 'Department of Water and Sanitation', 'DWS-WQM-2024-0522', '2024-03', null]],
        ],
    ];

    public function run(): void
    {
        foreach (self::PROFILES as $name => $data) {
            $user = $this->makeUser($name);
            $this->seedProfile($user, $data);
        }
    }

    private function makeUser(string $name): User
    {
        $email = Str::of($name)->ascii()->lower()->replace(' ', '.').'@example.com';
        $user = User::firstOrCreate(['name' => $name], ['email' => $email, 'password' => 'password']);
        $user->update(['email' => $email]);

        $user->assignRole('candidate');

        return $user;
    }

    /** @param array<string, mixed> $data */
    private function seedProfile(User $user, array $data): void
    {
        [$firstName, $lastName] = array_pad(explode(' ', $user->name, 2), 2, '');

        $profile = ParticipantProfile::updateOrCreate(['user_id' => $user->id], [
            'first_name' => $firstName, 'last_name' => $lastName, 'email' => $user->email,
            'id_number' => $data['id_number'], 'phone' => $data['phone'], 'city' => $data['city'],
            'country' => $data['country'], 'nationality' => $data['nationality'], 'summary' => $data['summary'],
        ]);

        $profile->skills()->delete();
        foreach ($data['skills'] as $skill) {
            $profile->skills()->create(['name' => $skill]);
        }

        $profile->educations()->delete();
        foreach ($data['education'] as $index => [$institution, $qualification, $field, $start, $end, $description]) {
            $profile->educations()->create(compact('institution', 'qualification', 'description') + ['field_of_study' => $field, 'start_year' => $start, 'end_year' => $end, 'sort_order' => $index]);
        }

        $profile->workExperiences()->delete();
        foreach ($data['experience'] as $index => [$title, $organisation, $location, $start, $end, $current, $description]) {
            $profile->workExperiences()->create(['job_title' => $title, 'organisation' => $organisation, 'location' => $location, 'start_date' => $start, 'end_date' => $end, 'currently_working' => $current, 'description' => $description, 'sort_order' => $index]);
        }

        $profile->certifications()->delete();
        foreach ($data['certifications'] as $index => [$name, $issuer, $number, $issueDate, $expiryDate]) {
            $profile->certifications()->create(['name' => $name, 'issuing_organisation' => $issuer, 'credential_number' => $number, 'issue_date' => $issueDate, 'expiry_date' => $expiryDate, 'sort_order' => $index]);
        }
    }
}
