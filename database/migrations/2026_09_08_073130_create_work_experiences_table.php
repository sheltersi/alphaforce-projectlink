<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('work_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_profile_id')->constrained('participant_profiles')->cascadeOnDelete();
            $table->string('job_title');
            $table->string('organisation');
            $table->string('location')->nullable();
            $table->string('start_date', 7)->nullable()->comment('YYYY-MM, month granularity from onboarding');
            $table->string('end_date', 7)->nullable()->comment('YYYY-MM, null if currently_working');
            $table->boolean('currently_working')->default(false);
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('participant_profile_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_experiences');
    }
};
