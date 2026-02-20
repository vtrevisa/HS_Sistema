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
			$table->string('company')->nullable();  // Empresa (optional)
			$table->string('service');              				// Tipo de Serviço
			$table->string('license');          				// Licença
			$table->date('validity');           				// Vigência
			$table->string('address');         				// Endereço
			$table->string('number');         					// Número
			$table->string('complement')->nullable();  // Complemento (optional)
			$table->string('city');        				// Município
			$table->string('district');           				// Bairro
			$table->string('occupation');         				// Ocupação
			$table->string('cnpj')->nullable(); 				// CNPJ (optional)
			$table->string('website')->nullable();         // Site (optional)
			$table->string('contact')->nullable();      // Nome do Contato (optional)
			$table->string('phone')->nullable();     // Whatsapp (optional)
			$table->string('email')->nullable();        // Email (optional)
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		try {
			Schema::dropIfExists('leads');
		} catch (\Exception $e) {
			// ignore errors during rollback
		}
	}
};
