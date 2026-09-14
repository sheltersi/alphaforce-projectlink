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
        'Liam van der Berg' => [
            'id_number' => '9004155012087', 'phone' => '+27 82 555 0101', 'city' => 'Cape Town', 'country' => 'South Africa', 'nationality' => 'South African',
            'summary' => 'Community-focused project coordinator with experience delivering youth development programmes, coordinating volunteers, and reporting clearly to partners.',
            'skills' => ['Project Coordination', 'Community Outreach', 'Event Planning', 'Budgeting'],
            'education' => [['Cape Peninsula University of Technology', 'Diploma', 'Public Management', '2016', '2018', 'Completed practical coursework in community development and project administration.']],
            'experience' => [['Programme Coordinator', 'Ubuntu Youth Network', 'Cape Town, South Africa', '2021-03', null, true, 'Coordinates workshops, volunteer schedules, budgets, and stakeholder updates.'], ['Community Liaison Officer', 'Greenpoint Civic Trust', 'Cape Town, South Africa', '2019-01', '2021-02', false, 'Supported local outreach initiatives and participant recruitment.']],
            'certifications' => [['Project Management Fundamentals', 'PMI South Africa Chapter', 'PMI-SA-2023-1842', '2023-08', null]],
        ],
        'Zara Almeida' => [
            'id_number' => '9208240065084', 'phone' => '+27 83 555 0102', 'city' => 'Johannesburg', 'country' => 'South Africa', 'nationality' => 'South African',
            'summary' => 'Creative communications specialist who turns programme insights into accessible digital stories, campaigns, and visual materials for diverse audiences.',
            'skills' => ['Graphic Design', 'Social Media', 'Technical Writing', 'Public Speaking'],
            'education' => [['University of Johannesburg', 'Bachelor of Arts', 'Visual Communication', '2015', '2018', 'Focused on visual storytelling, branding, and digital media production.']],
            'experience' => [['Communications Officer', 'Future Cities Lab', 'Johannesburg, South Africa', '2022-02', null, true, 'Creates campaign content, manages social media calendars, and produces project reports.'], ['Junior Designer', 'Mosaic Creative Studio', 'Johannesburg, South Africa', '2019-01', '2022-01', false, 'Designed print and digital collateral for community organisations.']],
            'certifications' => [['Adobe Certified Professional', 'Adobe', 'ACP-2024-3091', '2024-04', '2027-04']],
        ],
        'Noah Okonkwo' => [
            'id_number' => '8801125039081', 'phone' => '+27 84 555 0103', 'city' => 'Pretoria', 'country' => 'South Africa', 'nationality' => 'Nigerian',
            'summary' => 'Data analyst with a practical interest in using survey data, dashboards, and evidence-based reporting to improve community programmes.',
            'skills' => ['Data Analysis', 'Survey Design', 'Applied Research', 'Technical Writing'],
            'education' => [['University of Pretoria', 'Master of Science', 'Data Science', '2018', '2020', 'Research focused on analysing public service delivery data.'], ['University of Lagos', 'Bachelor of Science', 'Statistics', '2013', '2017', 'Built a foundation in statistical methods and research design.']],
            'experience' => [['Monitoring and Evaluation Analyst', 'Insight for Impact', 'Pretoria, South Africa', '2021-06', null, true, 'Builds data collection tools and translates results into decision-ready reports.'], ['Research Assistant', 'Social Metrics Africa', 'Pretoria, South Africa', '2020-02', '2021-05', false, 'Cleaned datasets and supported field research teams.']],
            'certifications' => [['Google Data Analytics Professional Certificate', 'Google', 'GDA-2022-7716', '2022-11', null]],
        ],
        'Aisha Rahman' => [
            'id_number' => '9406210147086', 'phone' => '+27 85 555 0104', 'city' => 'Durban', 'country' => 'South Africa', 'nationality' => 'South African',
            'summary' => 'Experienced field practitioner committed to inclusive health outreach, volunteer mentoring, and building trusted relationships with local communities.',
            'skills' => ['Community Outreach', 'First Aid', 'Mentoring', 'Volunteer Recruitment'],
            'education' => [['University of KwaZulu-Natal', 'Bachelor of Social Science', 'Community Development', '2014', '2017', 'Studied participatory development and community health practice.']],
            'experience' => [['Community Health Facilitator', 'Health Access Collective', 'Durban, South Africa', '2020-07', null, true, 'Facilitates health education sessions and mentors community volunteers.'], ['Field Officer', 'Coastal Care Initiative', 'Durban, South Africa', '2017-08', '2020-06', false, 'Delivered household outreach and maintained referral records.']],
            'certifications' => [['First Aid Level 2', 'South African Red Cross Society', 'SARC-FA2-2023-5508', '2023-05', '2026-05']],
        ],
        'Lucas Moreau' => [
            'id_number' => '9103075094089', 'phone' => '+27 86 555 0105', 'city' => 'Stellenbosch', 'country' => 'South Africa', 'nationality' => 'French',
            'summary' => 'Full-stack developer who enjoys building reliable, user-friendly tools that help teams coordinate projects and make better use of their data.',
            'skills' => ['Web Development', 'Data Analysis', 'Project Coordination', 'Technical Writing'],
            'education' => [['Stellenbosch University', 'Master of Engineering', 'Software Engineering', '2016', '2018', 'Developed web applications for civic technology projects.'], ['Université de Lyon', 'Bachelor of Science', 'Computer Science', '2012', '2015', 'Covered software development, databases, and systems design.']],
            'experience' => [['Software Developer', 'Civic Digital Works', 'Stellenbosch, South Africa', '2021-01', null, true, 'Develops internal platforms and dashboards for social impact teams.'], ['Web Developer', 'Open Neighbourhoods', 'Cape Town, South Africa', '2018-03', '2020-12', false, 'Built accessible websites and maintained content management systems.']],
            'certifications' => [['AWS Certified Cloud Practitioner', 'Amazon Web Services', 'AWS-CCP-2024-1207', '2024-02', '2027-02']],
        ],
        'Priya Sharma' => [
            'id_number' => '9309140183082', 'phone' => '+27 87 555 0106', 'city' => 'Gqeberha', 'country' => 'South Africa', 'nationality' => 'South African',
            'summary' => 'Grant and programme professional with a strong track record of coordinating partner deliverables, managing budgets, and supporting community-led initiatives.',
            'skills' => ['Grant Writing', 'Budgeting', 'Project Coordination', 'Community Outreach'],
            'education' => [['Rhodes University', 'Bachelor of Commerce', 'Management', '2012', '2015', 'Completed modules in financial management and organisational development.']],
            'experience' => [['Grants Coordinator', 'Eastern Cape Development Fund', 'Gqeberha, South Africa', '2020-04', null, true, 'Prepares grant applications, tracks budgets, and supports funded partners.'], ['Programme Administrator', 'Bay Community Foundation', 'Gqeberha, South Africa', '2016-02', '2020-03', false, 'Administered programme records, events, and supplier payments.']],
            'certifications' => [['Grant Writing Essentials', 'South African Grantmakers Association', 'SAGA-2023-2284', '2023-09', null]],
        ],
        'Mateo Rossi' => [
            'id_number' => '8907305077080', 'phone' => '+27 88 555 0107', 'city' => 'Bloemfontein', 'country' => 'South Africa', 'nationality' => 'Italian',
            'summary' => 'Engagement coordinator experienced in planning participatory events, recruiting volunteers, and creating welcoming spaces for community collaboration.',
            'skills' => ['Event Planning', 'Volunteer Recruitment', 'Public Speaking', 'Community Outreach'],
            'education' => [['University of the Free State', 'Bachelor of Arts', 'Sociology', '2011', '2014', 'Studied social change, community participation, and qualitative research.']],
            'experience' => [['Community Engagement Coordinator', 'Free State Action Hub', 'Bloemfontein, South Africa', '2019-09', null, true, 'Plans public events and coordinates volunteer recruitment campaigns.'], ['Events Assistant', 'City Connect Festival', 'Bloemfontein, South Africa', '2015-01', '2019-08', false, 'Supported event logistics, communications, and vendor coordination.']],
            'certifications' => [['Community Engagement Certificate', 'International Association for Public Participation', 'IAP2-2022-6194', '2022-10', null]],
        ],
        'Elena Petrova' => [
            'id_number' => '9502030123085', 'phone' => '+27 89 555 0108', 'city' => 'Cape Town', 'country' => 'South Africa', 'nationality' => 'Bulgarian',
            'summary' => 'Applied researcher who combines qualitative inquiry, stakeholder engagement, and clear writing to help teams understand needs and measure progress.',
            'skills' => ['Applied Research', 'Survey Design', 'Data Analysis', 'Mentoring'],
            'education' => [['University of Cape Town', 'Master of Philosophy', 'Development Studies', '2017', '2019', 'Completed research on participatory monitoring approaches.'], ['Sofia University', 'Bachelor of Arts', 'International Relations', '2012', '2016', 'Focused on social policy and international development.']],
            'experience' => [['Research and Learning Lead', 'People First Research', 'Cape Town, South Africa', '2021-05', null, true, 'Leads mixed-method research, learning sessions, and evidence synthesis.'], ['Research Consultant', 'Community Evidence Partners', 'Cape Town, South Africa', '2019-02', '2021-04', false, 'Conducted interviews, analysed findings, and prepared client reports.']],
            'certifications' => [['Monitoring, Evaluation and Learning Certificate', 'University of Cape Town', 'UCT-MEL-2023-9013', '2023-12', null]],
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

        if (! $user->hasRole('participant')) {
            $user->assignRole('participant');
        }

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
