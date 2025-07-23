<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!User::where('email', 'test@test.com.br')->first()) {
            User::create([
                'name' => 'Test User',
                'email' => 'test@test.com.br',
                'password' => Hash::make('123456', ['rounds' => 12]),
            ]);
        }

        if (!User::where('email', 'test2@test.com.br')->first()) {
            User::create([
                'name' => 'Test User 2',
                'email' => 'test2@test.com.br',
                'password' => Hash::make('123456', ['rounds' => 12]),
            ]);
        }
    }
}
