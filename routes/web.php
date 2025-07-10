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