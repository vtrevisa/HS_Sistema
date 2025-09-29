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

        $googleApiKey     = env('GOOGLE_MAPS_API_KEY');
        $googleCseApiKey  = env('GOOGLE_CSE_API_KEY');
        $googleCseCx      = env('GOOGLE_CSE_CX');
        $infoSimplesToken = env('INFOSIMPLES_API_KEY');

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
            'radius'   => 20,
            'type'     => 'establishment',
            'key'      => $googleApiKey
        ]);

        $places = [];
        if ($nearby->ok() && !empty($nearby['results'])) {
            $places = collect($nearby['results'])
                ->filter(fn($p) => in_array('establishment', $p['types'] ?? []))
                ->all();
        }

        // 3️⃣ Fallback Text Search
        if (empty($places)) {
            $textSearch = Http::timeout(10)->get('https://maps.googleapis.com/maps/api/place/textsearch/json', [
                'query' => $address,
                'type'  => 'establishment',
                'key'   => $googleApiKey
            ]);

            if ($textSearch->ok() && !empty($textSearch['results'])) {
                $places = $textSearch['results'];
            }
        }

        if (empty($places)) {
            return response()->json(['erro' => 'Nenhuma empresa encontrada próxima ao endereço.'], 404);
        }

        $result = [];

        // 4️⃣ Process the results
        foreach ($places as $place) {
            $placeId = $place['place_id'];

            $details = Http::timeout(10)->get('https://maps.googleapis.com/maps/api/place/details/json', [
                'place_id' => $placeId,
                'fields'   => 'name,formatted_address,formatted_phone_number,website,types,geometry',
                'key'      => $googleApiKey
            ]);

            if ($details->failed() || empty($details['result'])) {
                continue;
            }

            $company      = $details['result'];
            $companyName  = $company['name'] ?? null;
            $companyAddr  = $company['formatted_address'] ?? null;
            $cnpjInfo     = "CNPJ não encontrado";
            $cnpjSource   = null;
            $dadosOficiais = null;

            // 5️⃣ Search for CNPJ via Google Custom Search
            if ($googleCseApiKey && $googleCseCx) {

                $queries = [
                    "\"$companyName\" CNPJ",
                    "\"$companyName\" \"$companyAddr\" CNPJ",
                    "\"$companyAddr\" CNPJ"
                ];

                foreach ($queries as $q) {
                    $respGoogle = Http::get("https://www.googleapis.com/customsearch/v1", [
                        'key' => $googleCseApiKey,
                        'cx'  => $googleCseCx,
                        'q'   => $q,
                        'num' => 5
                    ]);

                    if ($respGoogle->ok()) {
                        $items = $respGoogle['items'] ?? [];
                        $pattern = '/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/';

                        foreach ($items as $item) {
                            $snippet = $item['snippet'] ?? '';
                            $title   = $item['title'] ?? '';

                            if (preg_match($pattern, $snippet, $matches) || preg_match($pattern, $title, $matches)) {
                                $cnpjInfo   = $matches[0];
                                $cnpjSource = 'google_custom_search';
                                break 2;
                            }
                        }
                    }
                }
            }

            // 6️⃣ Check InfoSimples if you found a CNPJ
            if ($cnpjInfo !== "CNPJ não encontrado" && $infoSimplesToken) {
                $respDados = Http::timeout(20)->get("https://api.infosimples.com/api/v2/consultas/receita-federal/cnpj", [
                    'token' => $infoSimplesToken,
                    'cnpj'  => preg_replace('/\D/', '', $cnpjInfo)
                ]);

                if ($respDados->ok()) {
                    $dados = $respDados->json();

                    $dadosOficiais = [
                        'cnpj'        => $dados['data'][0]['cnpj'] ?? null,
                        'email'       => $dados['data'][0]['email'] ?? null,
                        'razao_social' => $dados['data'][0]['razao_social'] ?? null,
                        'telefone'    => $dados['data'][0]['telefone'] ?? null,
                        'qsa_nomes'   => array_column($dados['data'][0]['qsa'] ?? [], 'nome')
                    ];
                }
            }

            $result[] = [
                'nome_empresa'       => $companyName,
                'telefone'           => $company['formatted_phone_number'] ?? null,
                'site'               => $company['website'] ?? null,
                'endereco_formatado' => $company['formatted_address'] ?? null,
                'categorias'         => $company['types'] ?? [],
                'lat'                => $company['geometry']['location']['lat'] ?? null,
                'lng'                => $company['geometry']['location']['lng'] ?? null,
                'cnpj_info'          => $cnpjInfo,
                'cnpj_source'        => $cnpjSource,
                'dados_oficiais'     => $dadosOficiais
            ];
        }

        return response()->json($result);
    }



    public function searchCompanyByCnpj(Request $request)
    {
        $cnpj = $request->input('cnpj');

        if (!$cnpj) {
            return response()->json(['erro' => 'CNPJ não informado.'], 400);
        }

        $infoSimplesToken = env('INFOSIMPLES_API_KEY');

        try {
            $response = Http::timeout(20)->asForm()->post(
                'https://api.infosimples.com/api/v2/consultas/receita-federal/cnpj',
                [
                    'token'   => $infoSimplesToken,
                    'timeout' => 600,
                    'cnpj'    => preg_replace('/\D/', '', $cnpj), // só números
                ]
            );

            if ($response->failed()) {
                return response()->json(['erro' => 'Erro ao consultar a API InfoSimples.'], 500);
            }

            $data = $response->json();

            if (empty($data['data'][0])) {
                return response()->json([
                    'erro' => 'CNPJ não encontrado.',
                    'cnpj' => $cnpj
                ], 404);
            }

            $dados = $data['data'][0];

            $result = [
                'cnpj'         => $dados['cnpj'] ?? null,
                'razao_social' => $dados['razao_social'] ?? null,
                'nome_fantasia' => $dados['nome_fantasia'] ?? null,
                'email'        => $dados['email'] ?? null,
                'telefone'     => $dados['telefone'] ?? null,
                //'qsa_nomes'    => array_map(fn($q) => $q['nome'], $dados['qsa'] ?? []),
            ];

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'erro'   => 'Exceção ao consultar InfoSimples.',
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
