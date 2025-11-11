<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Carbon\Carbon;

class ResetMonthlyUsage extends Command
{
  protected $signature = 'alvaras:reset-monthly';
  protected $description = 'Reseta os créditos mensais usados dos usuários quando chega o dia de renovação.';

  public function handle()
  {
    $today = Carbon::today();

    $users = User::whereNotNull('plan_id')
      ->whereNotNull('plan_renews_at')
      ->get();

    foreach ($users as $user) {

      // Se hoje é o dia da renovação...
      if ($today->isSameDay(Carbon::parse($user->plan_renews_at))) {

        // Zera o monthly_used
        $user->monthly_used = 0;

        // Atualiza o próximo ciclo (30 dias ou mesma data do mês)
        $user->last_renewal_at = $today;

        // Próxima renovação: +30 dias
        $user->plan_renews_at = Carbon::parse($user->plan_renews_at)->addMonth();

        $user->save();

        $this->info("Renovação aplicada ao usuário #{$user->id}");
      }
    }

    return Command::SUCCESS;
  }
}
