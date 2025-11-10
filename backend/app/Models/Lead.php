<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
		'email',
		'attachments',
	];

	protected $casts = [
		'attachments' => 'array',
	];
}
