<?php
// filepath: /home/vtrevisa/Documents/prog/PHP/HS_Sistema/add_client.php

// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $notes = $_POST['notes'] ?? '';

    // Validate input
    if (empty($name) || empty($email) || empty($phone)) {
        echo "All fields except 'Notes' are required.";
        exit;
    }

    // Save client data (for now, save to a file)
    $clientData = [
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'notes' => $notes
    ];

    $clientsFile = __DIR__ . '/clients.json';

    // Load existing clients
    $clients = [];
    if (file_exists($clientsFile)) {
        $clients = json_decode(file_get_contents($clientsFile), true) ?? [];
    }

    // Add new client
    $clients[] = $clientData;

    // Save back to the file
    file_put_contents($clientsFile, json_encode($clients, JSON_PRETTY_PRINT));

    // Redirect back to the main page
    header('Location: index.php');
    exit;
}
?>