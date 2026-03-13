<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\NakayaService;

class NakayaController extends Controller
{
    protected NakayaService $service;

    public function __construct(NakayaService $service)
    {
        $this->service = $service;
    }

    public function consultaCidades(Request $request)
    {
        $validated = $request->validate([
            'estado' => 'required|string',
            'cidade_1' => 'required|string',
            'cidade_2' => 'sometimes|string|nullable',
            'cidade_3' => 'sometimes|string|nullable',
            'cidade_4' => 'sometimes|string|nullable',
            'cidade_5' => 'sometimes|string|nullable',
            'tipo' => 'required|string',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date',
        ]);

        try {
            $data = $this->service->consultaCidadesDiferentes($validated);
            return response()->json($data);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Falha ao consultar Nakaya', 'message' => $e->getMessage()], 502);
        }
    }

    public function solicitacaoVencimentos(Request $request)
    {
        $validated = $request->validate([
            'estado' => 'required|string',
            'cidade' => 'required|string',
            'tipo' => 'required|string',
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date',
            'quantidade' => 'required|integer',
        ]);

        try {
            $data = $this->service->solicitacaoVencimentos($validated);
            return response()->json($data);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Falha ao solicitar vencimentos', 'message' => $e->getMessage()], 502);
        }
    }

    // example GET proxy
    public function getRecords(Request $request)
    {
        $validated = $request->validate([
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date',
        ]);

        try {
            $data = $this->service->getRecords($validated);
            return response()->json($data);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Falha na consulta GET Nakaya', 'message' => $e->getMessage()], 502);
        }
    }
}
