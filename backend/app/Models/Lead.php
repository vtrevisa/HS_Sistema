<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
	protected $fillable = [
		'company',
		'service',
		'license',
		'validity',
		'expiration_date',
		'next_action',
		'service_value',
		'address',
		'number',
		'complement',
		'city',
		'district',
		'occupation',
		'status',
		'cnpj',
		'website',
		'cep',
		'contact',
		'phone',
		'email'
	];
}
