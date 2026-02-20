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
        Schema::table('tasks', function (Blueprint $table) {
            $table->boolean('completed')
                ->default(false)
                ->after('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('tasks')) {
            try {
                Schema::table('tasks', function (Blueprint $table) {
                    try {
                        if (Schema::hasColumn('tasks', 'completed')) {
                            $table->dropColumn('completed');
                        }
                    } catch (\Exception $e) {
                        // ignore if column doesn't exist or other SQL errors during rollback
                    }
                });
            } catch (\Exception $e) {
                // ignore overall table alteration errors during rollback
            }
        }
    }
};
