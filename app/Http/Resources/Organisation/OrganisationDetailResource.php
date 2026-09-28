<?php

namespace App\Http\Resources\Organisation;

use App\Models\Organisation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The authenticated user's own organisation, enriched with the user's
 * role within that organisation.
 *
 * @mixin Organisation
 */
class OrganisationDetailResource extends JsonResource
{
    public function __construct(mixed $resource, protected ?string $userRole = null)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return array_merge(
            (new OrganisationResource($this->resource))->toArray($request),
            ['my_role' => $this->userRole],
        );
    }
}
