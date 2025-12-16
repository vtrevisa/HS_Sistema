<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlvaraLog extends Model
{
    protected $fillable = [
        'user_id',
        'city',
        'service_type',
        'quantity',
        'period_start',
        'period_end',
        'consumed_at',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end'   => 'date',
        'consumed_at'  => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
