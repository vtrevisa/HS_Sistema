<?php

namespace App\Http\Controllers\Api;

use App\Models\Invoice;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{

    // Show all invoices from db

    public function index(Request $request)
    {
        $token = $request->cookie('auth-token');

        if (!$token) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        $user = $accessToken->tokenable;

        $invoices = Invoice::where('user_id', $user->id)
            ->orderByRaw("
                CASE 
                    WHEN description LIKE 'Assinatura Plano %' THEN 0
                    ELSE 1
                END
            ")
            ->orderBy('due_date', 'desc')
            ->get()->map(function ($invoice) {
                $invoice->amount = (float) $invoice->amount;
                return $invoice;
            });;

        return response()->json($invoices);
    }

    // Do payment plan

    public function pay(Request $request, $id)
    {
        $token = $request->cookie('auth-token');

        if (!$token) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        $user = $accessToken->tokenable;

        $invoice = Invoice::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'Fatura já paga'], 400);
        }

        /**
         * Simulando pagamento (pode integrar com PIX/Stripe/ASAAS aqui)
         */
        $paymentSuccess = true;

        if (!$paymentSuccess) {
            $invoice->update(['status' => 'failed']);
            return response()->json(['message' => 'Pagamento falhou'], 400);
        }

        // Marca como paga
        $invoice->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);

        // Renova o plano do usuário
        $user = $invoice->user;
        $user->plan_renews_at = now()->addDays(30);
        $user->monthly_used = 0;
        $user->save();

        return response()->json(['message' => 'Pagamento confirmado']);
    }
}
