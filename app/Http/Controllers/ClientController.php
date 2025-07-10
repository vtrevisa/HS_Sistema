<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use Illuminate\Support\Facades\Artisan;

class ClientController extends Controller
{
    //
    public function index()
    {
        // Add import trigger via URL parameter
        if (request()->has('import')) {
            Artisan::call('app:import-clients-from-c-s-v');
            return redirect()->route('clients.index')->with('success', 'Data imported!');
        }

        $clients = Client::all();
        return view('clients.clients', compact('clients'));
    }

    public function moreInfo($id)
    {
        $client = Client::findOrFail($id);
        $address = $client->endereco;
        // Dummy scraping logic (replace with real scraper calls)
        $dadosGovResult = app('App\\Services\\ScraperService')->fetchHtml('https://dados.gov.br/?q=' . urlencode($address));
        $jucespResult = app('App\\Services\\ScraperService')->fetchHtml('https://www.jucesponline.sp.gov.br/BuscaAvancada.aspx?criterio=' . urlencode($address));
        return view('clients.moreinfo', compact('address', 'dadosGovResult', 'jucespResult'));
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt',
        ]);
        $file = $request->file('csv_file');
        $path = $file->getRealPath();
        // Use Laravel's built-in CSV reading or your own logic
        $header = null;
        $data = [];
        if (($handle = fopen($path, 'r')) !== false) {
            while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                if (!$header) {
                    $header = $row;
                } else {
                    $data[] = array_combine($header, $row);
                }
            }
            fclose($handle);
        }
        // Normalize header keys to match DB columns
        $header = array_map(function($h) {
            return strtolower(trim(str_replace([' ', 'ç', 'ã', 'í', 'é', 'ê', 'ô', 'ú', 'á', 'ó', 'â', 'ê', 'í', 'ó', 'ú', 'à', 'è', 'ì', 'ò', 'ù', 'ü', 'ñ'],
                ['_', 'c', 'a', 'i', 'e', 'e', 'o', 'u', 'a', 'o', 'a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'u', 'u', 'n'], $h)));
        }, $header);
        // Refresh DB: delete all and insert new
        \App\Models\Client::truncate();
        foreach ($data as $row) {
            // Map CSV keys to DB columns
            $mapped = [
                'tipo' => $row['tipo'] ?? $row['Tipo'] ?? null,
                'licenca' => $row['licenca'] ?? $row['Licenca'] ?? null,
                'vigencia' => $row['vigencia'] ?? $row['Vigência'] ?? null,
                'endereco' => $row['endereco'] ?? $row['Endereço'] ?? null,
                'complemento' => $row['complemento'] ?? $row['Complemento'] ?? null,
                'municipio' => $row['municipio'] ?? $row['Município'] ?? null,
                'bairro' => $row['bairro'] ?? $row['Bairro'] ?? null,
                'ocupacao' => $row['ocupacao'] ?? $row['Ocupação'] ?? null,
            ];
            // Only insert if required fields are present
            if (!empty($mapped['tipo']) && !empty($mapped['licenca'])) {
                \App\Models\Client::create($mapped);
            }
        }
        return redirect()->route('clients.index')->with('success', 'Clientes importados com sucesso!');
    }
}
