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
        Schema::table('users', function (Blueprint $table) {
            $table->string('cnpj')->nullable()->after('email_verified_at');
            $table->string('company')->nullable()->after('cnpj');
            $table->string('phone')->nullable()->after('company');
            $table->string('address')->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            try {
                Schema::table('users', function (Blueprint $table) {
                    try {
                        $cols = [];
                        if (Schema::hasColumn('users', 'cnpj')) $cols[] = 'cnpj';
                        if (Schema::hasColumn('users', 'company')) $cols[] = 'company';
                        if (Schema::hasColumn('users', 'phone')) $cols[] = 'phone';
                        if (Schema::hasColumn('users', 'address')) $cols[] = 'address';
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
