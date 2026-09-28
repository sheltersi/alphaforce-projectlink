<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentOrganisation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateOrganisationRequest;
use App\Http\Resources\Organisation\OrganisationDetailResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * The authenticated user's own organisation. Users can only ever access
 * the organisation they belong to (their first membership).
 */
class OrganisationController extends Controller
{
    use ResolvesCurrentOrganisation;

    public function show(Request $request): OrganisationDetailResource
    {
        $organisation = $this->currentOrganisation($request);

        Gate::authorize('view', $organisation);

        return new OrganisationDetailResource($organisation, $request->user()->organisationRole($organisation));
    }

    public function update(UpdateOrganisationRequest $request): OrganisationDetailResource
    {
        $organisation = $this->currentOrganisation($request);

        Gate::authorize('update', $organisation);

        $organisation->update($request->validated());

        return (new OrganisationDetailResource($organisation->fresh(), $request->user()->organisationRole($organisation)))
            ->additional(['message' => 'Organisation updated.']);
    }
}
