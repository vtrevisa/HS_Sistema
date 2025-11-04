<?php

use App\Http\Controllers\Api\AlvaraController;
use App\Http\Controllers\Api\ArchivedProposalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\GoogleSheetsController;
use App\Http\Controllers\Api\UserController;

use Illuminate\Support\Facades\Route;

// Auth
Route::post('/auth', [AuthController::class, 'login']); //POST

// Profile 
Route::get('/auth/me', [AuthController::class, 'me']); //GET 

// Logout
Route::post('/auth/logout', [AuthController::class, 'logout']); //POST

// Alvaras
Route::get('/alvaras', [AlvaraController::class, 'index']); //GET
Route::post('/alvaras/search', [AlvaraController::class, 'search']); //POST

// Leads
Route::get('/leads', [LeadController::class, 'index']); //GET
Route::get('/leads/{lead}', [LeadController::class, 'show']); //GET
Route::post('/leads', [LeadController::class, 'store']); //POST
Route::post('/leads/{lead}/attachments', [LeadController::class, 'uploadAttachments']); //POST
Route::put('/leads/{lead}', [LeadController::class, 'update']); //PUT
Route::delete('/leads/{lead}', [LeadController::class, 'destroy']); //DELETE
Route::delete('/leads/{lead}/attachments/{index}', [LeadController::class, 'deleteAttachment']); //DELETE

// Companies
Route::get('/companies', [CompanyController::class, 'index']); //GET
Route::get('/companies/{company}', [CompanyController::class, 'show']); //GET
Route::post('/companies', [CompanyController::class, 'store']); //POST
Route::put('/companies/{company}', [CompanyController::class, 'update']); //PUT
Route::delete('/companies/{company}', [CompanyController::class, 'destroy']); //DELETE
Route::post('/companies/search/address', [CompanyController::class, 'searchCompanyByAddress']); //POST
Route::post('/companies/search/cnpj', [CompanyController::class, 'searchCompanyByCnpj']); //POST

// Proposals
Route::get('/archived-proposals', [ArchivedProposalController::class, 'index']);


// Manage Sheets
Route::get('/sheets/import', [GoogleSheetsController::class, 'importSheet']); //GET
Route::get('/sheets/import/{sheetName}', [GoogleSheetsController::class, 'importCitySheet']); //GET
Route::get('/sheets/update', [GoogleSheetsController::class, 'updateSheet']); //GET
Route::get('/sheets/list', [GoogleSheetsController::class, 'listSheets']); //GET
Route::get('/sheets/{sheetName}', [GoogleSheetsController::class, 'getSheetData']); //GET

// Users
Route::get('/users', [UserController::class, 'index']); //GET
Route::get('/users/{user}', [UserController::class, 'show']); //GET
Route::post('/users', [UserController::class, 'store']); //POST
Route::put('/users/{user}', [UserController::class, 'update']); //PUT
Route::delete('/users/{user}', [UserController::class, 'destroy']); //DELETE


// Route::group(['middleware' => ['auth:sanctum']], function () {

  

// });
