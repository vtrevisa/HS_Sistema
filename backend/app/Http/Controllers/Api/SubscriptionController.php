<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function start(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user = $request->user();
        $plan = Plan::find($request->plan_id);

        $user->plan_id = $plan->id;
        $user->credits = $plan->monthly_credits;
        $user->last_renewal_at = now();
        $user->plan_renews_at = now()->addMonth();
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Plano ativado com sucesso!',
            'user' => $user
        ]);
    }
}
