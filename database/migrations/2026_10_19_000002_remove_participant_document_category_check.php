<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE participant_documents DROP CONSTRAINT IF EXISTS participant_documents_category_check');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::table('participant_documents')
                ->whereNotIn('category', ['CV', 'Certificate', 'Supporting document'])
                ->update(['category' => 'Supporting document']);

            DB::statement("ALTER TABLE participant_documents ADD CONSTRAINT participant_documents_category_check CHECK (category IN ('CV', 'Certificate', 'Supporting document'))");
        }
    }
};
