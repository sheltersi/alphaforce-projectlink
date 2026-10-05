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

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE project_participants DROP CONSTRAINT IF EXISTS project_participants_status_check');
            DB::statement("ALTER TABLE project_participants ALTER COLUMN status TYPE VARCHAR(255), ALTER COLUMN status SET NOT NULL, ALTER COLUMN status SET DEFAULT 'active'");
            DB::statement("ALTER TABLE project_participants ADD CONSTRAINT project_participants_status_check CHECK (status IN ('active', 'completed', 'withdrawn'))");
        } else {
            Schema::table('project_participants', function (Blueprint $table) {
                $table->enum('status', ['active', 'completed', 'withdrawn'])
                    ->default('active')
                    ->change();
            });
        }

        $this->createActiveAssignmentConstraint();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->dropActiveAssignmentConstraint();

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE project_participants DROP CONSTRAINT IF EXISTS project_participants_status_check');
            DB::statement("ALTER TABLE project_participants ALTER COLUMN status TYPE VARCHAR(255), ALTER COLUMN status SET NOT NULL, ALTER COLUMN status SET DEFAULT 'active'");
            DB::statement("ALTER TABLE project_participants ADD CONSTRAINT project_participants_status_check CHECK (status IN ('pending_assignment', 'assigned', 'active', 'completed', 'withdrawn', 'removed'))");
        } else {
            Schema::table('project_participants', function (Blueprint $table) {
                $table->enum('status', ['pending_assignment', 'assigned', 'active', 'completed', 'withdrawn', 'removed'])
                    ->default('active')
                    ->change();
            });
        }

        $this->createActiveAssignmentConstraint();
    }

    private function createActiveAssignmentConstraint(): void
    {
        if (DB::getDriverName() === 'mysql') {
            Schema::table('project_participants', function (Blueprint $table) {
                $table->unsignedBigInteger('active_assigned_user_id')
                    ->nullable()
                    ->virtualAs("CASE WHEN status = 'active' AND role IS NOT NULL AND role <> '' THEN user_id ELSE NULL END");
                $table->unique('active_assigned_user_id', 'project_participants_one_active_assignment_per_user');
            });

            return;
        }

        DB::statement("CREATE UNIQUE INDEX project_participants_one_active_assignment_per_user ON project_participants (user_id) WHERE status = 'active' AND role IS NOT NULL AND role <> ''");
    }

    private function dropActiveAssignmentConstraint(): void
    {
        if (DB::getDriverName() === 'mysql') {
            Schema::table('project_participants', function (Blueprint $table) {
                $table->dropUnique('project_participants_one_active_assignment_per_user');
                $table->dropColumn('active_assigned_user_id');
            });

            return;
        }

        DB::statement('DROP INDEX IF EXISTS project_participants_one_active_assignment_per_user');
    }
};
