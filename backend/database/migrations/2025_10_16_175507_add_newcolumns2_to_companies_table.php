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
        Schema::table('companies', function (Blueprint $table) {
            $table->string('website')->after('validity');
            $table->string('contact')->after('website');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('companies')) {
            try {
                Schema::table('companies', function (Blueprint $table) {
                    try {
                        $cols = [];
                        if (Schema::hasColumn('companies', 'website')) $cols[] = 'website';
                        if (Schema::hasColumn('companies', 'contact')) $cols[] = 'contact';
                        if (!empty($cols)) {
                            $table->dropColumn($cols);
                        }
                    } catch (\Exception $e) {
                        // ignore if columns already removed
                    }
                });
            } catch (\Exception $e) {
                // ignore overall errors during rollback
            }
        }
    }
};
