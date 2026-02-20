<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleCalendarSync extends Model
{
    protected $table = 'google_calendar_syncs';
    protected $fillable = ['user_id', 'calendar_id', 'sync_token', 'last_synced_at', 'channel_id', 'resource_id', 'channel_token', 'channel_expiration'];
    protected $casts = ['last_synced_at' => 'datetime'];
    public $timestamps = true;
}
