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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('company');                          // Name
            $table->string('cep');                          // CEP
            $table->string('address');                         // Endereço
            $table->string('number');                         // Número
            $table->string('state');                        // Estado
            $table->string('city');                           // Cidade
            $table->string('service');                           // Tipo de serviço
            $table->date('validity');                       // Vigência
            $table->string('phone')->nullable();    // Telefone (optional)
            $table->string('cnpj')->nullable();              // CNPJ (optional) 
            $table->string('email')->nullable();              // E-mail (optional) 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
