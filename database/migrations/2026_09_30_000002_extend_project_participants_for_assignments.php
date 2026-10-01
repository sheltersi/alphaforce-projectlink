<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Grow the assignment model on project_participants (Phase 2).
     *
     * - Extends the status enum with pending_assignment, assigned and
     *   removed (keeping active, completed, withdrawn). Uses a column
     *   change so it applies consistently across drivers (MySQL ENUM,
     *   SQLite CHECK constraint).
     * - Adds optional assignment detail columns: team, start_date,
     *   end_date, work_location, working_hours, notes.
     * - No new table: the assignment maps 1:1 onto the existing row
     *   (unique [project_id, user_id] already prevents duplicates).
     * - Application/Accepted dates stay derivable from the linked
     *   application (submitted_at / reviewed_at), so no columns for them.
     */
    public function up(): void
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

            $table->string('team', 255)->nullable()->after('role');
            $table->date('start_date')->nullable()->after('team');
            $table->date('end_date')->nullable()->after('start_date');
            $table->string('work_location', 255)->nullable()->after('end_date');
            $table->string('working_hours', 255)->nullable()->after('work_location');
            $table->text('notes')->nullable()->after('working_hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('project_participants')
            ->whereIn('status', ['pending_assignment', 'assigned', 'removed'])
            ->update(['status' => 'active']);

        Schema::table('project_participants', function (Blueprint $table) {
            $table->dropColumn([
                'team',
                'start_date',
                'end_date',
                'work_location',
                'working_hours',
                'notes',
            ]);

            $table->enum('status', ['active', 'completed', 'withdrawn'])
                ->default('active')
                ->change();
        });
    }
};
