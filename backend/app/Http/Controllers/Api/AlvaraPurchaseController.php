<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlvaraPurchase;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AlvaraPurchaseController extends Controller
{
    public function index(Request $request)
    {

        $token = $request->cookie('auth-token');
        $accessToken = PersonalAccessToken::findToken($token);
        $user = $accessToken?->tokenable;


        if (!$token || !$accessToken || !$user) {
            return response()->json([
                'status' => false,
                'message' => 'Usuário não autenticado ou token inválido.'
            ], 401);
        }

        $consumed = AlvaraPurchase::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($consumed);
    }

    public function store(Request $request)
    {

        $token = $request->cookie('auth-token');
        $accessToken = PersonalAccessToken::findToken($token);
        $user = $accessToken?->tokenable;

        if (!$token || !$accessToken || !$user) {
            return response()->json([
                'status' => false,
                'message' => 'Usuário não autenticado ou token inválido.'
            ], 401);
        }

        $request->validate([
            'service' => 'required|in:AVCB,CLCB',
            'city' => 'required|string|max:100',
            'address' => 'required|string|max:255',
            'occupation' => 'required|string|max:255',
            'validity' => 'required|date',
        ]);

        $alvara = AlvaraPurchase::create([
            'user_id' => $user->id,
            'service' => $request->service,
            'city' => $request->city,
            'address' => $request->address,
            'occupation' => $request->occupation,
            'validity' => $request->validity,
        ]);

        return response()->json($alvara, 201);
    }
}
