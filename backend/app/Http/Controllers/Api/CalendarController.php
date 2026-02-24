<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class CalendarController extends Controller
{
    public function alvaras(Request $request)
    {

        $token = $request->cookie('auth-token');
        $accessToken = PersonalAccessToken::findToken($token);
        $user = $accessToken?->tokenable;

        if (!$token || !$accessToken || !$user) {
            return response()->json([
                'status' => false,
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        $alvaras = Lead::query()
            ->where('user_id', $user->id)
            ->whereNotNull('validity')
            ->select([
                'id',
                'company',
                'service',
                'validity',
                'address'
            ])
            ->orderBy('validity')
            ->get();

        return response()->json([
            'status' => true,
            'alvaras' => $alvaras
        ]);
    }
}
