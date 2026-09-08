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
        Schema::create('participant_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_profile_id')->constrained('participant_profiles')->cascadeOnDelete();
            $table->string('original_name');
            $table->string('file_path')->comment('Storage path on configured disk');
            $table->string('disk')->default('private');
            $table->unsignedBigInteger('file_size')->comment('Bytes');
            $table->string('mime_type')->nullable();
            $table->enum('category', ['CV', 'Certificate', 'Supporting document'])->default('Supporting document');
            $table->timestamps();

            $table->index('participant_profile_id');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participant_documents');
    }
};
