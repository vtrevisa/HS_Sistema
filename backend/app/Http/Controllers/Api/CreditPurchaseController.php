<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditPurchase;
use Illuminate\Http\Request;

class CreditPurchaseController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'credits' => 'required|integer|min:1',
            'amount_paid' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        // Registrar compra
        CreditPurchase::create([
            'user_id' => $user->id,
            'credits_purchased' => $request->credits,
            'amount_paid' => $request->amount_paid,
        ]);

        // Somar créditos ao usuário
        $user->credits += $request->credits;
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Créditos adicionados com sucesso!',
            'user_credits' => $user->credits
        ]);
    }
}
