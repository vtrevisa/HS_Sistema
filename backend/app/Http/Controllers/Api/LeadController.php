<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeadRequest;
use App\Models\Lead;
use App\Services\DateService;
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
                'message' => 'Token de autenticação é inválido ou expirado.',
            ], 401);
        }

        $user = $accessToken->tokenable;

        // Init transaction on DB
        DB::beginTransaction();

        try {

            // Add lead on DB

            $lead = Lead::create([
                'empresa' => strtoupper($request->input('empresa', '')),
                'tipo' => strtoupper($request->input('tipo', '')),
                'licenca' => $request->input('licenca', ''),
                'vigencia' => $request->input('vigencia', ''),
                'vencimento' => $request->input('vencimento', ''),
                'proxima_acao' => $request->input('proxima_acao', ''),
                'cep' => $request->input('cep', ''),
                'endereco' => ucwords(strtolower($request->input('endereco', ''))),
                'numero' => $request->input('numero', ''),
                'complemento' => ucwords(strtolower($request->input('complemento', ''))),
                'municipio' => ucwords(strtolower($request->input('municipio', ''))),
                'bairro' => ucwords(strtolower($request->input('bairro', ''))),
                'ocupacao' => $request->input('ocupacao', ''),
                'status' => $request->input('status', ''),
                'cnpj' => $request->input('cnpj', ''),
                'site' => $request->input('site', ''),
                'contato' => $request->input('contato', ''),
                'whatsapp' => $request->input('whatsapp', ''),
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
                'tipo' => strtoupper($request->tipo),
                'licenca' => $request->licenca,
                'vigencia' => DateService::convertToDatabaseFormat($request->vigencia),
                'endereco' => ucwords(strtolower($request->endereco)),
                'numero' => $request->numero,
                'municipio' => ucwords(strtolower($request->municipio)),
                'bairro' => ucwords(strtolower($request->bairro)),
                'ocupacao' => $request->ocupacao,
                'complemento' => ucwords(strtolower($request->complemento)),
                'cnpj'        => $request->cnpj,
                'site'        => strtolower($request->site),
                'contato'     => ucwords(strtolower($request->contato)),
                'whatsapp'    => $request->whatsapp,
                'email'       => strtolower($request->email),
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
