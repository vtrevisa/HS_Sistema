<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArchivedProposal;
use App\Traits\AuthenticatesWithToken;
use App\Models\Lead;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        return response()->json([
            'status' => true,
            'data' => [
                'cards' => [
                    'leads' => [
                        'totalLeads' => $totalLeads,
                        'leadsThisMonth' => $leadsThisMonth,
                        'growthPercentage' => $leadsGrowthPercentage,
                    ],
                    'pipeline' => [
                        'totalPipeline' => $totalPipeline,
                        'pipelineThisMonth' => $pipelineThisMonth,
                        'growthPercentage' => $pipelineGrowthPercentage
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
                'recentLeads' => $recentLeads
            ]
        ]);
    }
}
