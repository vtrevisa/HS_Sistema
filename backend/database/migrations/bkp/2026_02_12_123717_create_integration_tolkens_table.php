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
        Schema::create('integration_tokens', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->enum('type', ['email', 'calendar', 'whatsapp', 'viafacilsp']);
        $table->enum('provider', ['gmail', 'microsoft']);
        $table->string('email');
        $table->text('access_token');
        $table->text('refresh_token')->nullable();
        $table->timestamp('expires_at');
        $table->timestamps();

        // allow one entry per (user_id, type) so a user can have up to
        // one token for each integration `type` (email, calendar, etc.)
        $table->unique(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('integration_tokens');
    }
};
