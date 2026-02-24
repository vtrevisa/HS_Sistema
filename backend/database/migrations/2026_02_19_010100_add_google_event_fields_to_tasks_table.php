<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'google_event_id')) {
                $table->string('google_event_id')->nullable()->after('lead_id')->index();
            }
            if (!Schema::hasColumn('tasks', 'calendar_id')) {
                $table->string('calendar_id')->nullable()->after('google_event_id')->index();
            }
            // unique constraint may already exist in some setups; attempt safely
            try {
                $table->unique(['user_id', 'google_event_id'], 'tasks_user_google_event_unique');
            } catch (\Exception $e) {
                // ignore if already exists
            }
        });
    }

    public function down()
    {
        if (Schema::hasTable('tasks')) {
            try {
                Schema::table('tasks', function (Blueprint $table) {
                    try {
                        $table->dropUnique('tasks_user_google_event_unique');
                    } catch (\Exception $e) {
                        // ignore
                    }
                    try {
                        if (Schema::hasColumn('tasks', 'google_event_id')) {
                            $table->dropColumn('google_event_id');
                        }
                        if (Schema::hasColumn('tasks', 'calendar_id')) {
                            $table->dropColumn('calendar_id');
                        }
                    } catch (\Exception $e) {
                        // ignore
                    }
                });
            } catch (\Exception $e) {
                // ignore overall errors during rollback
            }
        }
    }
};
