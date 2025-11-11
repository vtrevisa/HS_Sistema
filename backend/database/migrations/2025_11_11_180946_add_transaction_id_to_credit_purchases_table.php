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
        Schema::table('credit_purchases', function (Blueprint $table) {
            $table->dropColumn('transaction_id');
        });
    }
};
