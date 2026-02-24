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
            $table->unsignedBigInteger('plan_id')->nullable()->after('access');
            $table->integer('credits')->default(0)->after('plan_id');
            $table->date('plan_renews_at')->nullable()->after('credits');
            $table->date('last_renewal_at')->nullable()->after('plan_renews_at');

            $table->foreign('plan_id')->references('id')->on('plans')->nullOnDelete();
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
                        if (Schema::hasColumn('users', 'plan_id')) {
                            try {
                                $table->dropForeign(['plan_id']);
                            } catch (\Exception $e) {
                                // ignore if foreign doesn't exist
                            }
                        }

                        $cols = [];
                        if (Schema::hasColumn('users', 'plan_id')) $cols[] = 'plan_id';
                        if (Schema::hasColumn('users', 'credits')) $cols[] = 'credits';
                        if (Schema::hasColumn('users', 'plan_renews_at')) $cols[] = 'plan_renews_at';
                        if (Schema::hasColumn('users', 'last_renewal_at')) $cols[] = 'last_renewal_at';
                        if (!empty($cols)) {
                            $table->dropColumn($cols);
                        }
                    } catch (\Exception $e) {
                        // ignore if columns/constraints already removed
                    }
                });
            } catch (\Exception $e) {
                // ignore overall errors during rollback
            }
        }
    }
};
