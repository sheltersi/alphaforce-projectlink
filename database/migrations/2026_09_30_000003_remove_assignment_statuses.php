<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove the Phase 2 assignment statuses (pending_assignment,
     * assigned, removed). Assignment state is derived from the role
     * column instead (empty role = Not Assigned), so the team lifecycle
     * returns to active / completed / withdrawn.
     *
     * Existing rows are folded forward: pending_assignment and assigned
     * become active, removed becomes withdrawn. The assignment detail
     * columns (team, dates, location, hours, notes) are kept.
     */
    public function up(): void
    {
        DB::table('project_participants')
            ->whereIn('status', ['pending_assignment', 'assigned'])
            ->update(['status' => 'active']);

        DB::table('project_participants')
            ->where('status', 'removed')
            ->update(['status' => 'withdrawn']);

        Schema::table('project_participants', function (Blueprint $table) {
            $table->enum('status', ['active', 'completed', 'withdrawn'])
                ->default('active')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_participants', function (Blueprint $table) {
            $table->enum('status', [
                'pending_assignment',
                'assigned',
                'active',
                'completed',
                'withdrawn',
                'removed',
            ])->default('active')->change();
        });
    }
};
