<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participant_profiles', function (Blueprint $table): void {
            $table->string('id_number')->nullable()->after('email');
            $table->string('nationality')->nullable()->after('country');
        });
    }

    public function down(): void
    {
        Schema::table('participant_profiles', function (Blueprint $table): void {
            $table->dropColumn(['id_number', 'nationality']);
        });
    }
};
