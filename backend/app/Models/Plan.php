<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{

    use HasFactory;

    protected $fillable = [
        'name',
        'monthly_credits',
        'price',
        'type'
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
