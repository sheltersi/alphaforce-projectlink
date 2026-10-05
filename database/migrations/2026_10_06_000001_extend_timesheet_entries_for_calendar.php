<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Calendar support for timesheet entries (Participant App, Phase 1).
     *
     * Reuses the existing timesheets/timesheet_entries tables instead of
     * creating a parallel model:
     * - start_time/end_time turn a day row into a calendar block. Duration
     *   is always derived server-side; participants never enter hours.
     * - status moves the draft → submitted → approved/rejected workflow
     *   onto the entry, so each calendar block carries its own state.
     * - reviewed_by/reviewed_at/review_comment record per-entry review
     *   decisions by project managers.
     */
    public function up(): void
    {
        Schema::table('timesheet_entries', function (Blueprint $table) {
            $table->time('start_time')->nullable()->after('work_date');
            $table->time('end_time')->nullable()->after('start_time');
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft')->after('description');
            $table->foreignId('reviewed_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->text('review_comment')->nullable()->after('reviewed_at');

            $table->index('status');
            $table->index('work_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timesheet_entries', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['work_date']);
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn([
                'start_time',
                'end_time',
                'status',
                'reviewed_at',
                'review_comment',
            ]);
        });
    }
};
