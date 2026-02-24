<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $table = 'email_templates';

    protected $fillable = [
        'id',
        'subject',
        'body',
        'user_id',
        'active',
        'position',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
