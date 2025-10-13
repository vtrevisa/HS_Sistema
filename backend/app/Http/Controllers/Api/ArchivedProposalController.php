<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArchivedProposal;
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
}
