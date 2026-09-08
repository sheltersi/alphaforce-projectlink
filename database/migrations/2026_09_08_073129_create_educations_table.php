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
        Schema::create('educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_profile_id')->constrained('participant_profiles')->cascadeOnDelete();
            $table->string('institution');
            $table->string('qualification');
            $table->string('field_of_study')->nullable();
            $table->string('start_year', 4)->nullable()->comment('YYYY');
            $table->string('end_year', 4)->nullable()->comment('YYYY, nullable if ongoing');
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
        Schema::dropIfExists('educations');
    }
};
