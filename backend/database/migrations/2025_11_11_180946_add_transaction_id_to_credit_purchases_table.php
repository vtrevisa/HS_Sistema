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
        Schema::table('credit_purchases', function (Blueprint $table) {
            $table->string('transaction_id')
                ->nullable()
                ->unique()
                ->after('amount_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('credit_purchases')) {
            try {
                Schema::table('credit_purchases', function (Blueprint $table) {
                    try {
                        if (Schema::hasColumn('credit_purchases', 'transaction_id')) {
                            $table->dropColumn('transaction_id');
                        }
                    } catch (\Exception $e) {
                        // ignore if column already removed
                    }
                });
            } catch (\Exception $e) {
                // ignore overall errors during rollback
            }
        }
    }
};
