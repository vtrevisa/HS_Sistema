<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class SmtpConfig extends Model
{
    protected $fillable = [
        'user_id',
        'host',
        'port',
        'encryption',
        'username',
        'password',
        'from_email',
        'from_name',
    ];

    protected $hidden = [ 'password' ];

    public function setPasswordAttribute($value)
    {
        if ($value === null || $value === '') {
            $this->attributes['password'] = null;
            return;
        }

        $this->attributes['password'] = Crypt::encryptString($value);
    }

    public function getPasswordAttribute($value)
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
