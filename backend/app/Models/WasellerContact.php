<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WasellerContact extends Model
{
    protected $fillable = [
        'lead_id',
        'waseller_id'
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
