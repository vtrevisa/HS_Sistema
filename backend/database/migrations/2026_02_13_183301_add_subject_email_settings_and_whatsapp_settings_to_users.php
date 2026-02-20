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
            $table->string('email_subject')->nullable()->after('remember_token');
            $table->string('email_body')->nullable()->after('email_subject');
            $table->string('whatsapp_message')->nullable()->after('email_body');
            //
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
                        if (Schema::hasColumn('users', 'email_subject') || Schema::hasColumn('users', 'email_body') || Schema::hasColumn('users', 'whatsapp_message')) {
                            $table->dropColumn(['email_subject', 'email_body', 'whatsapp_message']);
                        }
                    } catch (\Exception $e) {
                        // ignore if columns/constraints already removed
                    }
                });
            } catch (\Exception $e) {
                // ignore overall errors during rollback
            }
        }
    }
};
