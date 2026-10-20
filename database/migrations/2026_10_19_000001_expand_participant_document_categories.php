<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participant_documents', function (Blueprint $table) {
            $table->string('category')->default('Supporting document')->change();
        });
    }

    public function down(): void
    {
        DB::table('participant_documents')
            ->whereNotIn('category', ['CV', 'Certificate', 'Supporting document'])
            ->update(['category' => 'Supporting document']);

        Schema::table('participant_documents', function (Blueprint $table) {
            $table->enum('category', ['CV', 'Certificate', 'Supporting document'])
                ->default('Supporting document')
                ->change();
        });
    }
};
