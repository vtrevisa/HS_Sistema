<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alvara;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        if ($from && $to) {
            $query->where(function ($q) use ($from, $to) {
                $q->where(function ($q2) use ($from) {
                    $q2->where('year', '>', $from['year'])
                        ->orWhere(function ($q3) use ($from) {
                            $q3->where('year', $from['year'])
                                ->where('month', '>=', $from['month']);
                        });
                })->where(function ($q2) use ($to) {
                    $q2->where('year', '<', $to['year'])
                        ->orWhere(function ($q3) use ($to) {
                            $q3->where('year', $to['year'])
                                ->where('month', '<=', $to['month']);
                        });
                });
            });
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
}
