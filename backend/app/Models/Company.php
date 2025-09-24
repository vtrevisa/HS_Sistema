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
        'state',
        'city',
        'service',
        'validity',
        'phone',
        'cnpj',
        'email'
    ];
}
