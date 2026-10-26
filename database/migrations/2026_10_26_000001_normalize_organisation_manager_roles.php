<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('organisation_users')
            ->where('role', 'manager')
            ->update(['role' => 'project_manager']);
    }

    public function down(): void
    {
        // The removed legacy membership role is intentionally not restored.
    }
};
