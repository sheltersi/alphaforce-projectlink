<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the `archived` terminal status for the Organisation App project
    * lifecycle (close → archive). PostgreSQL updates its generated CHECK
    * constraint directly; other drivers use a column change.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check');
            DB::statement("ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled', 'archived'))");

            return;
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->enum('status', ['draft', 'open', 'in_progress', 'completed', 'cancelled', 'archived'])
                ->default('draft')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('projects')->where('status', 'archived')->update(['status' => 'completed']);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check');
            DB::statement("ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled'))");

            return;
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->enum('status', ['draft', 'open', 'in_progress', 'completed', 'cancelled'])
                ->default('draft')
                ->change();
        });
    }
};
