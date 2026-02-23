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
        Schema::table('leads', function (Blueprint $table) {
            $table->json('attachments')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('leads')) {
            try {
                Schema::table('leads', function (Blueprint $table) {
                    try {
                        if (Schema::hasColumn('leads', 'attachments')) {
                            $table->dropColumn('attachments');
                        }
                    } catch (\Exception $e) {
                        // ignore if column doesn't exist
                    }
                });
            } catch (\Exception $e) {
                // ignore overall errors during rollback
            }
        }
    }
};
