<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
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
        'email'
    ];
}
