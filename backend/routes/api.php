<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\OpenAIController;
use App\Http\Controllers\Api\UserController;

use Illuminate\Support\Facades\Route;

// Auth
Route::post('/auth', [AuthController::class, 'login']); //POST

// Profile 
Route::get('/auth/me', [AuthController::class, 'me']); //GET 

// Logout
Route::post('/auth/logout', [AuthController::class, 'logout']); //POST

// Leads
Route::get('/leads', [LeadController::class, 'index']); //GET
Route::get('/leads/{lead}', [LeadController::class, 'show']); //GET
Route::post('/leads', [LeadController::class, 'store']); //POST
Route::put('/leads/{lead}', [LeadController::class, 'update']); //PUT
Route::delete('/leads/{lead}', [LeadController::class, 'destroy']); //DELETE



// Companies
Route::get('/companies', [CompanyController::class, 'index']); //GET
Route::post('/companies/search/address', [CompanyController::class, 'searchCompanyByAddress']);


// Users
Route::post('/users', [UserController::class, 'store']); //POST

// Route::group(['middleware' => ['auth:sanctum']], function () {

//     // Users
//     Route::get('/users', [UserController::class, 'index']); //GET
//     Route::get('/users/{user}', [UserController::class, 'show']); //GET
//     Route::post('/users', [UserController::class, 'store']); //POST
//     Route::put('/users/{user}', [UserController::class, 'update']); //PUT
//     Route::delete('/users/{user}', [UserController::class, 'destroy']); //DELETE


// });
