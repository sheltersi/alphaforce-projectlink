<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the `archived` terminal status for the Organisation App project
     * lifecycle (close → archive). Uses a column change so it applies
     * consistently across drivers (MySQL ENUM, SQLite CHECK constraint).
     */
    public function up(): void
    {
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

        Schema::table('projects', function (Blueprint $table) {
            $table->enum('status', ['draft', 'open', 'in_progress', 'completed', 'cancelled'])
                ->default('draft')
                ->change();
        });
    }
};
