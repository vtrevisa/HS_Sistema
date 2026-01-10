<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        // Total de leads
        $totalLeads = Lead::count();

        $leadsThisMonth = Lead::whereBetween('created_at', [
            $startCurrentMonth,
            $endCurrentMonth
        ])->count();

        $leadsLastMonth = Lead::whereBetween('created_at', [
            $startLastMonth,
            $endLastMonth
        ])->count();

        $leadsGrowthPercentage = 0;

        if ($leadsLastMonth > 0) {
            $leadsGrowthPercentage = round(
                (($leadsThisMonth - $leadsLastMonth) / $leadsLastMonth) * 100,
                1
            );
        }

        // Pipeline Ativo

        $pipelineBaseQuery = Lead::whereNotIn('status', [
            'Cliente fechado',
            'Arquivado'
        ]);

        // Total ativo
        $totalPipeline = (clone $pipelineBaseQuery)->sum('service_value');

        // Mês atual
        $pipelineThisMonth = (clone $pipelineBaseQuery)
            ->whereBetween('created_at', [
                $startCurrentMonth,
                $endCurrentMonth
            ])
            ->sum('service_value');

        // Mês passado
        $pipelineLastMonth = (clone $pipelineBaseQuery)
            ->whereBetween('created_at', [
                $startLastMonth,
                $endLastMonth
            ])
            ->sum('service_value');

        $pipelineGrowthPercentage = 0;

        if ($pipelineLastMonth > 0) {
            $pipelineGrowthPercentage = round(
                (($pipelineThisMonth - $pipelineLastMonth) / $pipelineLastMonth) * 100,
                1
            );
        }

        // Propostas Enviadas

        $statusProposta = 'Proposta enviada';

        // Total de propostas enviadas (geral)
        $totalPropostas = Lead::where('status', $statusProposta)->count();

        // Propostas enviadas este mês
        $propostasThisMonth = Lead::where('status', $statusProposta)
            ->whereBetween('created_at', [$startCurrentMonth, $endCurrentMonth])
            ->count();

        // Propostas enviadas mês passado
        $propostasLastMonth = Lead::where('status', $statusProposta)
            ->whereBetween('created_at', [$startLastMonth, $endLastMonth])
            ->count();

        // Crescimento percentual
        $propostasGrowthPercentage = 0;

        if ($propostasLastMonth > 0) {
            $propostasGrowthPercentage = round(
                (($propostasThisMonth - $propostasLastMonth) / $propostasLastMonth) * 100,
                1
            );
        }

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
                    ]
                ]
            ]
        ]);
    }
}
