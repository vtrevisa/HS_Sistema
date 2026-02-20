<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Task::create([
            'title' => 'Entrar em contato com o lead',
            'description' => 'Primeiro contato para apresentação da proposta',
            'date' => Carbon::today()->addDays(2),
            'hour' => '14:00',
            'priority' => 'alta',
            'completed' => false,
            'user_id' => 1,
            'lead_id' => 1,
        ]);

        Task::create([
            'title' => 'Follow-up',
            'description' => 'Retornar contato com o cliente',
            'date' => Carbon::today()->addWeek(),
            'hour' => '10:30',
            'priority' => 'média',
            'completed' => false,
            'user_id' => 1,
            'lead_id' => 1,
        ]);
    }
}
