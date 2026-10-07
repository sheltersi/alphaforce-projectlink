<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentOrganisation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\OrganisationReportRequest;
use App\Models\Organisation;
use App\Models\Project;
use App\Services\OrganisationReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;

class OrganisationReportController extends Controller
{
    use ResolvesCurrentOrganisation;

    public function __construct(protected OrganisationReportService $reports) {}

    public function summary(OrganisationReportRequest $request): JsonResponse
    {
        $organisation = $this->authorisedOrganisation($request);
        $filters = $request->validated();
        $this->assertProjectFilterBelongsToOrganisation($filters['project_id'] ?? null, $organisation->id);

        return response()->json(['data' => $this->reports->summary($organisation, $filters)]);
    }

    public function projects(OrganisationReportRequest $request): JsonResponse
    {
        $organisation = $this->authorisedOrganisation($request);
        $filters = $request->validated();
        $this->assertProjectFilterBelongsToOrganisation($filters['project_id'] ?? null, $organisation->id);

        return $this->paginatedResponse($this->reports->projects($organisation, $filters));
    }

    public function participants(OrganisationReportRequest $request): JsonResponse
    {
        $organisation = $this->authorisedOrganisation($request);
        $filters = $request->validated();
        $this->assertProjectFilterBelongsToOrganisation($filters['project_id'] ?? null, $organisation->id);

        return $this->paginatedResponse($this->reports->participants($organisation, $filters));
    }

    public function timesheets(OrganisationReportRequest $request): JsonResponse
    {
        $organisation = $this->authorisedOrganisation($request);
        $filters = $request->validated();
        $this->assertProjectFilterBelongsToOrganisation($filters['project_id'] ?? null, $organisation->id);

        return $this->paginatedResponse($this->reports->timesheets($organisation, $filters));
    }

    private function authorisedOrganisation(OrganisationReportRequest $request): Organisation
    {
        $organisation = $this->currentOrganisation($request);

        Gate::authorize('viewAny', Project::class);

        return $organisation;
    }

    private function assertProjectFilterBelongsToOrganisation(?int $projectId, int $organisationId): void
    {
        if ($projectId === null) {
            return;
        }

        abort_unless(
            Project::query()->whereKey($projectId)->where('organisation_id', $organisationId)->exists(),
            404
        );
    }

    /** @param LengthAwarePaginator<int, array<string, mixed>> $paginator */
    private function paginatedResponse(LengthAwarePaginator $paginator): JsonResponse
    {
        return (new AnonymousResourceCollection($paginator, JsonResource::class))->response();
    }
}
