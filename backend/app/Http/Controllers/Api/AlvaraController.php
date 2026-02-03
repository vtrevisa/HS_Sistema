<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alvara;
use App\Models\AlvaraLog;
use App\Models\AlvaraPurchase;
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

        $request->validate([
            'totalToRelease' => 'required|integer|min:1',
            'city'           => 'required|string',
            'service_type'   => 'required|in:AVCB,CLCB,Todos',
            'period_start'   => 'required|date',
            'period_end'     => 'required|date|after_or_equal:period_start',
            'alvaras'        => 'required|array',
            'alvaras.*.service' => 'required|string|in:AVCB,CLCB',
            'alvaras.*.address' => 'required|string',
            'alvaras.*.occupation' => 'required|string',
            'alvaras.*.validity' => 'required|date',

        ]);

        $token = $request->cookie('auth-token');
        $accessToken = PersonalAccessToken::findToken($token);
        $user = $accessToken->tokenable;


        if (!$token) {
            return response()->json([
                'status' => false,
                'message' => 'Token de autenticação é inválido ou não fornecido.',
            ], 401);
        }

        if (!$accessToken) {
            return response()->json([
                'status' => false,
                'message' => 'Token não encontrado.',
            ], 401);
        }

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        $totalToRelease = (int) $request->totalToRelease;
        $creditsAvailable = (int) $user->credits;

        if ($totalToRelease <= 0) {
            return response()->json([
                'status' => false,
                'message' => 'Quantidade inválida de alvarás a liberar.'
            ], 400);
        }

        if ($creditsAvailable < $totalToRelease) {
            return response()->json([
                'creditsUsed' => 0,
                'creditsAvailable' => $creditsAvailable,
                'extraNeeded' => $totalToRelease - $creditsAvailable,
                'monthly_used' => $user->monthly_used
            ], 200);
        }

        return DB::transaction(function () use ($request, $user, $totalToRelease) {


            // 1️⃣ Debita créditos
            $user->credits -= $totalToRelease;
            $user->monthly_used += $totalToRelease;
            $user->save();

            // 2️⃣ Registra LOG do consumo
            AlvaraLog::create([
                'user_id'      => $user->id,
                'city'         => $request->city,
                'service_type' => $request->service_type,
                'quantity'     => $totalToRelease,
                'period_start' => $request->period_start,
                'period_end'   => $request->period_end,
                'consumed_at'  => now(),
            ]);

            $savedCount = 0;

            // 3️⃣ Salva alvarás recebidos do frontend
            foreach ($request->alvaras as $alvara) {

                $exists = AlvaraPurchase::where('user_id', $user->id)
                    ->where('service', $alvara['service'])
                    ->where('city', $alvara['city'])
                    ->where('address', $alvara['address'])
                    ->whereDate('validity', $alvara['validity'])
                    ->exists();


                if (!$exists) {
                    AlvaraPurchase::create([
                        'user_id' => $user->id,
                        'service' => $alvara['service'],
                        'city' => $alvara['city'],
                        'address' => $alvara['address'],
                        'occupation' => $alvara['occupation'],
                        'validity' => $alvara['validity'],
                    ]);
                    $savedCount++;
                }
            }
            return response()->json([
                'creditsUsed' => $totalToRelease,
                'creditsAvailable' => $user->credits,
                'extraNeeded' => 0,
                'monthly_used' => $user->monthly_used,
                'savedAlvaras' => $savedCount,
            ]);
        });
    }
}
