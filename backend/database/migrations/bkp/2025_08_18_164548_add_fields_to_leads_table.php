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
        Schema::table('leads', function (Blueprint $table) {
            $table->string('status')->default('Lead')->after('occupation');
            $table->date('expiration_date')->after('validity');
            $table->date('next_action')->after('expiration_date');
            $table->string('service_value')->nullable()->after('next_action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'expiration_date',
                'next_action',
                'service_value',
            ]);
        });
    }
};
