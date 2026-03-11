<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class NakayaService
{
    protected string $base;
    protected string $authHeader;
    protected string $token;

    public function __construct()
    {
        $this->base = rtrim(config('services.nakaya.base_uri') ?? '', '/');
        $this->authHeader = config('services.nakaya.auth_header', 'Authorization');
        $this->token = config('services.nakaya.token') ?? '';
    }


    public function consultaCidadesDiferentes(array $params): array
    {
        $endpoint = $this->base . '/webhook/consulta/cidades/diferentes-cidades';
    
        // normalize dates
        if (!empty($params['data_inicio'])) {
            $params['data_inicio'] = $this->formatDate($params['data_inicio']);
        }
        if (!empty($params['data_fim'])) {
            $params['data_fim'] = $this->formatDate($params['data_fim']);
        }

        try {
                $response = Http::withHeaders([
                    $this->authHeader => $this->token,
                ]) -> asMultipart()->post($endpoint, [
                    'estado' => $params['estado'],
                    'cidade_1'=> $params['cidade_1'],
                    'tipo' => $params['tipo'],
                    'data_inicio' => $params['data_inicio'],
                    'data_fim' => $params['data_fim'],
                ]);
            } catch (\Throwable $e) {
                Log::error('Nakaya API request failed: ' . $e->getMessage());
                throw new \RuntimeException('Nakaya API request failed: ' . $e->getMessage());
            }            
        return $response->json();
    }

    public function solicitacaoVencimentos(array $params): array
    {
        $endpoint = $this->base . '/webhook/solicitacao/vencimentos';

        if (!empty($params['data_inicio'])) {
            $params['data_inicio'] = $this->formatDate($params['data_inicio']);
        }
        if (!empty($params['data_fim'])) {
            $params['data_fim'] = $this->formatDate($params['data_fim']);
        }

        try {
                $response = Http::withHeaders([
                    $this->authHeader => $this->token,
                ]) -> asMultipart()->post($endpoint, [
                    'estado' => $params['estado'],
                    'cidade' => $params['cidade'],
                    'tipo' => $params['tipo'],
                    'data_inicio' => $params['data_inicio'],
                    'data_fim' => $params['data_fim'],
                    'quantidade' => $params['quantidade'],
                ]);
            } catch (\Throwable $e) {
                Log::error('Nakaya API request failed: ' . $e->getMessage());
                throw new \RuntimeException('Nakaya API request failed: ' . $e->getMessage());
            }            
        return $response->json();
    }

    // Example GET template (implement specifics as needed)
    public function getRecords(array $params): array
    {
        $endpoint = $this->base . '/webhook/consulta/consumo';

         if (!empty($params['data_inicio'])) {
            $params['data_inicio'] = $this->formatDate($params['data_inicio']);
        }
        if (!empty($params['data_fim'])) {
            $params['data_fim'] = $this->formatDate($params['data_fim']);
        }

        $response = Http::withHeaders([
            $this->authHeader => $this->token,
        ]) -> asMultipart()->get($endpoint, [
            'data_inicio' => $params['data_inicio'],
            'data_fim' => $params['data_fim'],
        ]);

        if ($response->failed()) {
            throw new \RuntimeException('Nakaya API GET failed: ' . $response->body());
        }

        return $response->json();
    }

    protected function formatDate(string $date): string
    {
        try {
            $dt = new \DateTime($date);
            return $dt->format('Y-m-d');
        } catch (\Throwable $e) {
            return $date;
        }
    }
}
