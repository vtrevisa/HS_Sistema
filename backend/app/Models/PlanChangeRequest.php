<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanChangeRequest extends Model
{
    protected $fillable = [
        'user_id',
        'current_plan_id',
        'requested_plan_id',
        'status',
        'approved_at',
        'approved_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function requestedPlan()
    {
        return $this->belongsTo(Plan::class, 'requested_plan_id');
    }

    public function currentPlan()
    {
        return $this->belongsTo(Plan::class, 'current_plan_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
