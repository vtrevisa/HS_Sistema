<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
	protected $fillable = [
		'tipo', 'licenca', 'vigencia', 'endereco', 
		'complemento', 'municipio', 'bairro', 'ocupacao'
	];
}
