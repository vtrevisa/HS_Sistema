<?php

// routes/web.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Dashboard (Root URL)
Route::get('/', function () {
    return redirect()->route('login');
});


// Login page
Route::get('/login', [\App\Http\Controllers\AuthController::class, 'showLogin'])->name('login');

// Handle login POST
Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

// Dashboard page (after login)
Route::get('/dashboard', [\App\Http\Controllers\AuthController::class, 'dashboard'])->name('dashboard');

// Logout
Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout'])->name('logout');
