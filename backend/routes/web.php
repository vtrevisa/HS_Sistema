<?php

// routes/web.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;

// Dashboard (Root URL)
Route::get('/', function () {
    return view('home');
});

// Clients Page
Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');

// More Info for Client
Route::get('/clients/{id}/moreinfo', [ClientController::class, 'moreInfo'])->name('clients.moreinfo');

// Import CSV POST route
Route::post('/clients/import-csv', [ClientController::class, 'importCsv'])->name('clients.importCsv');