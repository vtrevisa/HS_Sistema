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
		Schema::create('leads', function (Blueprint $table) {
			$table->id();
			$table->string('tipo');              				// Tipo
			$table->string('licenca');          				// Licença
			$table->date('vigencia');           				// Vigência
			$table->string('endereco');         				// Endereço
			$table->string('numero');         					// Número
			$table->string('complemento')->nullable();  // Complemento (optional)
			$table->string('municipio');        				// Município
			$table->string('bairro');           				// Bairro
			$table->string('ocupacao');         				// Ocupação
			$table->string('cnpj')->nullable(); 				// CNPJ (optional)
			$table->string('site')->nullable();         // Site (optional)
			$table->string('contato')->nullable();      // Nome do Contato (optional)
			$table->string('whatsapp')->nullable();     // Whatsapp (optional)
			$table->string('email')->nullable();        // Email (optional)
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('leads');
	}
};
