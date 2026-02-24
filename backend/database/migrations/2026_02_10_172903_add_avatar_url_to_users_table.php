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
            $table->string('avatar_url', 255)
            ->nullable()
            ->comment('URL do avatar do usuário')
            ->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            try {
                Schema::table('users', function (Blueprint $table) {
                    try {
                        if (Schema::hasColumn('users', 'avatar_url')) {
                            $table->dropColumn('avatar_url');
                        }
                    } catch (\Exception $e) {
                        // ignore if column doesn't exist
                    }
                });
            } catch (\Exception $e) {
                // ignore overall errors during rollback
            }
        }
    }
};
