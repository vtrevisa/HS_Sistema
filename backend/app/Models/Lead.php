<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
	protected $fillable = [
		'tipo',
		'licenca',
		'vigencia',
		'endereco',
		'numero',
		'complemento',
		'municipio',
		'bairro',
		'ocupacao',
		'cnpj',
		'site',
		'contato',
		'whatsapp',
		'email'
	];
}
