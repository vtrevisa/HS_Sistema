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
        Schema::table('archived_proposals', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('archived_proposals')) {
            try {
                Schema::table('archived_proposals', function (Blueprint $table) {
                    try {
                        if (Schema::hasColumn('archived_proposals', 'user_id')) {
                            $table->dropColumn('user_id');
                        }
                    } catch (\Exception $e) {
                        // ignore if column/constraint already removed
                    }
                });
            } catch (\Exception $e) {
                // ignore overall errors during rollback
            }
        }
    }
};
