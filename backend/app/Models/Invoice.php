<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
  protected $fillable = [
    'user_id',
    'description',
    'amount',
    'status',
    'due_date',
    'paid_at',
    'invoice_url',
  ];

  protected $casts = [
    'due_date' => 'date',
    'paid_at' => 'datetime',
  ];

  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
