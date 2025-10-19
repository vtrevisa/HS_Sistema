<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Google\Client;
use Google\Service\Sheets;
use Illuminate\Support\Facades\DB;

class GoogleSheetsController extends Controller
{
    private $spreadsheetId = '1KcBBmNca4kBos1rGjhUEY0CxQ7kv3CLcdJgr4TCjMGY';

    private function getService()
    {
        $client = new Client();
        $client->setApplicationName('Laravel Google Sheets');
        $client->setScopes([Sheets::SPREADSHEETS_READONLY]);
        $client->setAuthConfig(storage_path('app/google/credentials.json'));
        return new Sheets($client);
    }

    /**
     * Importa todas as abas da planilha para a tabela alvaras
     */
    public function importSheet()
    {
        $service = $this->getService();
        $spreadsheet = $service->spreadsheets->get($this->spreadsheetId);
        $tabs = $spreadsheet->getSheets();

        $validMonths = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        $year = 2025; // ano fixo

        // Monta todos os ranges das abas
        $ranges = [];
        foreach ($tabs as $tab) {
            $city = $tab->getProperties()->getTitle();
            $escapedCity = str_replace("'", "''", $city);
            $ranges[] = "'$escapedCity'!A1:Z1000";
        }

        try {
            // Faz uma requisição batch para todas as abas de uma vez
            $batchResponse = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
        } catch (\Exception $e) {
            return response()->json(['error' => "Erro ao acessar as abas: " . $e->getMessage()], 400);
        }

        $valueRanges = $batchResponse->getValueRanges();
        $insertSummary = [];

        foreach ($valueRanges as $i => $valueRange) {
            $city = $tabs[$i]->getProperties()->getTitle();
            $values = $valueRange->getValues();

            if (empty($values) || count($values) < 2) {
                $insertSummary[$city] = 0;
                continue;
            }

            $indexMap = [
                'month' => 0,
                'avcb'  => 1,
                'clcb'  => 2,
            ];

            $inserted = 0;

            for ($j = 1; $j < count($values); $j++) {
                $row = $values[$j];

                $month = strtolower($row[$indexMap['month']] ?? '');

                // Ignora linhas inválidas
                if (!$month || $month === 'total ano' || !in_array($month, $validMonths)) continue;

                $avcb = isset($row[$indexMap['avcb']]) ? (int)$row[$indexMap['avcb']] : 0;
                $clcb = isset($row[$indexMap['clcb']]) ? (int)$row[$indexMap['clcb']] : 0;

                // Evita duplicidade
                $exists = DB::table('alvaras')
                    ->where('city', $city)
                    ->where('year', $year)
                    ->where('month', $month)
                    ->exists();

                if ($exists) continue;

                DB::table('alvaras')->insert([
                    'city'  => $city,
                    'year'  => $year,
                    'month' => $month,
                    'avcb'  => $avcb,
                    'clcb'  => $clcb,
                ]);

                $inserted++;
            }

            $insertSummary[$city] = $inserted;
        }

        return response()->json([
            'message' => 'Importação de todas as abas concluída!',
            'details' => $insertSummary
        ]);

        //SELECT city, SUM(avcb) AS total_avcb, SUM(clcb) AS total_clcb, SUM(avcb + clcb) AS total_per_month FROM alvaras GROUP BY city ORDER BY city;
        //SELECT city, SUM(avcb) AS total_avcb, SUM(clcb) AS total_clcb, SUM(avcb + clcb) AS total_per_month FROM alvaras WHERE city = "São Paulo";
    }


    public function updateSheet()
    {
        $service = $this->getService();
        $spreadsheet = $service->spreadsheets->get($this->spreadsheetId);
        $tabs = $spreadsheet->getSheets();

        $validMonths = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

        // Monta todos os ranges das abas
        $ranges = [];
        foreach ($tabs as $tab) {
            $city = $tab->getProperties()->getTitle();
            $escapedCity = str_replace("'", "''", $city);
            $ranges[] = "'$escapedCity'!A1:Z1000";
        }

        try {
            // Batch request para todas as abas
            $batchResponse = $service->spreadsheets_values->batchGet($this->spreadsheetId, ['ranges' => $ranges]);
        } catch (\Exception $e) {
            return response()->json(['error' => "Erro ao acessar as abas: " . $e->getMessage()], 400);
        }

        $valueRanges = $batchResponse->getValueRanges();
        $updateSummary = [];

        foreach ($valueRanges as $i => $valueRange) {
            $city = $tabs[$i]->getProperties()->getTitle();
            $values = $valueRange->getValues();

            if (empty($values) || count($values) < 2) {
                $updateSummary[$city] = ['inserted' => 0, 'updated' => 0];
                continue;
            }

            $indexMap = [
                'month' => 0,
                'avcb'  => 1,
                'clcb'  => 2,
            ];

            $inserted = 0;
            $updated = 0;
            $currentYear = 2025; // pode adaptar para detectar múltiplos anos, se quiser

            for ($j = 1; $j < count($values); $j++) {
                $row = $values[$j];
                $firstCol = trim(strtolower($row[$indexMap['month']] ?? ''));

                // Ignora linhas de total ou inválidas
                if (!$firstCol || stripos($firstCol, 'total') !== false || $firstCol === 'voltar') {
                    continue;
                }

                // Detecta se a linha representa um ano (ex: 2025)
                if (is_numeric($firstCol) && strlen($firstCol) === 4) {
                    $currentYear = (int)$firstCol;
                    continue;
                }

                // Só processa meses válidos
                if (!in_array($firstCol, $validMonths)) continue;

                $avcb = isset($row[$indexMap['avcb']]) ? (int)$row[$indexMap['avcb']] : 0;
                $clcb = isset($row[$indexMap['clcb']]) ? (int)$row[$indexMap['clcb']] : 0;

                // Busca registro existente
                $existing = DB::table('alvaras')
                    ->where('city', $city)
                    ->where('year', $currentYear)
                    ->where('month', $firstCol)
                    ->first();

                if ($existing) {
                    // Atualiza somente se houver diferença
                    if ($existing->avcb != $avcb || $existing->clcb != $clcb) {
                        DB::table('alvaras')
                            ->where('id', $existing->id)
                            ->update([
                                'avcb' => $avcb,
                                'clcb' => $clcb,
                            ]);
                        $updated++;
                    }
                } else {
                    // Insere registro novo
                    DB::table('alvaras')->insert([
                        'city'  => $city,
                        'year'  => $currentYear,
                        'month' => $firstCol,
                        'avcb'  => $avcb,
                        'clcb'  => $clcb,
                    ]);
                    $inserted++;
                }
            }

            $updateSummary[$city] = [
                'inserted' => $inserted,
                'updated'  => $updated,
            ];
        }

        return response()->json([
            'message' => 'Atualização de todas as abas concluída!',
            'details' => $updateSummary
        ]);
    }

    /**
     * Lista todas as abas da planilha
     */
    public function listSheets()
    {
        try {
            $service = $this->getService();
            $spreadsheet = $service->spreadsheets->get($this->spreadsheetId);
            $sheets = $spreadsheet->getSheets();

            $result = [];
            foreach ($sheets as $sheet) {
                $result[] = [
                    'name' => $sheet->getProperties()->getTitle(),
                    'gid'  => $sheet->getProperties()->getSheetId()
                ];
            }

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function importCitySheet($sheetName)
    {
        $service = $this->getService();
        $escapedSheet = str_replace("'", "''", $sheetName);
        $range = "'$escapedSheet'!A1:Z1000";

        try {
            $response = $service->spreadsheets_values->get($this->spreadsheetId, $range);
        } catch (\Exception $e) {
            return response()->json(['error' => "Erro ao acessar a aba '$sheetName': " . $e->getMessage()], 400);
        }

        $values = $response->getValues();
        if (empty($values) || count($values) < 2) {
            return response()->json(['error' => "Aba '$sheetName' está vazia ou não tem dados suficientes"], 400);
        }

        // Cabeçalho da aba
        $header = $values[0];

        // Mapear colunas
        $indexMap = [
            'month' => 0,
            'avcb'  => 1,
            'clcb'  => 2,
            'total' => 3,
        ];

        $year = 2025; // ano fixo
        $inserted = 0;

        // Meses válidos do ENUM
        $validMonths = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

        for ($i = 1; $i < count($values); $i++) {
            $row = $values[$i];

            $month = strtolower($row[$indexMap['month']] ?? '');

            // Ignora linhas inválidas ou "Total Ano"
            if (!$month || $month === 'total ano' || !in_array($month, $validMonths)) {
                continue;
            }

            $avcb = isset($row[$indexMap['avcb']]) ? (int)$row[$indexMap['avcb']] : 0;
            $clcb = isset($row[$indexMap['clcb']]) ? (int)$row[$indexMap['clcb']] : 0;

            // Evita duplicidade
            $exists = DB::table('alvaras')
                ->where('city', $sheetName)
                ->where('year', $year)
                ->where('month', $month)
                ->exists();

            if ($exists) continue;

            // Inserção no banco
            DB::table('alvaras')->insert([
                'city'  => $sheetName,
                'year'  => $year,
                'month' => $month,
                'avcb'  => $avcb,
                'clcb'  => $clcb,
            ]);

            $inserted++;
        }

        return response()->json([
            'message' => "Importação da cidade '$sheetName' concluída!",
            'rows_inserted' => $inserted
        ]);
    }

    /**
     * Retorna os dados de uma aba específica
     */
    public function getSheetData($sheetName)
    {
        try {
            $service = $this->getService();

            // Valida se a aba existe
            $spreadsheet = $service->spreadsheets->get($this->spreadsheetId);
            $sheets = array_map(fn($s) => $s->getProperties()->getTitle(), $spreadsheet->getSheets());

            if (!in_array($sheetName, $sheets)) {
                return response()->json(['error' => "Aba '$sheetName' não encontrada"], 400);
            }

            $escapedSheet = str_replace("'", "''", $sheetName);
            $range = "'$escapedSheet'!A1:Z1000";

            $response = $service->spreadsheets_values->get($this->spreadsheetId, $range);
            $values = $response->getValues();

            return response()->json($values);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
