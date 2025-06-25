<?php
// filepath: /home/vtrevisa/Documents/prog/PHP/HS_Sistema/get_clients.php

// Function to fetch data from Google Sheets CSV
function getClientsFromGoogleSheet() {
 // Replace with your actual spreadsheet ID
    $csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8Irt_H9cAUWPdxOlDd1SYB7FWsnjIN331Z4ePYtV6FDDewcM0pkxFUWZgh_QMXbD5ibtKi6ZR9wIH/pub?output=csv";
    
    // Initialize cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $csvUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $csvData = curl_exec($ch);
    curl_close($ch);
    
    if ($csvData === false) {
        return [];
    }
    
    // Parse CSV data
    $lines = explode("\n", $csvData);
    $headers = str_getcsv(array_shift($lines));
    $clients = [];
    
    foreach ($lines as $line) {
        if (empty(trim($line))) continue;
        $clientData = str_getcsv($line);
        if (count($clientData) === count($headers)) {
            $clients[] = array_combine($headers, $clientData);
        }
    }
    
    return $clients;
}

// Get clients from Google Sheet
$clients = getClientsFromGoogleSheet();

// Display client cards
foreach ($clients as $client) {
    echo '<div class="client-card">';
    echo '<h3>' . htmlspecialchars($client['Tipo'] ?? '') . '</h3>';
    echo '<p><strong>Licença:</strong> ' . htmlspecialchars($client['Licenca'] ?? '') . '</p>';
    echo '<p><strong>Vigência:</strong> ' . htmlspecialchars($client['Vigência'] ?? '') . '</p>';
    echo '<p><strong>Endereço:</strong> ' . htmlspecialchars($client['Endereço'] ?? '') . ', ' . htmlspecialchars($client['Nº'] ?? '') . '</p>';
    echo '<p><strong>Complemento:</strong> ' . htmlspecialchars($client['Complemento'] ?? '') . '</p>';
    echo '<p><strong>Município:</strong> ' . htmlspecialchars($client['Município'] ?? '') . '</p>';
    echo '<p><strong>Bairro:</strong> ' . htmlspecialchars($client['Bairro'] ?? '') . '</p>';
    echo '<p><strong>Ocupação:</strong> ' . htmlspecialchars($client['Ocupação'] ?? '') . '</p>';
    echo '</div>';
}

if (empty($clients)) {
    echo '<p>No clients found in the Google Sheet.</p>';
}
?>