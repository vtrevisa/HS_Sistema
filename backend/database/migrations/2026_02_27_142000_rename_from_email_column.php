<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Rename column `from-email` to `from_email`.
        try {
            DB::statement('ALTER TABLE `smtp_configs` CHANGE `from-email` `from_email` VARCHAR(255) NOT NULL');
        } catch (\Exception $e) {
            info('Rename smtp column failed: ' . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement('ALTER TABLE `smtp_configs` CHANGE `from_email` `from-email` VARCHAR(255) NOT NULL');
        } catch (\Exception $e) {
            info('Revert rename smtp column failed: ' . $e->getMessage());
        }
    }
};
