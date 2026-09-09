<?php

use App\Models\ParticipantProfile;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('public');
    Storage::fake('local');
});

test('participant can save profile with all onboarding data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('participant');

    $payload = [
        'firstName' => 'Amara',
        'lastName' => 'Okafor',
        'email' => 'amara@example.org',
        'phone' => '+260 97 000 0000',
        'city' => 'Lusaka',
        'country' => 'Zambia',
        'summary' => str_repeat('Experienced project participant with strong community mobilization skills. ', 5), // >40 chars
        'skills' => ['Data Analysis', 'Communication', 'Research'],
        'education' => [
            [
                'institution' => 'University of Zambia',
                'qualification' => 'BSc',
                'fieldOfStudy' => 'Development Studies',
                'startYear' => '2018',
                'endYear' => '2022',
                'description' => 'First class honours',
            ],
        ],
        'experience' => [
            [
                'jobTitle' => 'Field Officer',
                'organisation' => 'Community Health Alliance',
                'location' => 'Ndola, Zambia',
                'startDate' => '2022-01',
                'endDate' => '2023-12',
                'currentlyWorking' => false,
                'description' => 'Led field operations',
            ],
        ],
        'certifications' => [
            [
                'name' => 'PMP',
                'issuingOrganisation' => 'PMI',
                'issueDate' => '2023-06',
                'expiryDate' => '2026-06',
                'credentialNumber' => 'CERT-2024-8841',
            ],
        ],
    ];

    $response = $this->actingAs($user)->postJson(route('onboarding.profile.store'), $payload);

    $response->assertOk()->assertJson(['message' => 'Profile saved successfully.']);

    $profile = ParticipantProfile::where('user_id', $user->id)->first();
    expect($profile)->not->toBeNull();
    expect($profile->first_name)->toBe('Amara');
    expect($profile->skills)->toHaveCount(3);
    expect($profile->educations)->toHaveCount(1);
    expect($profile->workExperiences)->toHaveCount(1);
    expect($profile->certifications)->toHaveCount(1);
    expect($profile->phone)->toBe('+260 97 000 0000');
});

test('participant can save profile with photo via base64', function () {
    $user = User::factory()->create();
    $user->assignRole('participant');

    // 1x1 png base64
    $photoDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

    $payload = [
        'firstName' => 'John',
        'lastName' => 'Doe',
        'email' => 'john@example.com',
        'summary' => str_repeat('Summary text for testing. ', 10),
        'skills' => ['Project Management'],
        'photoDataUrl' => $photoDataUrl,
    ];

    $response = $this->actingAs($user)->postJson(route('onboarding.profile.store'), $payload);

    $response->assertOk();
    $profile = ParticipantProfile::where('user_id', $user->id)->first();
    expect($profile->photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($profile->photo_path);
});

test('skills are deduplicated and trimmed', function () {
    $user = User::factory()->create();
    $user->assignRole('participant');

    $payload = [
        'firstName' => 'Jane',
        'lastName' => 'Doe',
        'email' => 'jane@example.com',
        'summary' => str_repeat('Summary text for testing. ', 10),
        'skills' => ['  Data Analysis  ', 'data analysis', 'Communication'],
    ];

    $this->actingAs($user)->postJson(route('onboarding.profile.store'), $payload)->assertOk();

    $profile = ParticipantProfile::where('user_id', $user->id)->first();
    // Should deduplicate case-insensitive and trim
    expect($profile->skills->pluck('name')->toArray())->toHaveCount(2);
});

test('documents via base64 are stored', function () {
    $user = User::factory()->create();
    $user->assignRole('participant');

    $pdfDataUrl = 'data:application/pdf;base64,'.base64_encode('fake pdf content');

    $payload = [
        'firstName' => 'Doc',
        'lastName' => 'Test',
        'email' => 'doc@example.com',
        'summary' => str_repeat('Summary text for testing. ', 10),
        'skills' => ['Research'],
        'documents' => [
            [
                'name' => 'cv.pdf',
                'size' => 1234,
                'type' => 'application/pdf',
                'category' => 'CV',
                'dataUrl' => $pdfDataUrl,
            ],
        ],
    ];

    $response = $this->actingAs($user)->postJson(route('onboarding.profile.store'), $payload);
    $response->assertOk();

    $profile = ParticipantProfile::where('user_id', $user->id)->first();
    expect($profile->documents)->toHaveCount(1);
    $doc = $profile->documents->first();
    expect($doc->original_name)->toBe('cv.pdf');
    expect($doc->category)->toBe('CV');
    Storage::disk('local')->assertExists($doc->file_path);
});

test('participant can load saved profile via GET', function () {
    $user = User::factory()->create();
    $user->assignRole('participant');

    $payload = [
        'firstName' => 'Load',
        'lastName' => 'Test',
        'email' => 'load@example.com',
        'summary' => str_repeat('Summary text for testing. ', 10),
        'skills' => ['Research'],
    ];
    $this->actingAs($user)->postJson(route('onboarding.profile.store'), $payload)->assertOk();

    $response = $this->actingAs($user)->getJson(route('onboarding.profile.show'));
    $response->assertOk()->assertJsonPath('profile.firstName', 'Load');
    expect($response->json('profile.skills'))->toContain('Research');
});

test('profile update replaces previous skills and educations', function () {
    $user = User::factory()->create();
    $user->assignRole('participant');

    $this->actingAs($user)->postJson(route('onboarding.profile.store'), [
        'firstName' => 'A',
        'lastName' => 'B',
        'email' => 'a@b.com',
        'summary' => str_repeat('Summary text for testing. ', 10),
        'skills' => ['Old Skill'],
        'education' => [
            ['institution' => 'Old Uni', 'qualification' => 'BSc', 'startYear' => '2018'],
        ],
    ])->assertOk();

    $this->actingAs($user)->postJson(route('onboarding.profile.store'), [
        'firstName' => 'A',
        'lastName' => 'B',
        'email' => 'a@b.com',
        'summary' => str_repeat('Updated summary for testing. ', 10),
        'skills' => ['New Skill 1', 'New Skill 2'],
        'education' => [
            ['institution' => 'New Uni', 'qualification' => 'MSc', 'startYear' => '2020'],
        ],
    ])->assertOk();

    $profile = ParticipantProfile::where('user_id', $user->id)->first();
    expect($profile->skills->pluck('name')->toArray())->toBe(['New Skill 1', 'New Skill 2']);
    expect($profile->educations)->toHaveCount(1);
    expect($profile->educations->first()->institution)->toBe('New Uni');
});

test('validation fails for invalid fields', function () {
    $user = User::factory()->create();
    $user->assignRole('participant');

    $response = $this->actingAs($user)->postJson(route('onboarding.profile.store'), [
        'firstName' => 'John',
        'lastName' => 'Doe',
        'email' => 'invalid-email',
        'summary' => 'too short',
        'skills' => ['Valid Skill'],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['email', 'summary']);
});
