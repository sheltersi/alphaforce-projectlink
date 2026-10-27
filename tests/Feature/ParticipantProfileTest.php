<?php

use App\Models\ParticipantProfile;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

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
        'firstName' => 'Thandi',
        'lastName' => 'Nkosi',
        'email' => 'thandi@example.org',
        'idNumber' => 'ID-12345',
        'phone' => '+27 84 000 0000',
        'city' => 'Johannesburg',
        'country' => 'South Africa',
        'nationality' => 'South African',
        'summary' => str_repeat('Experienced project participant with strong community mobilization skills. ', 5), // >40 chars
        'skills' => ['Data Analysis', 'Communication', 'Research'],
        'education' => [
            [
                'institution' => 'University of South Africa',
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
                'location' => 'Johannesburg, South Africa',
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
    expect($profile->first_name)->toBe('Thandi');
    expect($profile->skills)->toHaveCount(3);
    expect($profile->educations)->toHaveCount(1);
    expect($profile->workExperiences)->toHaveCount(1);
    expect($profile->certifications)->toHaveCount(1);
    expect($profile->phone)->toBe('+27 87 000 0000');
    expect($profile->id_number)->toBe('ID-12345');
    expect($profile->nationality)->toBe('South African');
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

test('candidate onboarding cannot complete without all required documents', function () {
    $user = User::factory()->create();
    $user->assignRole('participant');
    $document = fn (string $category): array => [
        'name' => str_replace(' ', '-', strtolower($category)).'.pdf',
        'size' => 20,
        'type' => 'application/pdf',
        'category' => $category,
        'dataUrl' => 'data:application/pdf;base64,'.base64_encode('document'),
    ];

    $response = $this->actingAs($user)->postJson(route('onboarding.profile.store'), [
        'firstName' => 'Jane',
        'lastName' => 'Doe',
        'email' => 'jane@example.com',
        'summary' => str_repeat('Candidate onboarding document test. ', 2),
        'skills' => ['Research'],
        'redirect_to' => 'dashboard',
        'documents' => [
            $document('ID'),
            $document('Proof of residence'),
        ],
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('documents')
        ->assertJsonPath('errors.documents.0', 'Upload the required SARS document.');
});

test('candidate can complete onboarding with required documents and no bank letter', function () {
    $user = User::factory()->create();
    $user->assignRole('participant');
    $document = fn (string $category): array => [
        'name' => str_replace(' ', '-', strtolower($category)).'.pdf',
        'size' => 20,
        'type' => 'application/pdf',
        'category' => $category,
        'dataUrl' => 'data:application/pdf;base64,'.base64_encode('document'),
    ];

    $this->actingAs($user)->postJson(route('onboarding.profile.store'), [
        'firstName' => 'Jane',
        'lastName' => 'Doe',
        'email' => 'jane@example.com',
        'summary' => str_repeat('Candidate onboarding document test. ', 2),
        'skills' => ['Research'],
        'redirect_to' => 'dashboard',
        'documents' => [
            $document('ID'),
            $document('Proof of residence'),
            $document('SARS document'),
        ],
    ])->assertOk();

    expect(ParticipantProfile::where('user_id', $user->id)->firstOrFail()->documents->pluck('category')->all())
        ->toContain('ID', 'Proof of residence', 'SARS document')
        ->toHaveCount(3);
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

test('candidate documents page lists only their own uploaded files', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('candidate');
    $profile = ParticipantProfile::create([
        'user_id' => $user->id,
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => $user->email,
        'id_number' => 'ID-123',
        'phone' => '555-0100',
        'city' => 'Cape Town',
        'country' => 'South Africa',
        'nationality' => 'South African',
        'summary' => str_repeat('Candidate profile summary. ', 3),
    ]);
    $profile->skills()->create(['name' => 'Research']);
    $filePath = "participant-documents/{$profile->id}/id.pdf";
    Storage::disk('local')->put($filePath, 'id document');
    $document = $profile->documents()->create([
        'original_name' => 'id.pdf',
        'file_path' => $filePath,
        'disk' => 'local',
        'file_size' => 12,
        'mime_type' => 'application/pdf',
        'category' => 'ID',
    ]);

    $otherUser = User::factory()->create();
    $otherProfile = ParticipantProfile::create([
        'user_id' => $otherUser->id,
        'first_name' => 'Other',
        'last_name' => 'Candidate',
        'email' => $otherUser->email,
    ]);
    $otherProfile->documents()->create([
        'original_name' => 'private.pdf',
        'file_path' => 'participant-documents/2/private.pdf',
        'disk' => 'local',
        'file_size' => 20,
        'mime_type' => 'application/pdf',
        'category' => 'SARS document',
    ]);

    $this->actingAs($user)
        ->get(route('documents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('documents/index')
            ->has('documents', 1)
            ->where('documents.0.name', 'id.pdf')
            ->where('requiredDocuments.0.category', 'ID')
            ->where('requiredDocuments.0.uploaded', true)
            ->where('requiredDocuments.2.uploaded', false),
        );

    $viewResponse = $this->actingAs($user)->get(route('documents.view', $document));
    $viewResponse->assertOk();
    expect($viewResponse->headers->get('content-disposition'))->toContain('inline');
});

test('candidate can rename and replace an uploaded document', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('candidate');
    $profile = ParticipantProfile::create([
        'user_id' => $user->id,
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'email' => $user->email,
        'id_number' => 'ID-123',
        'phone' => '555-0100',
        'city' => 'Cape Town',
        'country' => 'South Africa',
        'nationality' => 'South African',
        'summary' => str_repeat('Candidate profile summary. ', 3),
    ]);
    $profile->skills()->create(['name' => 'Research']);
    $oldPath = "participant-documents/{$profile->id}/id.pdf";
    Storage::disk('local')->put($oldPath, 'original document');
    $document = $profile->documents()->create([
        'original_name' => 'id.pdf',
        'file_path' => $oldPath,
        'disk' => 'local',
        'file_size' => 17,
        'mime_type' => 'application/pdf',
        'category' => 'ID',
    ]);

    $this->actingAs($user)
        ->patch(route('documents.update', $document), ['original_name' => 'My ID.pdf'])
        ->assertRedirect();
    expect($document->fresh()->original_name)->toBe('My ID.pdf');

    $this->actingAs($user)
        ->post(route('documents.update', $document), [
            '_method' => 'PATCH',
            'replacement_file' => UploadedFile::fake()->create('replacement.pdf', 220, 'application/pdf'),
        ])
        ->assertRedirect();

    $document->refresh();
    expect($document->original_name)->toBe('My ID.pdf')
        ->and($document->category)->toBe('ID')
        ->and($document->file_path)->not->toBe($oldPath);
    Storage::disk('local')->assertMissing($oldPath);
    Storage::disk('local')->assertExists($document->file_path);
});

test('candidate cannot rename another users document', function () {
    $owner = User::factory()->create();
    $profile = ParticipantProfile::create([
        'user_id' => $owner->id,
        'first_name' => 'Document',
        'last_name' => 'Owner',
        'email' => $owner->email,
    ]);
    $document = $profile->documents()->create([
        'original_name' => 'private.pdf',
        'file_path' => 'participant-documents/private.pdf',
        'disk' => 'local',
        'file_size' => 17,
        'mime_type' => 'application/pdf',
        'category' => 'ID',
    ]);
    $otherUser = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($otherUser)
        ->patch(route('documents.update', $document), ['original_name' => 'stolen.pdf'])
        ->assertNotFound();
    $this->actingAs($otherUser)
        ->get(route('documents.view', $document))
        ->assertNotFound();

    expect($document->fresh()->original_name)->toBe('private.pdf');
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

test('profile preview redirects to the builder when no profile exists', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('participant');

    $this->actingAs($user)
        ->get(route('onboarding.profile-preview'))
        ->assertRedirect(route('onboarding.build-profile'));
});

test('profile preview renders the saved profile from the database', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('participant');

    $this->actingAs($user)->postJson(route('onboarding.profile.store'), [
        'firstName' => 'Thandi',
        'lastName' => 'Nkosi',
        'email' => 'thandi@example.org',
        'summary' => str_repeat('Experienced project participant. ', 5),
        'skills' => ['Research'],
    ])->assertOk();

    $response = $this->actingAs($user)->get(route('onboarding.profile-preview'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('onboarding/profile-preview')
        ->where('profile.firstName', 'Thandi')
        ->where('profile.skills.0', 'Research'),
    );
});

test('saving from the preview redirects to the dashboard', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('participant');

    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->post(route('onboarding.profile.store'), [
            'firstName' => 'Thandi',
            'lastName' => 'Nkosi',
            'email' => 'thandi@example.org',
            'summary' => str_repeat('Experienced project participant. ', 5),
            'skills' => ['Research'],
            'redirect_to' => 'dashboard',
            'documents' => collect(['ID', 'Proof of residence', 'SARS document'])
                ->map(fn (string $category) => [
                    'name' => str_replace(' ', '-', strtolower($category)).'.pdf',
                    'size' => 20,
                    'type' => 'application/pdf',
                    'category' => $category,
                    'dataUrl' => 'data:application/pdf;base64,'.base64_encode('document'),
                ])
                ->all(),
        ]);

    $response->assertRedirect(route('dashboard'));
    expect(ParticipantProfile::where('user_id', $user->id)->exists())->toBeTrue();
});

test('re-saving a profile keeps existing documents and files', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('participant');

    $pdfDataUrl = 'data:application/pdf;base64,'.base64_encode('fake pdf content');

    $this->actingAs($user)->postJson(route('onboarding.profile.store'), [
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
    ])->assertOk();

    // Load the payload exactly as the preview page receives it (no dataUrl, includes filePath).
    $payload = $this->actingAs($user)
        ->getJson(route('onboarding.profile.show'))
        ->json('profile');

    // Saving that payload again must not delete or duplicate the document.
    $this->actingAs($user)->postJson(route('onboarding.profile.store'), $payload)->assertOk();

    $profile = ParticipantProfile::where('user_id', $user->id)->first();
    expect($profile->documents)->toHaveCount(1);
    Storage::disk('local')->assertExists($profile->documents->first()->file_path);
});
