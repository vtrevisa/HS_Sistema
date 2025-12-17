<?php

use App\Http\Controllers\Api\AlvaraController;
use App\Http\Controllers\Api\AlvaraLogController;
use App\Http\Controllers\Api\ArchivedProposalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\GoogleSheetsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\CreditPurchaseController;
use App\Http\Controllers\Api\InvoiceController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/auth', [AuthController::class, 'login']); //POST

// Profile 
Route::get('/auth/me', [AuthController::class, 'me']); //GET 
Route::put('/auth/me/password/update', [AuthController::class, 'changePassword']); //PUT 

// Plans
Route::get('/plans', [PlanController::class, 'index']); //GET 
Route::post('/plans/update', [PlanController::class, 'update']); //POST 

// Subscriptions
Route::post('/subscription/start', [SubscriptionController::class, 'start']); //POST

// Buying more credits
Route::post('/credits/purchase', [CreditPurchaseController::class, 'store']); //POST

// Logout
Route::post('/auth/logout', [AuthController::class, 'logout']); //POST

// Alvaras
Route::get('/alvaras', [AlvaraController::class, 'index']); //GET
Route::post('/alvaras/search', [AlvaraController::class, 'search']); //POST
Route::post('/alvaras/release', [AlvaraController::class, 'release']); //POST
Route::get('/alvaras/logs', [AlvaraLogController::class, 'index']); //GET

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
Route::get('/archived-proposals', [ArchivedProposalController::class, 'index']); //GET
Route::post('/archived-proposals/archive', [ArchivedProposalController::class, 'store']); //POST


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

// Invoices
Route::get('/invoices', [InvoiceController::class, 'index']);
Route::post('/invoices/{id}/pay', [InvoiceController::class, 'pay']);

// Webhook
//https://webhook.site/2a2e44de-bd7d-43d3-a394-d816b6ddce6d
Route::post('/whatsapp/webhook', [AutomationController::class, 'receiveWhatsAppWebhook']);

// Route::post('/mock-waseller', function (Illuminate\Http\Request $request) {
//   Log::info('Mock Waseller recebeu:', $request->all());
//   return response()->json([
//     'success' => true,
//     'message' => 'Mensagem simulada enviada com sucesso!'
//   ]);
// });


// Route::group(['middleware' => ['auth:sanctum']], function () {

  

// });
