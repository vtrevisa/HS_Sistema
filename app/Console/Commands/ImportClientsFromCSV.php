<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;

class ImportClientsFromCSV extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'app:import-clients-from-c-s-v';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Command description';

	/**
	 * Execute the console command.
	 */
	public function handle()
	{
		$filePath = storage_path('app/clients.csv');
		
		if (!file_exists($filePath)) {
			$this->error("CSV file not found at: $filePath");
			return;
		}

		$file = fopen($filePath, 'r');
		$header = fgetcsv($file); // Get header row
		$header = array_map('strtolower', $header); // Normalize header to lowercase

		while ($row = fgetcsv($file)) {
			$rowAssoc = array_combine($header, $row);
			Client::updateOrCreate(
				['licenca' => $rowAssoc['licenca']],
				[
					'tipo'        => $rowAssoc['tipo'],
					'vigencia'    => $rowAssoc['vigência'], // Note: CSV header is 'Vigência'
					'endereco'    => $rowAssoc['endereço'], // Note: CSV header is 'Endereço'
					'complemento' => $rowAssoc['complemento'] ?? null,
					'municipio'   => $rowAssoc['município'], // Note: CSV header is 'Município'
					'bairro'      => $rowAssoc['bairro'],
					'ocupacao'    => $rowAssoc['ocupação'], // Note: CSV header is 'Ocupação'
				]
			);
		}

		fclose($file);
		$this->info('Clients imported successfully!');
	}
}
