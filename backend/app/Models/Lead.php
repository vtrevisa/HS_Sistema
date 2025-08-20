<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
	protected $fillable = [
		'empresa',
		'tipo',
		'licenca',
		'vigencia',
		'vencimento',
		'proxima_acao',
		'valor_servico',
		'endereco',
		'numero',
		'complemento',
		'municipio',
		'bairro',
		'ocupacao',
		'status',
		'cnpj',
		'site',
		'cep',
		'contato',
		'whatsapp',
		'email'
	];
}
