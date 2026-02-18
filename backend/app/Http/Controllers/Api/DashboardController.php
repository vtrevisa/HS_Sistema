<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArchivedProposal;
use App\Traits\AuthenticatesWithToken;
use App\Models\Lead;
use App\Models\Company;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\Request;


class DashboardController extends Controller
{

    use AuthenticatesWithToken;

    public function index(Request $request)
    {

        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Token inválido ou não fornecido.',
            ], 401);
        }

        $now = Carbon::now();

        $startCurrentMonth = $now->copy()->startOfMonth();
        $endCurrentMonth = $now->copy()->endOfMonth();

        $startLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Base query para leads do usuário autenticado
        $userLeadsQuery = Lead::where('user_id', $user->id);

        // Total de leads
        $totalLeads = (clone $userLeadsQuery)->count();


        $leadsThisMonth = (clone $userLeadsQuery)
            ->whereBetween('created_at', [$startCurrentMonth, $endCurrentMonth])
            ->count();

        $leadsLastMonth = (clone $userLeadsQuery)
            ->whereBetween('created_at', [$startLastMonth, $endLastMonth])
            ->count();

        $leadsGrowthPercentage = $leadsLastMonth > 0
            ? round((($leadsThisMonth - $leadsLastMonth) / $leadsLastMonth) * 100, 1)
            : 0;


        // Alvarás a vencer (próximos 30 dias)

        $today = Carbon::today();
        $next30Days = Carbon::today()->addDays(30);
        $next60Days = Carbon::today()->addDays(60);

        // Mês atual
        $startCurrentMonth = Carbon::now()->startOfMonth();
        $endCurrentMonth = Carbon::now()->endOfMonth();

        // Mês passado
        $startLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // 🔴 Vencidos (até hoje)
        $alvarasVencidosCurrent = Company::where('user_id', $user->id)
            ->whereDate('validity', '<', $today)
            ->count();

        // 🟡 A vencer em até 60 dias
        $alvarasAVencerCurrent = Company::where('user_id', $user->id)
            ->whereDate('validity', '>=', $today)
            ->whereDate('validity', '<=', $next60Days)
            ->count();

        $totalAlvarasCurrent = $alvarasVencidosCurrent + $alvarasAVencerCurrent;

        $todayLastMonth = $startLastMonth->copy();
        $next60DaysLastMonth = $todayLastMonth->copy()->addDays(60);

        // 🔴 Vencidos no mês passado
        $alvarasVencidosLast = Company::where('user_id', $user->id)
            ->whereDate('validity', '<', $todayLastMonth)
            ->count();

        // 🟡 A vencer (janela de 60 dias do mês passado)
        $alvarasAVencerLast = Company::where('user_id', $user->id)
            ->whereDate('validity', '>=', $todayLastMonth)
            ->whereDate('validity', '<=', $next60DaysLastMonth)
            ->count();

        $totalAlvarasLast = $alvarasVencidosLast + $alvarasAVencerLast;

        // 📈 Growth
        $alvarasGrowthPercentage = $totalAlvarasLast > 0
            ? round((($totalAlvarasCurrent - $totalAlvarasLast) / $totalAlvarasLast) * 100, 1)
            : 0;

        // Pipeline Ativo

        $pipelineBaseQuery = Lead::where('user_id', $user->id)
            ->whereNotIn('status', ['Cliente fechado', 'Arquivado']);

        // Total ativo
        $totalPipeline = (clone $pipelineBaseQuery)->sum('service_value');

        // Mês atual
        $pipelineThisMonth = (clone $pipelineBaseQuery)
            ->whereBetween('created_at', [$startCurrentMonth, $endCurrentMonth])
            ->sum('service_value');

        // Mês passado
        $pipelineLastMonth = (clone $pipelineBaseQuery)
            ->whereBetween('created_at', [$startLastMonth, $endLastMonth])
            ->sum('service_value');

        $pipelineGrowthPercentage = $pipelineLastMonth > 0
            ? round((($pipelineThisMonth - $pipelineLastMonth) / $pipelineLastMonth) * 100, 1)
            : 0;


        // Aprimoramentos Pendentes

        $aprimoramentoStatus = 'pendente';

        $aprimoramentoBaseQuery = Company::where('user_id', $user->id)
            ->where('status', $aprimoramentoStatus);

        // Total
        $totalAprimoramentos = (clone $aprimoramentoBaseQuery)->count();

        // Mês atual
        $aprimoramentosThisMonth = (clone $aprimoramentoBaseQuery)
            ->whereBetween('created_at', [$startCurrentMonth, $endCurrentMonth])
            ->count();

        // Mês passado
        $aprimoramentosLastMonth = (clone $aprimoramentoBaseQuery)
            ->whereBetween('created_at', [$startLastMonth, $endLastMonth])
            ->count();

        $aprimoramentosGrowthPercentage = $aprimoramentosLastMonth > 0
            ? round((($aprimoramentosThisMonth - $aprimoramentosLastMonth) / $aprimoramentosLastMonth) * 100, 1)
            : 0;


        // Propostas Enviadas

        $statusProposta = 'Proposta enviada';

        // Total de propostas enviadas (geral)

        $totalPropostas = Lead::where('user_id', $user->id)
            ->where('status', $statusProposta)
            ->count();

        // Propostas enviadas este mês
        $propostasThisMonth = Lead::where('user_id', $user->id)
            ->where('status', $statusProposta)
            ->whereBetween('created_at', [$startCurrentMonth, $endCurrentMonth])
            ->count();

        // Propostas enviadas mês passado
        $propostasLastMonth = Lead::where('user_id', $user->id)
            ->where('status', $statusProposta)
            ->whereBetween('created_at', [$startLastMonth, $endLastMonth])
            ->count();

        $propostasGrowthPercentage = $propostasLastMonth > 0
            ? round((($propostasThisMonth - $propostasLastMonth) / $propostasLastMonth) * 100, 1)
            : 0;


        // Taxa de conversão

        $taxaBaseQuery = ArchivedProposal::where('user_id', $user->id);

        $totalPropostasFechadas = (clone $taxaBaseQuery)->count();

        $propostasGanhas = (clone $taxaBaseQuery)
            ->where('status', 'Ganho')
            ->count();

        $propostasPerdidas = (clone $taxaBaseQuery)
            ->where('status', 'Perdido')
            ->count();

        $taxaConversao = $totalPropostasFechadas > 0
            ? round(($propostasGanhas / $totalPropostasFechadas) * 100, 1)
            : 0;

        // Mês atual
        $propostasFechadasThisMonth = (clone $taxaBaseQuery)
            ->whereBetween('archived_at', [$startCurrentMonth, $endCurrentMonth])
            ->count();

        $propostasGanhasThisMonth = (clone $taxaBaseQuery)
            ->where('status', 'Ganho')
            ->whereBetween('archived_at', [$startCurrentMonth, $endCurrentMonth])
            ->count();

        $taxaConversaoThisMonth = $propostasFechadasThisMonth > 0
            ? ($propostasGanhasThisMonth / $propostasFechadasThisMonth) * 100
            : 0;

        // Mês passado
        $propostasFechadasLastMonth = (clone $taxaBaseQuery)
            ->whereBetween('archived_at', [$startLastMonth, $endLastMonth])
            ->count();

        $propostasGanhasLastMonth = (clone $taxaBaseQuery)
            ->where('status', 'Ganho')
            ->whereBetween('archived_at', [$startLastMonth, $endLastMonth])
            ->count();


        $taxaConversaoLastMonth = $propostasFechadasLastMonth > 0
            ? ($propostasGanhasLastMonth / $propostasFechadasLastMonth) * 100
            : 0;

        $taxaConversaoGrowthPercentage = $taxaConversaoDiff = round(
            $taxaConversaoThisMonth - $taxaConversaoLastMonth,
            1
        );

        // Leads Recentes (últimos 5)

        $recentLeads = Lead::where('user_id', $user->id)->latest()->take(5)->select('id', 'company', 'service', 'expiration_date', 'status')->get();


        // Tasks Recentes

        // $tasks = Task::where('user_id', $user->id)
        //     ->orderBy('date')
        //     ->limit(5)
        //     ->get()
        //     ->map(fn($task) => [
        //         'id' => $task->id,
        //         'title' => $task->title,
        //         'description' => $task->description,
        //         'date' => Carbon::parse($task->date)->toDateString(),
        //         'hour' => $task->hour,
        //         'priority' => $task->priority,
        //     ]);



        $tasks = Task::where('user_id', $user->id)
            ->where(function ($query) use ($today) {
                $query
                    ->whereDate('date', $today)
                    ->orWhere(function ($q) use ($today) {
                        $q->whereDate('date', '<', $today)
                            ->where('completed', false);
                    });
            })
            ->orderBy('date')
            ->limit(5)
            ->get()
            ->map(fn($task) => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'date' => Carbon::parse($task->date)->toDateString(),
                'hour' => $task->hour,
                'priority' => $task->priority,
                'completed' => (bool) $task->completed,
            ]);

        // Alvarás

        $alvarasList = Lead::where('user_id', $user->id)
            ->whereNotNull('validity')
            ->where(function ($query) use ($today, $next60Days) {
                $query->whereDate('validity', '<=', $today)
                    ->orWhereBetween('validity', [
                        Carbon::parse($today)->addDay()->toDateString(),
                        $next60Days
                    ]);
            })
            ->orderByRaw("validity < '{$today}' DESC")
            ->orderBy('validity')
            ->get()
            ->map(function ($lead) use ($today) {
                $validity = Carbon::parse($lead->validity)->startOfDay();

                if ($validity->lt($today)) {
                    $status = 'vencido';
                } elseif ($validity->eq($today)) {
                    $status = 'vencendo-hoje';
                } else {
                    $status = 'ate-60-dias';
                }

                return [
                    'id' => $lead->id,
                    'company' => $lead->company,
                    'type' => $lead->service,
                    'validity' => $validity->toDateString(),
                    'status' => $status,
                ];
            });





        // Tasks

        $tasksList = Task::where('user_id', $user->id)
            ->where(function ($query) use ($today, $next30Days) {
                $query
                    ->whereDate('date', '<=', $today)
                    ->orWhereBetween('date', [
                        $today->copy()->addDay()->toDateString(),
                        $next30Days->toDateString()
                    ]);
            })
            ->orderByRaw("date < '{$today}' DESC")
            ->orderBy('date')
            ->get()
            ->map(function ($task) use ($today) {
                $taskDate = Carbon::parse($task->date)->startOfDay();

                if ($taskDate->lt($today)) {
                    $status = 'Atrasada';
                } elseif ($taskDate->eq($today)) {
                    $status = 'Vence hoje';
                } else {
                    $status = 'Agendada';
                }

                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'date' => $taskDate->toDateString(),
                    'status' => $status,
                ];
            });


        return response()->json([
            'status' => true,
            'data' => [
                'cards' => [
                    'leads' => [
                        'totalLeads' => $totalLeads,
                        'leadsThisMonth' => $leadsThisMonth,
                        'growthPercentage' => $leadsGrowthPercentage,
                    ],
                    'alvaras_a_vencer' => [
                        'totalAlvaras' => $totalAlvarasCurrent,
                        'growthPercentage' => $alvarasGrowthPercentage,
                    ],
                    'pipeline' => [
                        'totalPipeline' => $totalPipeline,
                        'pipelineThisMonth' => $pipelineThisMonth,
                        'growthPercentage' => $pipelineGrowthPercentage
                    ],
                    'aprimoramentos_pendentes' => [
                        'totalAprimoramentos' => $totalAprimoramentos,
                        'aprimoramentosThisMonth' => $aprimoramentosThisMonth,
                        'growthPercentage' => $aprimoramentosGrowthPercentage,
                    ],
                    'propostas_enviadas' => [
                        'totalPropostas' => $totalPropostas,
                        'propostasThisMonth' => $propostasThisMonth,
                        'growthPercentage' => $propostasGrowthPercentage,
                    ],
                    'taxa_conversao' => [
                        'totalTaxaConversao' => $taxaConversao,
                        'growthPercentage' => $taxaConversaoGrowthPercentage,
                        'ganhos' => $propostasGanhas,
                        'perdidos' => $propostasPerdidas,
                    ],
                ],
                'recentLeads' => $recentLeads,
                'recentTasks' => $tasks,
                'alvaras' => $alvarasList,
                'tasks' => $tasksList,

            ]
        ]);
    }
}
