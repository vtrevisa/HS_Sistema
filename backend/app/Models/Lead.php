<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
	protected $fillable = [
		'user_id',
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

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function archivedProposal()
	{
		return $this->hasOne(ArchivedProposal::class, 'lead_id');
	}
}
