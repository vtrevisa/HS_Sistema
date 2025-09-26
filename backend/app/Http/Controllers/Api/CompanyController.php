<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;


class CompanyController extends Controller
{

    public function searchCompanyByAddress(Request $request)
    {
        $address = $request->input('address');

        if (!$address) {
            return response()->json(['erro' => 'Endereço não informado.'], 400);
        }

        $googleApiKey = env('GOOGLE_MAPS_API_KEY');
        $googleCseApiKey = env('GOOGLE_CSE_API_KEY');
        $googleCseCx    = env('GOOGLE_CSE_CX');
        $infoSimplesToken = env('INFOSIMPLES_TOKEN');

        // 1️⃣ Geocoding

        $geo = Http::timeout(10)->get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address' => $address,
            'key' => $googleApiKey
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
            'radius'   => 150, // 150m
            'type'     => 'establishment',
            'key'      => $googleApiKey
        ]);

        $places = [];
        if ($nearby->ok() && !empty($nearby['results'])) {
            $places = collect($nearby['results'])->filter(fn($p) => in_array('establishment', $p['types'] ?? []))->all();
        }

        // 3️⃣ Fallback Text Search if Nearby didn't find anything

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
            return response()->json(['erro' => 'Nenhum estabelecimento encontrado para esse endereço.'], 404);
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

            $company = $details['result'];
            $companyName = $company['name'] ?? null;
            $companyAddr  = $company['formatted_address'] ?? null;

            $cnpjInfo = "CNPJ não encontrado";
            $cnpjSource = null;

            // 🔹 5️⃣ First try Google Custom Search

            if ($cnpjInfo === "CNPJ não encontrado" && $googleCseApiKey && $googleCseCx) {
                preg_match('/,\s*([^,]+)\s*-\s*[A-Z]{2}/', $companyAddr, $matches);
                $city = $matches[1] ?? '';

                $queries = [
                    "\"$companyName\" \"$city\" CNPJ",
                    "\"$companyName\" CNPJ",
                    "\"$companyAddr\" CNPJ",
                    "\"$companyName\" \"$companyAddr\" CNPJ",
                ];

                foreach ($queries as $q) {
                    Log::info("🔍 Buscando CNPJ no Google CSE", ['query' => $q]);

                    $respGoogle = Http::get("https://www.googleapis.com/customsearch/v1", [
                        'key' => $googleCseApiKey,
                        'cx'  => $googleCseCx,
                        'q'   => $q,
                        'num' => 5
                    ]);


                    if ($respGoogle->ok()) {
                        $items   = $respGoogle['items'] ?? [];
                        Log::info("📄 Resultado do Google CSE", ['items' => $items]);

                        $pattern = '/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/';

                        foreach ($items as $item) {
                            $snippet = $item['snippet'] ?? '';
                            $title   = $item['title'] ?? '';
                            $link    = $item['link'] ?? '';

                            if (preg_match($pattern, $snippet, $matches) || preg_match($pattern, $title, $matches)) {
                                $cnpjInfo   = $matches[0];
                                $cnpjSource = 'google_custom_search';
                                Log::info("✅ CNPJ encontrado via Google CSE", [
                                    'cnpj' => $cnpjInfo,
                                    'fonte' => $link
                                ]);
                                break 2;
                            }
                        }
                    } else {
                        Log::warning("❌ Falha ao consultar Google CSE", ['query' => $q]);
                    }
                }
            }

            // 6️⃣ If you didn't find it on Google, try InfoSimples

            if ($cnpjInfo === "CNPJ não encontrado" && $companyName && $infoSimplesToken) {
                Log::info("🔄 Tentando buscar CNPJ via InfoSimples", ['nome' => $companyName]);

                $respInfo = Http::timeout(20)->get("https://api.infosimples.com/api/v2/consultas/receita-federal/cnpj", [
                    'token' => $infoSimplesToken,
                    'nome'  => $companyName
                ]);

                if ($respInfo->ok() && isset($respInfo['cnpj'])) {
                    $cnpjInfo   = $respInfo['cnpj'];
                    $cnpjSource = 'infosimples';

                    Log::info("✅ CNPJ encontrado via InfoSimples", ['cnpj' => $cnpjInfo]);
                } else {
                    Log::warning("❌ Nenhum CNPJ encontrado na InfoSimples", ['nome' => $companyName]);
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
                'cnpj_source'        => $cnpjSource
            ];
        }

        return response()->json($result);
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
}
