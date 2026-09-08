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
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_profile_id')->constrained('participant_profiles')->cascadeOnDelete();
            $table->string('name');
            $table->string('issuing_organisation');
            $table->string('credential_number')->nullable();
            $table->string('issue_date', 7)->nullable()->comment('YYYY-MM');
            $table->string('expiry_date', 7)->nullable()->comment('YYYY-MM');
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
        Schema::dropIfExists('certifications');
    }
};
