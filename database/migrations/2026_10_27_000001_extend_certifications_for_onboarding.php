<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certifications', function (Blueprint $table) {
            $table->boolean('does_not_expire')->default(false);
            $table->text('credential_url')->nullable();
            $table->json('related_skills')->nullable();
            $table->string('document_path')->nullable();
            $table->string('document_original_name')->nullable();
            $table->string('document_mime_type')->nullable();
            $table->unsignedInteger('document_file_size')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('certifications', function (Blueprint $table) {
            $table->dropColumn([
                'does_not_expire',
                'credential_url',
                'related_skills',
                'document_path',
                'document_original_name',
                'document_mime_type',
                'document_file_size',
            ]);
        });
    }
};
