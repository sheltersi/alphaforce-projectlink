<?php

use App\Http\Resources\Organisation\ApplicationResource;
use App\Http\Resources\Organisation\OrganisationMemberResource;
use App\Http\Resources\Organisation\OrganisationResource;
use App\Http\Resources\Organisation\ParticipantResource;
use App\Http\Resources\Organisation\ProjectListResource;
use App\Http\Resources\Organisation\ProjectParticipantResource;
use App\Http\Resources\Organisation\ProjectResource;
use App\Http\Resources\Organisation\TimesheetEntryResource;
use App\Http\Resources\Organisation\TimesheetResource;
use App\Models\Organisation;
use App\Models\OrganisationUser;
use App\Models\ParticipantProfile;
use App\Models\Project;
use App\Models\ProjectApplication;
use App\Models\ProjectParticipant;
use App\Models\Skill;
use App\Models\Timesheet;
use App\Models\TimesheetEntry;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

function orgRequest(): Request
{
    return Request::create('/test', 'GET');
}

/**
 * Fully resolve a resource (or collection) to a plain array, the same way
 * an HTTP JSON response would serialize it. `resolve()` alone leaves nested
 * JsonResource objects unresolved, so a JSON round-trip is required to
 * exercise nested serialization (and sensitive-field filtering).
 */
function resolveJson(mixed $resource): array
{
    return json_decode(json_encode($resource->resolve(orgRequest())), true);
}

function makeParticipant(User $user): ParticipantProfile
{
    $profile = ParticipantProfile::create([
        'user_id' => $user->id,
        'first_name' => 'Test',
        'last_name' => 'Participant',
        'email' => $user->email,
        'id_number' => 'ID-SECRET-123',
        'phone' => '+1-555-9999',
        'city' => 'Amsterdam',
        'country' => 'Netherlands',
        'nationality' => 'Dutch',
        'summary' => str_repeat('Experienced volunteer. ', 5),
    ]);
    Skill::create(['participant_profile_id' => $profile->id, 'name' => 'Mentoring']);

    return $profile;
}

it('serializes an organisation with optional members and counts', function () {
    $org = Organisation::factory()->create();
    $member = User::factory()->create();
    OrganisationUser::create(['organisation_id' => $org->id, 'user_id' => $member->id, 'role' => 'manager']);

    // Without loaded relations: no nested data, no counts.
    $bare = resolveJson(new OrganisationResource($org));
    expect($bare)->toHaveKeys(['id', 'name', 'slug', 'description', 'email', 'phone', 'website', 'city', 'country', 'created_at', 'updated_at']);
    expect($bare)->not->toHaveKey('members')
        ->and($bare)->not->toHaveKey('members_count')
        ->and($bare)->not->toHaveKey('projects_count');

    // With loaded relations + counts.
    $loaded = Organisation::with(['organisationUsers.user'])->withCount(['organisationUsers', 'projects'])->find($org->id);
    $array = resolveJson(new OrganisationResource($loaded));

    expect($array['members_count'])->toBe(1);
    expect($array['projects_count'])->toBe(0);
    expect($array['members'])->toHaveCount(1);
    expect($array['members'][0]['role'])->toBe('manager');
    expect($array['members'][0]['user']['email'])->toBe($member->email);
    expect($array['members'][0]['user'])->not->toHaveKey('password');
});

it('serializes project detail only with loaded relations and does not query when bare', function () {
    $org = Organisation::factory()->create();
    $project = Project::factory()->create(['organisation_id' => $org->id]);

    $fresh = Project::find($project->id);
    DB::flushQueryLog();
    DB::enableQueryLog();
    $bare = (new ProjectResource($fresh))->resolve(orgRequest());
    $queries = DB::getQueryLog();
    DB::disableQueryLog();

    expect($queries)->toHaveCount(0);
    expect($bare)->toHaveKeys(['id', 'title', 'slug', 'status', 'positions', 'created_at']);
    expect($bare)->not->toHaveKey('applications_count');
    expect($bare)->not->toHaveKey('organisation');

    $loaded = Project::with(['organisation', 'creator'])->withCount(['applications', 'participants', 'likes'])->find($project->id);
    $array = resolveJson(new ProjectResource($loaded));
    expect($array['organisation']['name'])->toBe($org->name);
    expect($array['creator']['id'])->toBe($loaded->created_by);
    expect($array)->toHaveKeys(['applications_count', 'participants_count', 'likes_count']);
});

it('serializes a lightweight project list without heavy nesting', function () {
    $org = Organisation::factory()->create();
    Project::factory()->count(3)->create(['organisation_id' => $org->id]);

    $projects = Project::with('organisation')->withCount(['applications', 'participants', 'likes'])->get();
    $collection = resolveJson(ProjectListResource::collection($projects));

    expect($collection)->toHaveCount(3);
    expect($collection[0])->not->toHaveKey('description');
    expect($collection[0]['organisation']['name'])->toBe($org->name);
    expect($collection[0])->toHaveKeys(['applications_count', 'participants_count', 'likes_count']);
});

it('serializes applications with project, applicant and assignment when loaded', function () {
    $manager = User::factory()->create();
    $applicant = User::factory()->create();
    makeParticipant($applicant);
    $project = Project::factory()->create(['created_by' => $manager->id, 'status' => Project::STATUS_OPEN]);
    $application = ProjectApplication::factory()->create([
        'project_id' => $project->id,
        'user_id' => $applicant->id,
        'status' => ProjectApplication::STATUS_SUBMITTED,
    ]);

    $bare = resolveJson(new ApplicationResource(ProjectApplication::find($application->id)));
    expect($bare)->toHaveKeys(['id', 'project_id', 'user_id', 'status', 'cover_letter', 'submitted_at']);
    expect($bare)->not->toHaveKey('reviewed_at');
    expect($bare)->not->toHaveKey('reviewed_by');
    expect($bare)->not->toHaveKey('project');

    $loaded = ProjectApplication::with(['project', 'user.participantProfile.skills', 'participant'])->find($application->id);
    $array = resolveJson(new ApplicationResource($loaded));
    expect($array['project']['id'])->toBe($project->id);
    expect($array['applicant']['id'])->toBe($applicant->id);
    expect($array['applicant']['profile']['first_name'])->toBe('Test');
    // Sensitive profile fields must never leak.
    expect(json_encode($array))->not->toContain('ID-SECRET-123');
    expect($array['applicant']['profile'])->not->toHaveKey('id_number');
    expect($array['applicant'])->not->toHaveKey('password');
});

it('never exposes private participant data', function () {
    $user = User::factory()->create();
    $profile = makeParticipant($user);
    $profile->documents()->create([
        'original_name' => 'cv.pdf',
        'file_path' => 'private/cv.pdf',
        'disk' => 'private',
        'file_size' => 1234,
        'mime_type' => 'application/pdf',
        'category' => 'CV',
    ]);

    $loaded = User::with(['participantProfile.skills', 'participantProfile.educations', 'participantProfile.workExperiences', 'participantProfile.certifications'])->find($user->id);
    $array = resolveJson(new ParticipantResource($loaded));

    $json = json_encode($array);
    expect($json)->not->toContain('ID-SECRET-123');
    expect($json)->not->toContain('private/cv.pdf');
    expect($array)->not->toHaveKey('password');
    expect($array['profile'])->not->toHaveKey('id_number');
    expect($array['profile'])->not->toHaveKey('documents');
    expect($array['profile']['skills'][0]['name'])->toBe('Mentoring');

    // Profile omitted entirely when not loaded.
    $bare = resolveJson(new ParticipantResource(User::find($user->id)));
    expect($bare)->not->toHaveKey('profile');
});

it('serializes project participant assignments with participant and application', function () {
    $user = User::factory()->create();
    makeParticipant($user);
    $project = Project::factory()->create();
    $application = ProjectApplication::factory()->create(['project_id' => $project->id, 'user_id' => $user->id]);
    $assignment = ProjectParticipant::factory()->create([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'application_id' => $application->id,
    ]);

    $loaded = ProjectParticipant::with(['project', 'user.participantProfile.skills', 'application'])->find($assignment->id);
    $array = resolveJson(new ProjectParticipantResource($loaded));

    expect($array)->toHaveKeys(['id', 'project_id', 'user_id', 'application_id', 'role', 'status', 'joined_at']);
    expect($array['project']['id'])->toBe($project->id);
    expect($array['participant']['id'])->toBe($user->id);
    expect($array['application']['id'])->toBe($application->id);
    expect(json_encode($array))->not->toContain('ID-SECRET-123');
});

it('serializes timesheets with entries, participant and approver', function () {
    $approver = User::factory()->create();
    $timesheet = Timesheet::factory()->approved()->create(['approved_by' => $approver->id]);
    TimesheetEntry::factory()->count(2)->create(['timesheet_id' => $timesheet->id]);

    $loaded = Timesheet::with(['entries', 'participant.project', 'participant.user', 'approver'])->find($timesheet->id);
    $array = resolveJson(new TimesheetResource($loaded));

    expect($array)->toHaveKeys(['id', 'project_participant_id', 'period_start', 'period_end', 'total_hours', 'status', 'note', 'approved_by', 'approved_at']);
    expect($array['entries'])->toHaveCount(2);
    expect($array['approver']['id'])->toBe($approver->id);
    expect($array['participant']['id'])->toBe($loaded->project_participant_id);

    $entryArray = resolveJson(new TimesheetEntryResource($loaded->entries->first()));
    expect($entryArray)->toHaveKeys(['id', 'timesheet_id', 'work_date', 'hours', 'description']);
});

it('supports collections and pagination with the standard data wrapper', function () {
    Organisation::factory()->count(15)->create();

    $paginator = Organisation::query()->paginate(10);
    $response = OrganisationResource::collection($paginator)->response()->getData(true);

    expect($response)->toHaveKeys(['data', 'links', 'meta']);
    expect($response['data'])->toHaveCount(10);
    expect($response['meta']['total'])->toBe(15);

    OrganisationUser::create([
        'organisation_id' => Organisation::first()->id,
        'user_id' => User::factory()->create()->id,
        'role' => 'member',
    ]);
    $members = resolveJson(OrganisationMemberResource::collection(OrganisationUser::with('user')->get()));
    expect($members)->not->toBeEmpty();
    expect($members[0])->toHaveKeys(['id', 'organisation_id', 'user_id', 'role', 'user']);
});
