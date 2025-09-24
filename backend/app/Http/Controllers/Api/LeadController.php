<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeadRequest;
use App\Models\Lead;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class LeadController extends Controller
{
    // Show all leads from db

    public function index(): JsonResponse
    {

        $leads = Lead::orderBy('id', 'DESC')->get();

        return response()->json([
            'status' => true,
            'leads' => $leads,
        ], 200);
    }

    // Show lead from db

    public function show(Lead $lead): JsonResponse
    {
        return response()->json([
            'status' => true,
            'lead' => $lead,
        ], 200);
    }


    // Add lead to db

    public function store(LeadRequest $request): JsonResponse
    {

        $token = $request->bearerToken() ?? $request->cookie('auth-token');

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
                'message' => 'Token de autenticação é inválido ou expirado.',
            ], 401);
        }

        $user = $accessToken->tokenable;

        // Init transaction on DB
        DB::beginTransaction();

        try {

            // Add lead on DB

            $lead = Lead::create([
                'company' => strtoupper($request->input('company', '')),
                'service' => strtoupper($request->input('service', '')),
                'license' => $request->input('license', ''),
                'validity' => $request->input('validity', ''),
                'expiration_date' => $request->input('expiration_date', ''),
                'next_action' => $request->input('next_action', ''),
                'cep' => $request->input('cep', ''),
                'address' => ucwords(strtolower($request->input('address', ''))),
                'number' => $request->input('number', ''),
                'complement' => ucwords(strtolower($request->input('complement', ''))),
                'city' => ucwords(strtolower($request->input('city', ''))),
                'district' => ucwords(strtolower($request->input('district', ''))),
                'occupation' => $request->input('occupation', ''),
                'status' => $request->input('status', ''),
                'cnpj' => $request->input('cnpj', ''),
                'website' => $request->input('website', ''),
                'contact' => $request->input('contact', ''),
                'phone' => $request->input('phone', ''),
                'email' => $request->input('email', ''),

            ]);

            // Success Operation
            DB::commit();

            return response()->json([
                'status' => true,
                'lead' => $lead,
                'user' => $user,
                'message' => "Lead cadastrado com sucesso!",
            ], 201);
        } catch (Exception $e) {

            // Init rollback transaction on DB
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => "Lead não cadastrado!",
                'error' => $e->getMessage()
            ], 400);
        }
    }

    // Edit lead from db

    public function update(LeadRequest $request, Lead $lead): JsonResponse
    {
        // Init transaction on DB
        DB::beginTransaction();

        try {

            // Edit lead on DB

            $lead->update([
                'company' => strtoupper($request->input('company', '')),
                'service' => strtoupper($request->input('service', '')),
                'license' => $request->input('license', ''),
                'validity' => $request->input('validity', ''),
                'expiration_date' => $request->input('expiration_date', ''),
                'next_action' => $request->input('next_action', ''),
                'cep' => $request->input('cep', ''),
                'address' => ucwords(strtolower($request->input('address', ''))),
                'number' => $request->input('number', ''),
                'complement' => ucwords(strtolower($request->input('complement', ''))),
                'city' => ucwords(strtolower($request->input('city', ''))),
                'district' => ucwords(strtolower($request->input('district', ''))),
                'occupation' => $request->input('occupation', ''),
                'status' => $request->input('status', ''),
                'cnpj' => $request->input('cnpj', ''),
                'website' => $request->input('website', ''),
                'contact' => $request->input('contact', ''),
                'phone' => $request->input('phone', ''),
                'email' => $request->input('email', ''),
            ]);

            // Success Operation
            DB::commit();

            return response()->json([
                'status' => true,
                'lead' => $lead,
                'message' => "Lead editado com sucesso!",
            ], 200);
        } catch (Exception $e) {
            // Init rollback transaction on DB
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => "Lead não editado!",
            ], 400);
        }
    }

    // Delete lead from db

    public function destroy(Lead $lead): JsonResponse
    {
        try {

            // Delete lead on DB
            $lead->delete();

            return response()->json([
                'status' => true,
                'lead' => $lead,
                'message' => "Lead deletado com sucesso!",
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => "Lead não apagado!",
            ], 400);
        }
    }
}
