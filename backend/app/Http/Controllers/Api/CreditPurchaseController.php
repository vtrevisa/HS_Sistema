<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CreditPurchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class CreditPurchaseController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'credits' => 'required|integer|min:1',
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string',
            'transaction_id' => 'nullable|string|unique:credit_purchases,transaction_id',
        ]);

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

        return DB::transaction(function () use ($request, $user) {
            // ✔️ Evita duplicar pagamento no futuro (webhook)
            if ($request->transaction_id) {
                $exists = CreditPurchase::where('transaction_id', $request->transaction_id)->exists();
                if ($exists) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Transação já processada.'
                    ], 409);
                }
            }

            // ✔️ Registrar compra
            $purchase = CreditPurchase::create([
                'user_id' => $user->id,
                'credits_purchased' => $request->credits,
                'amount_paid' => $request->amount_paid,
                'payment_method' => $request->payment_method, // ✅ adicionado
                'transaction_id' => $request->transaction_id,
            ]);

            // ✔️ Atualizar créditos do usuário
            $user->credits += $request->credits;
            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Créditos adicionados com sucesso!',
                'purchase' => $purchase,
                'user_credits' => $user->credits
            ]);
        });
    }
}
