<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivedProposal extends Model
{

    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'lead_id',
        'company',
        'type',
        'value',
        'status',
        'reason',
        'archived_at',
    ];

    protected $casts = [
        'archived_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id', 'id');
    }
}
