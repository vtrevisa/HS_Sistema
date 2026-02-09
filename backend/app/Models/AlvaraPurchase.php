<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlvaraPurchase extends Model
{
    use HasFactory;

    protected $table = 'alvaras_purchases';

    protected $fillable = [
        'user_id',
        'service',
        'city',
        'address',
        'occupation',
        'validity',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
