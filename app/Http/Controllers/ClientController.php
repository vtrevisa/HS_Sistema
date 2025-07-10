<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use Illuminate\Support\Facades\Artisan;

class ClientController extends Controller
{
    //
    public function index()
    {
        // Add import trigger via URL parameter
        if (request()->has('import')) {
            Artisan::call('app:import-clients-from-c-s-v');
            return redirect()->route('clients.index')->with('success', 'Data imported!');
        }

        $clients = Client::all();
        return view('clients.clients', compact('clients'));
    }
}
