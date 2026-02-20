<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->integer('access')->default(0); // 0=visitor, 100=admin
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            try {
                DB::statement('SET FOREIGN_KEY_CHECKS=0;');
                Schema::dropIfExists('users');
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            } catch (\Exception $e) {
                try {
                    DB::statement('SET FOREIGN_KEY_CHECKS=1;');
                } catch (\Exception $_) {
                    // ignore
                }
                // ignore drop errors caused by FK constraints
            }
        }
    }
};
