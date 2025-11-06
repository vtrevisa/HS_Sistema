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
        Schema::table('archived_proposals', function (Blueprint $table) {
            $table->dropForeign(['lead_id']);

            // make lead_id nullable
            $table->unsignedBigInteger('lead_id')->nullable()->change();

            // create new FK
            $table->foreign('lead_id')
                ->references('id')
                ->on('leads')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('archived_proposals', function (Blueprint $table) {
            $table->dropForeign(['lead_id']);

            $table->unsignedBigInteger('lead_id')->nullable(false)->change();

            $table->foreign('lead_id')
                ->references('id')
                ->on('leads')
                ->onDelete('cascade');
        });
    }
};
