<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationToken extends Model
{
    protected $table = 'integration_tokens';

    protected $fillable = [
        'user_id',
        'type',
        'provider',
        'email',
        'access_token',
        'refresh_token',
        'expires_at',
        'scope',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
