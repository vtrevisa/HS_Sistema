<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArchivedProposalRequest;
use App\Models\ArchivedProposal;
use App\Models\Lead;
use Illuminate\Http\Request;

class ArchivedProposalController extends Controller
{
    // List all archived proposals with filters
    public function index(Request $request)
    {
        $query = ArchivedProposal::query();

        // Filtrer by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtrer by city
        if ($request->filled('cidade')) {
            $query->whereHas('lead', function ($q) use ($request) {
                $q->whereRaw('LOWER(city) LIKE ?', ['%' . strtolower($request->cidade) . '%']);
            });
        }

        // Filtrar by service
        if ($request->filled('tipoServico')) {
            $query->where('type', $request->tipoServico);
        }

        // Filtrar by date
        if ($request->filled('dataInicio')) {
            $query->where('archived_at', '>=', $request->dataInicio);
        }
        if ($request->filled('dataTermino')) {
            $query->where('archived_at', '<=', $request->dataTermino);
        }

        // Return lead 
        $proposals = $query->with('lead')->orderBy('archived_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'proposals' => $proposals
        ]);
    }

    // Add proposals

    public function store(ArchivedProposalRequest $request)
    {
        $data = $request->validated();

        if ($data['status'] === 'Perdido' && empty($data['reason'])) {
            return response()->json([
                'status' => false,
                'message' => 'O motivo é obrigatório quando a proposta é marcada como Perdido.'
            ], 422);
        }


        $proposal = ArchivedProposal::create([
            ...$data,
            'archived_at' => now()
        ]);

        $lead = Lead::find($data['lead_id']);

        if ($data['status'] === 'Ganho') {
            $lead->status = 'Cliente Fechado';
        } else {
            $lead->status = 'Arquivado';
        }

        $lead->save();

        return response()->json([
            'status' => true,
            'message' => 'Proposta arquivada com sucesso!',
            'proposal' => $proposal
        ]);
    }
}
