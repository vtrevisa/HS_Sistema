<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'date',
        'hour',
        'priority',
        'completed',
        'user_id',
        'lead_id',
        'google_event_id',
        'calendar_id',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
