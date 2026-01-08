<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanChangeRequest;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = PlanChangeRequest::with([
            'user:id,name,email',
            'currentPlan:id,name',
            'requestedPlan:id,name',
        ]);

        if ($status) {
            $query->where('status', $status);
        }

        return response()->json([
            'status' => true,
            'requests' => $query->orderBy('created_at', 'desc')->get()
        ]);
    }

    public function requestChange(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|integer|exists:plans,id',
        ]);

        $user = $this->getUserFromToken($request);
        if (!$user) return $this->unauthorized();

        $hasPending = PlanChangeRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return response()->json([
                'status' => false,
                'message' => 'Você já possui uma solicitação pendente.'
            ], 422);
        }

        PlanChangeRequest::create([
            'user_id' => $user->id,
            'current_plan_id' => $user->plan_id,
            'requested_plan_id' => $request->plan_id,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Solicitação enviada com sucesso. Aguarde aprovação.'
        ]);

        //$planId = (int) $request->input('plan_id');

        // return DB::transaction(function () use ($user, $planId) {
        //     $plan = Plan::find($planId);

        //     if (!$plan) {
        //         return response()->json([
        //             'status' => false,
        //             'message' => 'Plano não encontrado.'
        //         ], 404);
        //     }


        //     $user->plan_id = $plan->id;
        //     $user->plan_renews_at = now()->addMonth();
        //     $user->save();

        //     return response()->json([
        //         'status' => true,
        //         'message' => 'Plano atualizado com sucesso!',
        //         'user' => [
        //             'id' => $user->id,
        //             'plan_id' => $user->plan_id,
        //             'plan' => [
        //                 'id' => $plan->id,
        //                 'name' => $plan->name,
        //                 'monthly_credits' => $plan->creditsLimit,
        //                 'price' => $plan->price,
        //                 'plan_renews_at' => $user->plan_renews_at,
        //             ]
        //         ]
        //     ]);
        // });
    }

    public function pendingRequests(): JsonResponse
    {
        return response()->json([
            'status' => true,
            'requests' => PlanChangeRequest::with(['user', 'requestedPlan'])
                ->where('status', 'pending')
                ->latest()
                ->get()
        ]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $admin = $this->getUserFromToken($request);
        if (!$admin || !$admin->is_admin) return $this->unauthorized();

        $planRequest = PlanChangeRequest::findOrFail($id);

        DB::transaction(function () use ($planRequest, $admin) {
            $user = $planRequest->user;
            $plan = $planRequest->requestedPlan;

            $user->update([
                'plan_id' => $plan->id,
                'credits' => $plan->creditsLimit,
                'plan_renews_at' => now()->addMonth(),
            ]);

            $planRequest->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => $admin->id,
            ]);
        });

        return response()->json([
            'status' => true,
            'message' => 'Plano aprovado com sucesso.'
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $admin = $this->getUserFromToken($request);
        if (!$admin || !$admin->is_admin) return $this->unauthorized();

        $planRequest = PlanChangeRequest::findOrFail($id);

        $planRequest->update([
            'status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => $admin->id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Solicitação rejeitada.'
        ]);
    }

    private function getUserFromToken(Request $request)
    {
        $token = $request->cookie('auth-token');
        if (!$token) return null;

        $accessToken = PersonalAccessToken::findToken($token);
        return $accessToken?->tokenable;
    }

    private function unauthorized(): JsonResponse
    {
        return response()->json([
            'status' => false,
            'message' => 'Usuário não autorizado.'
        ], 401);
    }
}
