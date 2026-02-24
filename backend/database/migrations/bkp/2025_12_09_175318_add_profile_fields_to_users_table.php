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
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['cnpj', 'company', 'phone', 'address']);
        });
    }
};
