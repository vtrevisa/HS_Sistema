<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            ALTER TABLE alvaras_purchases
            MODIFY company_id BIGINT(20) UNSIGNED NULL
            AFTER user_id
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('alvaras_purchases')) {
            try {
                DB::statement("
                    ALTER TABLE alvaras_purchases
                    MODIFY company_id BIGINT(20) UNSIGNED NULL
                    AFTER updated_at
                ");
            } catch (\Exception $e) {
                // ignore errors during rollback if table/column already removed
            }
        }
    }
};
