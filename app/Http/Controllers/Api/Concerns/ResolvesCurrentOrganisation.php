<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Organisation;
use Illuminate\Http\Request;

/**
 * Resolves the authenticated user's current organisation for org-scoped
 * API controllers. Users act under their first membership (Phase 1 rule).
 */
trait ResolvesCurrentOrganisation
{
    protected function currentOrganisation(Request $request): Organisation
    {
        $organisation = $request->user()->currentOrganisation();

        abort_if($organisation === null, 403, 'You do not belong to an organisation.');

        return $organisation;
    }
}
