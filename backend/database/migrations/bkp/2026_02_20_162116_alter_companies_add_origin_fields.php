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
        Schema::table('companies', function (Blueprint $table) {
            $table->string('origin')
                ->nullable()
                ->after('license');

            $table->unsignedBigInteger('origin_id')
                ->nullable()
                ->after('origin');

            $table->index(['origin', 'origin_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropIndex(['origin', 'origin_id']);
            $table->dropColumn(['origin', 'origin_id']);
        });
    }
};
