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
        Schema::create('alvara_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('city');
            $table->enum('service_type', ['AVCB', 'CLCB', 'Todos']);
            $table->unsignedInteger('quantity');
            $table->date('period_start');
            $table->date('period_end');
            $table->timestamp('consumed_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::dropIfExists('alvara_logs');
        } catch (\Exception $e) {
            // ignore errors during rollback
        }
    }
};
