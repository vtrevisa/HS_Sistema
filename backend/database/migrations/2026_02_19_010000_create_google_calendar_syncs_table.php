<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('google_calendar_syncs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('calendar_id')->index();
            $table->text('sync_token')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'calendar_id']);
        });
    }

    public function down()
    {
        try {
            Schema::dropIfExists('google_calendar_syncs');
        } catch (\Exception $e) {
            // ignore errors during rollback
        }
    }
};
