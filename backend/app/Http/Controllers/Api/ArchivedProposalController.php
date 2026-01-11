<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArchivedProposalRequest;
use App\Models\ArchivedProposal;
use App\Models\Lead;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class ArchivedProposalController extends Controller
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

    // List all archived proposals with filters
    public function index(Request $request)
    {

        $user = $this->getAuthenticatedUser($request);

        $query = ArchivedProposal::where('user_id', $user->id);

        // Filtrer by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtrer by city
        if ($request->filled('cidade')) {
            $query->whereHas('lead', function ($q) use ($request, $user) {
                $q->where('user_id', $user->id)
                    ->whereRaw('LOWER(city) LIKE ?', ['%' . strtolower($request->cidade) . '%']);
            });
        }

        // Filtrar by service
        if ($request->filled('tipoServico')) {
            $query->where('type', $request->tipoServico);
        }

        // Filtrar by date
        if ($request->filled('dataInicio')) {
            $query->whereDate('archived_at', '>=', $request->dataInicio);
        }

        if ($request->filled('dataTermino')) {
            $query->whereDate('archived_at', '<=', $request->dataTermino);
        }

        // Return lead 
        $proposals = $query
            ->with(['lead' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
            ->orderBy('archived_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'proposals' => $proposals
        ]);
    }

    // Add proposals

    public function store(ArchivedProposalRequest $request)
    {
        $user = $this->getAuthenticatedUser($request);

        $data = $request->validated();

        if ($data['status'] === 'Perdido' && empty($data['reason'])) {
            return response()->json([
                'status' => false,
                'message' => 'O motivo é obrigatório quando a proposta é marcada como Perdido.'
            ], 422);
        }

        $lead = Lead::where('id', $data['lead_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $proposal = ArchivedProposal::create([
            'user_id'     => $user->id,
            'lead_id'     => $lead->id,
            'status'      => $data['status'],
            'type'        => $data['type'] ?? null,
            'reason'      => $data['reason'] ?? null,
            'archived_at' => now(),
        ]);

        if ($data['status'] === 'Ganho' || $data['status'] === 'Perdido') {
            $lead->status = 'Cliente fechado';
        }

        $lead->save();

        return response()->json([
            'status' => true,
            'message' => 'Proposta arquivada com sucesso!',
            'proposal' => $proposal
        ], 201);
    }
}
