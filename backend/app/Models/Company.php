<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'company',
        'cep',
        'address',
        'number',
        'complement',
        'state',
        'city',
        'district',
        'service',
        'license',
        'occupation',
        'validity',
        'website',
        'contact',
        'phone',
        'cnpj',
        'email',
        'origin',
        'origin_id',
    ];


    protected $casts = [
        'validity' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
