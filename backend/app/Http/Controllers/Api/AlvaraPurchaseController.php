<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlvaraPurchase;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class AlvaraPurchaseController extends Controller
{

    private function parseAddress(string $fullAddress): array
    {
        $address = '';
        $number = null;
        $district = '';
        $city = '';

        $parts = array_map('trim', explode(',', $fullAddress));

        // Address
        $address = $parts[0] ?? '';

        // Number
        foreach ($parts as $part) {
            if (preg_match('/\b(nº|n°|num|numero)?\s*(\d+)\b/i', $part, $matches)) {
                $number = $matches[2];
                break;
            }
        }

        // District
        foreach ($parts as $part) {
            if (str_contains($part, '-')) {
                [$districtPart, $cityPart] = array_map('trim', explode('-', $part));
                $district = $districtPart ?? '';
                $city = $cityPart ?? '';
                break;
            }
        }

        return [
            'address' => $address,
            'number' => $number,
            'district' => $district,
            'city' => $city,
        ];
    }

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
            ->orderBy('id', 'asc')
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

    public function export(Request $request)
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
            'alvara_ids' => 'required|array|min:1',
            'alvara_ids.*' => 'integer|exists:alvaras_purchases,id',
        ]);


        $alvaras = AlvaraPurchase::where('user_id', $user->id)
            ->whereNull('exported_at')
            ->whereIn('id', $request->alvara_ids)
            ->get();

        if ($alvaras->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'Nenhum alvará disponível para exportação.'
            ], 422);
        }

        DB::beginTransaction();

        try {
            foreach ($alvaras as $alvara) {

                $parsed = $this->parseAddress($alvara->address);

                $company = Company::create([
                    'user_id'   => $user->id,
                    'status'    => 'pendente',
                    'company'   => '',
                    'cep'     => '',
                    'address'   => $parsed['address'],
                    'number'   =>  $parsed['number'],
                    'complement' => '',
                    'state'     => 'SP',
                    'city'      => $alvara->city,
                    'district'  => $parsed['district'],
                    'service'   => $alvara->service,
                    'occupation' => $alvara->occupation,
                    'validity'  => $alvara->validity,
                    'website' => '',
                    'contact' => '',
                    'phone' => '',
                    'cnpj' => '',
                    'email ' => '',
                    'license'   => 'N/A',
                    'origin'    => 'alvara',
                    'origin_id' => $alvara->id,
                ]);

                $alvara->update([
                    'exported_at' => now(),
                    'company_id' => $company->id
                ]);
            }

            DB::commit();

            return response()->json(['status' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
