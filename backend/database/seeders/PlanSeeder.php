<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('plans')->insert([
            [
                'name' => 'Básico',
                'monthly_credits' => 200,
                'price' => 800.00,
                'type' => 'fixed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Avançado',
                'monthly_credits' => 500,
                'price' => 1500.00,
                'type' => 'fixed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Premium',
                'monthly_credits' => null,
                'price' => null,
                'type' => 'custom',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
