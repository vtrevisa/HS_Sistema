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
        Schema::table('alvaras_purchases', function (Blueprint $table) {
            $table->renameColumn('service_type', 'service');
            $table->renameColumn('end_date', 'validity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alvaras_purchases', function (Blueprint $table) {
            $table->renameColumn('service', 'service_type');
            $table->renameColumn('validity', 'end_date');
        });
    }
};
