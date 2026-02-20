<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;


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
        DB::statement("
            ALTER TABLE alvaras_purchases
            MODIFY company_id BIGINT(20) UNSIGNED NULL
            AFTER updated_at
        ");
    }
};
