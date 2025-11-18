<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alvara;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AlvaraController extends Controller
{

    // Show all companies from db

    public function index(): JsonResponse
    {

        $cities = Alvara::select('city')->distinct()->pluck('city');
        $months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        $year = 2025;

        $alvarasData = [];

        foreach ($cities as $city) {

            $records = Alvara::where('city', $city)
                ->where('year', $year)
                ->get()
                ->keyBy('month');

            foreach ($months as $month) {
                $record = $records->get($month);
                $avcb = $record->avcb ?? 0;
                $clcb = $record->clcb ?? 0;

                $alvarasData[] = [
                    'city' => $city,
                    'year' => $year,
                    'month' => $month,
                    'avcb' => $avcb,
                    'clcb' => $clcb,
                    'total_per_month' => $avcb + $clcb,
                ];
            }
        }

        return response()->json([
            'status' => true,
            'alvaras' => $alvarasData,
        ], 200);
    }

    public function search(Request $request)
    {
        $city = $request->input('city');
        $selectedTypeFilter = $request->input('selectedTypeFilter');
        $from = $request->input('from');
        $to = $request->input('to');

        $query = Alvara::query();


        // Filter by city
        if ($city) {
            $query->where('city', $city);
        }

        // Convert text month to number.

        $months = [
            'jan' => 1,
            'fev' => 2,
            'mar' => 3,
            'abr' => 4,
            'mai' => 5,
            'jun' => 6,
            'jul' => 7,
            'ago' => 8,
            'set' => 9,
            'out' => 10,
            'nov' => 11,
            'dez' => 12
        ];

        if ($from && $to) {
            $fromYear = (int) $from['year'];
            $toYear = (int) $to['year'];
            $fromMonth = $months[strtolower($from['month'])] ?? null;
            $toMonth = $months[strtolower($to['month'])] ?? null;

            if ($fromMonth && $toMonth) {
                //  Range filter (with months sorted)
                $query->where(function ($q) use ($fromYear, $toYear, $fromMonth, $toMonth) {
                    $q->where(function ($sub) use ($fromYear, $fromMonth) {
                        $sub->where('year', '>', $fromYear)
                            ->orWhere(function ($sub2) use ($fromYear, $fromMonth) {
                                $sub2->where('year', $fromYear)
                                    ->whereRaw('FIELD(month, "jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez") >= ?', [$fromMonth]);
                            });
                    })->where(function ($sub) use ($toYear, $toMonth) {
                        $sub->where('year', '<', $toYear)
                            ->orWhere(function ($sub2) use ($toYear, $toMonth) {
                                $sub2->where('year', $toYear)
                                    ->whereRaw('FIELD(month, "jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez") <= ?', [$toMonth]);
                            });
                    });
                });
            }
        }

        // Select fields according to the filter
        if ($selectedTypeFilter === 'AVCB') {
            $query->select('id', 'city', 'year', 'month', 'avcb');
        } elseif ($selectedTypeFilter === 'CLCB') {
            $query->select('id', 'city', 'year', 'month', 'clcb');
        } else { // All
            $query->selectRaw('id, city, year, month, avcb, clcb, (avcb + clcb) as total_per_month');
        }

        $alvaras = $query->get();

        return response()->json([
            'alvaras' => $alvaras
        ]);
    }

    public function release(Request $request): JsonResponse
    {
        $token = $request->cookie('auth-token');

        if (!$token) {
            return response()->json([
                'status' => false,
                'message' => 'Token de autenticação é inválido ou não fornecido.',
            ], 401);
        }

        // Retrieves the user associated with the token
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return response()->json([
                'status' => false,
                'message' => 'Token não encontrado.',
            ], 401);
        }

        $user = $accessToken->tokenable;

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        $totalToRelease = (int) $request->input('totalToRelease', 0);

        if ($totalToRelease <= 0) {
            return response()->json([
                'status' => false,
                'message' => 'Quantidade inválida de alvarás a liberar.'
            ], 400);
        }

        // O saldo atual do usuário antes de qualquer operação
        $creditsAvailable = $user->credits;

        // O valor que falta para a transação
        $extraNeeded = max($totalToRelease - $creditsAvailable, 0);

        // O quanto seria consumido se a transação fosse parcial (usado no retorno de erro)
        $creditsConsumedIncomplete = min($creditsAvailable, $totalToRelease);

        if ($extraNeeded === 0) {
            // ✅ FLUXO DE SUCESSO: Créditos suficientes ou saldo exato.
            return DB::transaction(function () use ($user, $totalToRelease) {

                // 1. DÉBITO: O valor usado é o total solicitado ($totalToRelease)
                $user->credits -= $totalToRelease;
                $user->monthly_used += $totalToRelease;
                $user->save();

                return response()->json([
                    'creditsUsed' => $totalToRelease, // Usou o total solicitado
                    'creditsAvailable' => $user->credits, // Novo saldo
                    'extraNeeded' => 0,
                    'monthly_used' => $user->monthly_used
                ]);
            });
        } else {
            // 🛑 FLUXO DE PAGAMENTO REQUERIDO: Informa a necessidade, mas NÃO debita NADA no DB.

            return response()->json([
                'creditsUsed' => $creditsConsumedIncomplete, // Valor parcial que seria usado
                'creditsAvailable' => $creditsAvailable, // Saldo no DB PERMANECE o mesmo
                'extraNeeded' => $extraNeeded, // Valor que precisa ser comprado
                'monthly_used' => $user->monthly_used + $creditsConsumedIncomplete
            ]);
        }
    }
}
