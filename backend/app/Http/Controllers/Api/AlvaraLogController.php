<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlvaraLog;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AlvaraLogController extends Controller
{
    public function index(Request $request)
    {
        $token = $request->cookie('auth-token');

        if (!$token) {
            return response()->json([
                'status' => false,
                'message' => 'Token de autenticação é inválido ou não fornecido.',
            ], 401);
        }

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

        $query = AlvaraLog::with('user');

        if ($request->filled('user')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->user}%")
                    ->orWhere('email', 'like', "%{$request->user}%");
            });
        }

        if ($request->filled('city')) {
            $query->where('city', 'like', "%{$request->city}%");
        }

        if ($request->filled('service_type') && $request->service_type !== 'Todos') {
            $query->where('service_type', $request->service_type);
        }

        if ($request->filled('month') && $request->filled('year')) {
            $query
                ->whereYear('consumed_at', $request->year)
                ->whereMonth('consumed_at', $request->month);
        }

        $logs = $query
            ->orderByDesc('consumed_at')
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'userId' => $log->user->id,
                'userName' => $log->user->name,
                'userEmail' => $log->user->email,
                'city' => $log->city,
                'service' => $log->service_type,
                'quantity' => $log->quantity,
                'consumedAt' => $log->consumed_at->format('Y-m-d'),
                'period' => [
                    'start' => $log->period_start->format('Y-m-d'),
                    'end'   => $log->period_end->format('Y-m-d'),
                ],
            ]);

        return response()->json([
            'status' => true,
            'logs' => $logs,
            'totalConsumed' => $logs->sum('quantity'),
            'uniqueUsers' => $logs->pluck('userId')->unique()->count(),
        ]);
    }
}
