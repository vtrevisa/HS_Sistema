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
        Schema::create('archived_proposals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lead_id');
            $table->string('company')->nullable();
            $table->string('type')->nullable();
            $table->decimal('value', 12, 2)->nullable();
            $table->enum('status', ['Ganho', 'Perdido']);
            $table->text('reason')->nullable();
            $table->timestamp('archived_at')->useCurrent();

            $table->foreign('lead_id')
                ->references('id')
                ->on('leads')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archived_proposals');
    }
};
