<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyRequest;
use App\Models\Company;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;


class CompanyController extends Controller
{

    public function searchCompanyByAddress(Request $request)
    {
        $address = $request->input('address');

        if (!$address) {
            return response()->json(['erro' => 'Endereço não informado.'], 400);
        }

        $googleApiKey   = env('GOOGLE_MAPS_API_KEY');
        $googleCseApiKey = env('GOOGLE_CSE_API_KEY');
        $googleCseCx    = env('GOOGLE_CSE_CX');

        if (!$googleApiKey) {
            return response()->json(['erro' => 'Google Maps API Key não configurada.'], 500);
        }

        if (!$googleCseApiKey || !$googleCseCx) {
            return response()->json(['erro' => 'Google CSE não configurado.'], 500);
        }

        // 1️⃣ Geocoding
        $geo = Http::timeout(10)->get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address' => $address,
            'key'     => $googleApiKey
        ]);

        if ($geo->failed() || empty($geo['results'])) {
            return response()->json(['erro' => 'Não foi possível geocodificar o endereço.'], 400);
        }

        $location = $geo['results'][0]['geometry']['location'];
        $lat = $location['lat'];
        $lng = $location['lng'];

        // 2️⃣ Nearby Search
        $nearby = Http::timeout(10)->get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', [
            'location' => "$lat,$lng",
            'radius'   => 100, // metros
            'type'     => 'establishment',
            'key'      => $googleApiKey
        ]);

        if ($nearby->failed() || empty($nearby['results'])) {
            return response()->json(['status' => 'pendente', 'erro' => 'Nenhuma empresa encontrada próxima ao endereço.'], 404);
        }

        $places = collect($nearby['results'])->map(function ($place) {
            return [
                'nome_empresa' => $place['name'] ?? null,
                'endereco'     => $place['vicinity'] ?? null,
                'lat'          => $place['geometry']['location']['lat'] ?? null,
                'lng'          => $place['geometry']['location']['lng'] ?? null,
                'types'        => $place['types'] ?? [],
                'place_id'     => $place['place_id'] ?? null,
                'telefone'     => null,
                'site'         => null,
                'cnpj'         => null,
                'dados_oficiais' => null
            ];
        })->all();

        $patternCnpj = '/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/';

        // 3️⃣ Buscar detalhes (telefone, site) e CNPJ via Google Custom Search
        foreach ($places as &$place) {
            // Detalhes Place
            $details = Http::timeout(10)->get('https://maps.googleapis.com/maps/api/place/details/json', [
                'place_id' => $place['place_id'],
                'fields'   => 'name,formatted_address,formatted_phone_number,website',
                'key'      => $googleApiKey
            ]);

            if ($details->ok() && !empty($details['result'])) {
                $detailData = $details['result'];
                $place['telefone'] = $detailData['formatted_phone_number'] ?? null;
                $place['site']     = $detailData['website'] ?? null;
                $place['endereco'] = $detailData['formatted_address'] ?? $place['endereco'];
            }

            // Busca CNPJ via Google Custom Search
            $queries = [];
            if (!empty($place['nome_empresa'])) {
                $queries[] = "\"{$place['nome_empresa']}\" CNPJ";
                if (!empty($place['endereco'])) {
                    $queries[] = "\"{$place['nome_empresa']}\" \"{$place['endereco']}\" CNPJ";
                }
                if (!empty($place['site'])) {
                    $queries[] = "site:{$place['site']} CNPJ";
                }
            }

            $cnpjFound = null;

            foreach ($queries as $q) {
                $respGoogle = Http::timeout(15)->get('https://www.googleapis.com/customsearch/v1', [
                    'key' => $googleCseApiKey,
                    'cx'  => $googleCseCx,
                    'q'   => $q,
                    'num' => 5
                ]);

                if (!$respGoogle->ok()) continue;

                $items = $respGoogle['items'] ?? [];
                foreach ($items as $item) {
                    $texts = [$item['title'] ?? '', $item['snippet'] ?? ''];
                    foreach ($texts as $text) {
                        if (preg_match($patternCnpj, $text, $matches)) {
                            $cnpjFound = $matches[0];
                            break 3; // sai da busca
                        }
                    }
                }
            }

            $place['cnpj'] = $cnpjFound;

            // Consulta ReceitaWS
            if ($cnpjFound) {
                $cnpjClean = preg_replace('/\D/', '', $cnpjFound);
                $respDados = Http::timeout(15)->get("https://www.receitaws.com.br/v1/cnpj/{$cnpjClean}");

                if ($respDados->ok() && ($respDados->json()['status'] ?? '') === 'OK') {
                    $dados = $respDados->json();
                    $place['dados_oficiais'] = [
                        'cnpj'          => $dados['cnpj'] ?? null,
                        'razao_social'  => $dados['nome'] ?? null,
                        'nome_fantasia' => $dados['fantasia'] ?? null,
                        'email'         => $dados['email'] ?? null,
                        'telefone'      => $dados['telefone'] ?? null,
                        'qsa_nomes'     => array_map(fn($q) => $q['nome'], $dados['qsa'] ?? [])
                    ];
                }
            }
        }

        // 4️⃣ Status
        $status = collect($places)->contains(fn($p) => $p['cnpj']) ? 'enriquecida' : 'pendente';

        return response()->json([
            'status' => $status,
            'places' => $places
        ]);
    }



    public function searchCompanyByCnpj(Request $request)
    {

        $cnpj = $request->input('cnpj');

        if (!$cnpj) {
            return response()->json(['erro' => 'CNPJ não informado.'], 400);
        }

        try {
            $cnpjLimpo = preg_replace('/\D/', '', $cnpj);

            $response = Http::timeout(20)->get("https://www.receitaws.com.br/v1/cnpj/{$cnpjLimpo}");

            if ($response->failed()) {
                return response()->json(['erro' => 'Erro ao consultar a API Receitaws.'], 500);
            }

            $dados = $response->json();


            if (isset($dados['status']) && $dados['status'] === 'ERROR') {
                return response()->json([
                    'erro' => $dados['message'] ?? 'CNPJ não encontrado.',
                    'cnpj' => $cnpjLimpo
                ], 404);
            }

            $result = [
                'cnpj'          => $dados['cnpj'] ?? null,
                'razao_social'  => $dados['nome'] ?? null,
                'nome_fantasia' => $dados['fantasia'] ?? null,
                'email'         => $dados['email'] ?? null,
                'telefone'      => $dados['telefone'] ?? null,
                'atividade_principal' => $dados['atividade_principal'][0]['text'] ?? null,
                'qsa_nomes'     => array_map(fn($q) => $q['nome'], $dados['qsa'] ?? []),
            ];

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'erro'   => 'Exceção ao consultar Receitaws.',
                'detalhe' => $e->getMessage()
            ], 500);
        }
    }


    // Show all companies from db

    public function index(): JsonResponse
    {

        $companies = Company::orderBy('id', 'DESC')->get();

        return response()->json([
            'status' => true,
            'companies' => $companies,
        ], 200);
    }

    // Show company from db

    public function show(Company $company): JsonResponse
    {
        return response()->json([
            'status' => true,
            'company' => $company,
        ], 200);
    }

    // Add comapny to db

    public function store(CompanyRequest $request): JsonResponse
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
            // Add company on DB

            $company = Company::create([
                'status' => $request->input('status', ''),
                'company' => ucwords(strtolower($request->input('company', ''))),
                'cep' => $request->input('cep', ''),
                'address' => ucwords(strtolower($request->input('address', ''))),
                'number' => $request->input('number', ''),
                'state' => strtoupper($request->input('state', '')),
                'city' => ucwords(strtolower($request->input('city', ''))),
                'service' => strtoupper($request->input('service', '')),
                'validity' => $request->input('validity', ''),
                'phone' => $request->input('phone', ''),
                'cnpj' => $request->input('cnpj', ''),
                'email' => strtolower($request->input('email', '')),
            ]);

            // Success Operation
            DB::commit();

            return response()->json([
                'status' => true,
                'company' => $company,
                'user' => $user,
                'message' => "Empresa cadastrada com sucesso!",
            ], 201);
        } catch (Exception $e) {
            // Init rollback transaction on DB
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => "Empresa não foi cadastrada!",
                'error' => $e->getMessage()
            ], 400);
        }
    }

    // Edit company from db

    public function update(CompanyRequest $request, Company $company): JsonResponse
    {
        // Init transaction on DB
        DB::beginTransaction();

        try {
            // Edit company on DB

            $company->update([
                'status' => $request->input('status', ''),
                'company' => ucwords(strtolower($request->input('company', ''))),
                'cep' => $request->input('cep', ''),
                'address' => ucwords(strtolower($request->input('address', ''))),
                'number' => $request->input('number', ''),
                'state' => strtoupper($request->input('state', '')),
                'city' => ucwords(strtolower($request->input('city', ''))),
                'service' => strtoupper($request->input('service', '')),
                'validity' => $request->input('validity', ''),
                'phone' => $request->input('phone', ''),
                'cnpj' => $request->input('cnpj', ''),
                'email' => strtolower($request->input('email', '')),
            ]);

            // Success Operation
            DB::commit();

            return response()->json([
                'status' => true,
                'company' => $company,
                'message' => "Empresa editada com sucesso!",
            ], 200);
        } catch (Exception $e) {
            // Init rollback transaction on DB
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => "Empresa não editada!",
                'error' => $e->getMessage()
            ], 400);
        }
    }

    // Delete company from db

    public function destroy(Company $company): JsonResponse
    {
        try {

            // Delete company on DB
            $company->delete();

            return response()->json([
                'status' => true,
                'company' => $company,
                'message' => "Empresa deletada com sucesso!",
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => "Empresa não apagada!",
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
