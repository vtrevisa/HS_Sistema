<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;


class CompanyController extends Controller
{



    //     public function searchCompanyByAddress(Request $request)
    //     {
    //         $endereco = $request->input('address');

    //         if (!$endereco) {
    //             return response()->json(['erro' => 'Endereço é obrigatório.'], 400);
    //         }

    //         // 1. Search with OpenAI to extract company name
    //         $respostaAI = $this->searchOnOpenAI($endereco);

    //         // 2. Try to extract CNPJ directly from the response
    //         preg_match('/\d{14}/', $respostaAI, $matches);
    //         $cnpjExtraido = $matches[0] ?? null;

    //         if (!$cnpjExtraido) {
    //             // If not extracted, try extracting the company name
    //             $nomeEmpresa = $this->extractCompanyName($respostaAI);

    //             if (!$nomeEmpresa) {
    //                 return response()->json([
    //                     'mensagem' => 'Não foi possível identificar nome nem CNPJ via OpenAI.',
    //                     'resposta_ai' => $respostaAI
    //                 ], 200);
    //             }

    //             // **Opcional**: se você tiver outra API que converta nome → CNPJ, poderia usar aqui.
    //             return response()->json([
    //                 'mensagem' => 'OpenAI retornou nome, mas sem CNPJ.',
    //                 'nome_empresa' => $nomeEmpresa,
    //                 'resposta_ai' => $respostaAI
    //             ], 200);
    //         }

    //         // 3. Consult InfoSimples API by passing CNPJ
    //         $dadosCNPJ = $this->searchCompanyInfoSimples($cnpjExtraido);

    //         if (!$dadosCNPJ) {
    //             return response()->json([
    //                 'mensagem' => 'CNPJ obtido pela OpenAI, mas não encontrado na InfoSimples.',
    //                 'cnpj_extraido' => $cnpjExtraido,
    //                 'resposta_ai' => $respostaAI
    //             ], 404);
    //         }

    //         // 4. Return final response with complete data
    //         return response()->json([
    //             'endereco_informado' => $endereco,
    //             'cnpj_encontrado' => $cnpjExtraido,
    //             'dados_empresa' => $dadosCNPJ,
    //             'resposta_ai' => $respostaAI
    //         ]);
    //     }

    //     private function searchOnOpenAI($endereco)
    //     {
    //         $apiKey = env('OPENAI_API_KEY');

    //         $prompt = <<<EOT
    // Recebi o seguinte endereço: "$endereco".
    // Com base nele, informe o nome provável da empresa localizada naquele ponto e, se souber, o CNPJ com 14 dígitos.
    // EOT;

    //         $response = Http::withHeaders([
    //             'Authorization' => "Bearer $apiKey",
    //             'Content-Type' => 'application/json',
    //         ])->post('https://api.openai.com/v1/chat/completions', [
    //             'model' => 'gpt-4o', // ou gpt-3.5-turbo
    //             'messages' => [
    //                 ['role' => 'user', 'content' => $prompt]
    //             ],
    //             'temperature' => 0.5,
    //         ]);

    //         if ($response->failed()) {
    //             return 'Erro na consulta à OpenAI.';
    //         }

    //         return $response['choices'][0]['message']['content'];
    //     }

    //     private function extractCompanyName($resposta)
    //     {
    //         // Simple regex to capture company name (adjust as needed)
    //         if (preg_match('/empresa\s+(.*?)\s+(Ltda|LTDA|S\.A\.|SA|EIRELI)?/i', $resposta, $matches)) {
    //             // Return “X Ltda” or something similar
    //             return trim($matches[1] . ' ' . ($matches[2] ?? ''));
    //         }

    //         // Plan B: try to get a whole sentence, without a period at the end
    //         $linha = strtok($resposta, "\n.");
    //         return $linha ? trim($linha) : null;
    //     }

    //     private function searchCompanyInfoSimples($cnpj)
    //     {
    //         $token = env('INFOSIMPLES_API_KEY');

    //         $url = "https://api.infosimples.com/consultas/receita-federal/cnpj";

    //         $response = Http::withHeaders([
    //             'Authorization' => "Bearer $token",
    //             'Accept' => 'application/json',
    //         ])->get($url, [
    //             'cnpj' => $cnpj,
    //         ]);

    //         if ($response->failed()) {
    //             return null;
    //         }

    //         return $response->json();
    //     }


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

        // 4️⃣ For each establishment found, get details and consult InfoSimples

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


            // Search in InfoSimples
            $cnpjInfo = "CNPJ não encontrado";
            $cnpjSource = null;

            if ($companyName) {
                $normalizedName = Str::ascii($companyName);
                $normalizedName = preg_replace('/[^A-Za-z0-9 ]/', '', $normalizedName);

                $variations = [
                    $normalizedName,
                    $normalizedName . ' LTDA',
                    $normalizedName . ' ME',
                    $normalizedName . ' EIRELI',
                    $normalizedName . ' SA',
                    implode(' ', array_slice(explode(' ', $normalizedName), 0, 3)),
                    preg_replace('/\b(LTDA|ME|EIRELI|S\/A|SA)\b/i', '', $normalizedName)
                ];

                $variations = array_unique(array_filter($variations));

                foreach ($variations as $var) {

                    $respInfo = Http::timeout(20)->get("https://api.infosimples.com/api/v2/consultas/receita-federal/cnpj", [
                        'token' => $infoSimplesToken,
                        'nome'  => $var
                    ]);

                    if ($respInfo->ok() && isset($respInfo['cnpj'])) {
                        $cnpjInfo = $respInfo->json();
                        $cnpjSource = 'infosimples';
                        break;
                    }
                }
            }

            if ($cnpjInfo === "CNPJ não encontrado" && $googleCseApiKey && $googleCseCx) {
                preg_match('/,\s*([^,]+)\s*-\s*[A-Z]{2}/', $company['formatted_address'], $matches);
                $city = $matches[1] ?? '';


                $query = urlencode("\"$companyName\" \"$city\" CNPJ");
                $respGoogle = Http::get("https://www.googleapis.com/customsearch/v1", [
                    'key' => $googleCseApiKey,
                    'cx'  => $googleCseCx,
                    'q'   => $query,
                    'num' => 5
                ]);

                if ($respGoogle->ok()) {
                    $items = $respGoogle['items'] ?? [];
                    $pattern = '/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/';

                    foreach ($items as $item) {
                        $snippet = $item['snippet'] ?? '';
                        if (preg_match($pattern, $snippet, $matches)) {
                            $cnpjInfo = $matches[0];
                            $cnpjSource = 'google_custom_search';
                            break;
                        }
                    }
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
