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
        Schema::create('smtp_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('host'); // ex: smtp.locaweb.com.br
            $table->integer('port'); // ex: 587
            $table->string('encryption')->nullable(); // tls, ssl, null
            $table->string('username'); // e-mail do usuario
            $table->text('password'); // senha do e-mail criptografado
            $table->string('from-email'); // igual ao username
            $table->string('from_name')->nullable(); // nome que aparecerá no remetente
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smtp_configs');
    }
};
