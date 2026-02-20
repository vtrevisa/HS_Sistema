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
            $table->string('license')->after('service');
            $table->string('complement')->after('number');
            $table->string('district')->after('city');
            $table->string('occupation')->after('license');
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
                        if (Schema::hasColumn('companies', 'license')) $cols[] = 'license';
                        if (Schema::hasColumn('companies', 'complement')) $cols[] = 'complement';
                        if (Schema::hasColumn('companies', 'district')) $cols[] = 'district';
                        if (Schema::hasColumn('companies', 'occupation')) $cols[] = 'occupation';
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
