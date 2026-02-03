<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeadRequest;
use App\Models\Lead;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class LeadController extends Controller
{


    private function getAuthenticatedUser(Request $request)
    {
        $token = $request->bearerToken() ?? $request->cookie('auth-token');


        if (!$token) {
            throw new UnauthorizedHttpException('', 'Token de autenticação é inválido ou não fornecido.');
        }

        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            throw new UnauthorizedHttpException('', 'Token de autenticação é inválido ou expirado.');
        }

        return $accessToken->tokenable;
    }


    // Show all leads from db

    public function index(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        $result = $request->query('result');

        $leads = Lead::where('user_id', $user->id)
            ->with('archivedProposal')
            ->when($result === 'Ganho', function ($query) {
                $query->whereHas('archivedProposal', function ($q) {
                    $q->where('result', 'Ganho');
                });
            })
            ->when($result === 'Perdido', function ($query) {
                $query->whereHas('archivedProposal', function ($q) {
                    $q->where('result', 'Perdido');
                });
            })
            ->orderBy('id', 'DESC')
            ->get();

        return response()->json([
            'status' => true,
            'leads' => $leads,
        ], 200);
    }


    // Show lead from db

    public function show(Request $request, Lead $lead): JsonResponse
    {

        $user = $this->getAuthenticatedUser($request);


        if (!$user || $lead->user_id !== $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Acesso não autorizado.',
            ], 403);
        }

        return response()->json([
            'status' => true,
            'lead' => $lead,
        ], 200);
    }

    // Add attachments to db

    public function uploadAttachments(Request $request, Lead $lead): JsonResponse
    {


        $user = $this->getAuthenticatedUser($request);

        if ($lead->user_id !== $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Acesso não autorizado.',
            ], 403);
        }


        try {
            $attachments = $lead->attachments ?? [];

            if ($request->hasFile('attachments')) {
                $files = $request->file('attachments');
                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $file) {
                    // Save on storage/public/leads
                    $path = $file->store('leads', 'public');

                    $attachments[] = [
                        'name' => $file->getClientOriginalName(),
                        'url' => url("storage/leads/" . basename($path)),
                        'uploaded_at' => now()->toDateTimeString(),
                    ];
                }

                // Atualiza somente attachments
                $lead->attachments = $attachments;
                $lead->save();
            }

            return response()->json([
                'status' => true,
                'lead' => $lead,
                'attachments' => $attachments,
                'message' => 'Arquivos anexados com sucesso!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Erro ao anexar arquivos!',
                'error' => $e->getMessage()
            ], 400);
        }
    }


    // Add lead to db

    public function store(LeadRequest $request): JsonResponse
    {

        $user = $this->getAuthenticatedUser($request);

        // Init transaction on DB
        DB::beginTransaction();

        try {

            // Add lead on DB

            $lead = Lead::create([
                'user_id' => $user->id,
                'company' => strtoupper($request->input('company', '')),
                'service' => strtoupper($request->input('service', '')),
                'license' => $request->input('license', ''),
                'validity' => $request->input('validity', ''),
                'expiration_date' => $request->input('expiration_date', ''),
                'next_action' => $request->input('next_action', ''),
                'service_value' => $request->input('service_value', ''),
                'cep' => $request->input('cep', ''),
                'address' => ucwords(strtolower($request->input('address', ''))),
                'number' => $request->input('number', ''),
                'complement' => ucwords(strtolower($request->input('complement', ''))),
                'city' => ucwords(strtolower($request->input('city', ''))),
                'district' => ucwords(strtolower($request->input('district', ''))),
                'occupation' => $request->input('occupation', ''),
                'status' => $request->input('status', ''),
                'cnpj' => $request->input('cnpj', ''),
                'website' => $request->input('website', ''),
                'contact' => $request->input('contact', ''),
                'phone' => $request->input('phone', ''),
                'email' => $request->input('email', ''),

            ]);

            // Success Operation
            DB::commit();

            return response()->json([
                'status' => true,
                'lead' => $lead,
                'user' => $user,
                'message' => "Lead cadastrado com sucesso!",
            ], 201);
        } catch (Exception $e) {

            // Init rollback transaction on DB
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => "Lead não cadastrado!",
                'error' => $e->getMessage()
            ], 400);
        }
    }

    // Edit lead from db

    public function update(LeadRequest $request, Lead $lead): JsonResponse
    {

        $user = $this->getAuthenticatedUser($request);

        if (!$user || $lead->user_id !== $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Acesso não autorizado.',
            ], 403);
        }

        // Init transaction on DB
        DB::beginTransaction();

        try {

            // Get Lead Status

            $oldStatus = $lead->status;
            $newStatus = $request->input('status', '');

            // Edit lead on DB

            $leadData = [
                'company' => strtoupper($request->input('company', '')),
                'service' => strtoupper($request->input('service', '')),
                'license' => $request->input('license', ''),
                'validity' => $request->input('validity', ''),
                'expiration_date' => $request->input('expiration_date', ''),
                'next_action' => $request->input('next_action', ''),
                'service_value' => $request->input('service_value', ''),
                'cep' => $request->input('cep', ''),
                'address' => ucwords(strtolower($request->input('address', ''))),
                'number' => $request->input('number', ''),
                'complement' => ucwords(strtolower($request->input('complement', ''))),
                'city' => ucwords(strtolower($request->input('city', ''))),
                'district' => ucwords(strtolower($request->input('district', ''))),
                'occupation' => $request->input('occupation', ''),
                'status' => $newStatus,
                'cnpj' => $request->input('cnpj', ''),
                'website' => $request->input('website', ''),
                'contact' => $request->input('contact', ''),
                'phone' => $request->input('phone', ''),
                'email' => $request->input('email', ''),
            ];

            // Deals with attachments
            $existingAttachments = $lead->attachments ?? []; // Get the current attachments.

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('leads'); // storage/app/leads
                    $existingAttachments[] = [
                        'name' => $file->getClientOriginalName(),
                        'url' => url("storage/{$path}"), // public link for viewing
                        'uploaded_at' => now()->toDateTimeString(),
                    ];
                }
            }

            // Update the attachments field.
            $leadData['attachments'] = $existingAttachments;

            // Save on DB
            $lead->update($leadData);

            // Refresh lead status
            $lead->refresh();

            info("🔄 Status antigo: {$oldStatus} | Status novo: {$lead->status}");

            if ($oldStatus !== $lead->status) {
                info("🚀 Disparando automação...");
                app(\App\Http\Controllers\Api\AutomationController::class)
                    ->handleStatusAutomation($lead);
            } else {
                info("ℹ Nenhuma automação executada. Status não mudou.");
            }

            // Success Operation
            DB::commit();

            return response()->json([
                'status' => true,
                'lead' => $lead,
                'message' => "Lead editado com sucesso!",
            ], 200);
        } catch (Exception $e) {
            // Init rollback transaction on DB
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => "Lead não editado!",
                'error' => $e->getMessage()
            ], 400);
        }
    }

    // Delete attachments to db

    public function deleteAttachment(Request $request, Lead $lead, int $index)
    {


        $user = $this->getAuthenticatedUser($request);

        if ($lead->user_id !== $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Acesso não autorizado.',
            ], 403);
        }


        try {
            $attachments = $lead->attachments ?? [];

            if (!isset($attachments[$index])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Anexo não encontrado.'
                ], 404);
            }

            $attachment = $attachments[$index];

            // Extract the file path (e.g., storage/leads/file.pdf)
            $path = str_replace(url('storage') . '/', '', $attachment['url']);

            // Remove the physical file
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }

            // Remove from array and reindex.
            array_splice($attachments, $index, 1);

            // Update on DB
            $lead->update(['attachments' => $attachments]);

            return response()->json([
                'status' => true,
                'attachments' => $attachments,
                'message' => 'Anexo removido com sucesso!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Erro ao remover o anexo.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    // Delete lead from db

    public function destroy(Request $request, Lead $lead): JsonResponse
    {

        $user = $this->getAuthenticatedUser($request);

        if (!$user || $lead->user_id !== $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Acesso não autorizado.',
            ], 403);
        }

        try {

            // Delete lead on DB
            $lead->delete();

            return response()->json([
                'status' => true,
                'lead' => $lead,
                'message' => "Lead deletado com sucesso!",
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => "Lead não apagado!",
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
