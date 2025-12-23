<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'cnpj',
        'company',
        'phone',
        'address',

        'plan_id',
        'credits',
        'plan_renews_at',
        'last_renewal_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',

            'plan_renews_at' => 'datetime',
            'last_renewal_at' => 'datetime',
        ];
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function isPlanActive()
    {
        if (!$this->plan_id || !$this->plan_renews_at) {
            return false;
        }

        return now()->lte($this->plan_renews_at);
    }

    public function creditPurchases()
    {
        return $this->hasMany(CreditPurchase::class);
    }




    public function consumeCredits(int $amount = 1)
    {
        if ($this->credits < $amount) {
            return false;
        }

        $this->credits -= $amount;
        $this->save();

        return true;
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
}
