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
        Schema::create('credit_purchases', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->integer('credits_purchased');
            $table->decimal('amount_paid', 10, 2);

            $table->string('payment_method')->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::dropIfExists('credit_purchases');
        } catch (\Exception $e) {
            // ignore errors during rollback
        }
    }
};
