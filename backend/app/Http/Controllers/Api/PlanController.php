<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => true,
            'plans' => Plan::all()
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|integer|exists:plans,id',
        ]);

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

        $planId = (int) $request->input('plan_id');

        return DB::transaction(function () use ($user, $planId) {
            $plan = Plan::find($planId);

            if (!$plan) {
                return response()->json([
                    'status' => false,
                    'message' => 'Plano não encontrado.'
                ], 404);
            }


            $user->plan_id = $plan->id;
            $user->plan_renews_at = now()->addMonth();
            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Plano atualizado com sucesso!',
                'user' => [
                    'id' => $user->id,
                    'plan_id' => $user->plan_id,
                    'plan' => [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'monthly_credits' => $plan->creditsLimit,
                        'price' => $plan->price,
                        'plan_renews_at' => $user->plan_renews_at,
                    ]
                ]
            ]);
        });
    }
}
