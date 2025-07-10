@extends('baseLayout')

@section('title', 'Clientes')

@section('page-content')
<div class="container">
    <div class="d-flex justify-content-between mb-4">
        <h1>Clientes</h1>
        <a href="{{ route('clients.index', ['import' => true]) }}" 
           class="btn btn-primary">
           Import CSV
        </a>
    </div>

    <div class="row">
        @foreach ($clients as $client)
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-header bg-{{ $client->tipo === 'VIP' ? 'success' : 'info' }} text-white">
                        {{ $client->tipo }}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Licença: {{ $client->licenca }}</h5>
                        <p class="card-text">
                            <strong>Vigência:</strong> {{ $client->vigencia }}<br>
                            <strong>Endereço:</strong> {{ $client->endereco }}<br>
                            <strong>Complemento:</strong> {{ $client->complemento ?? '-' }}<br>
                            <strong>Município:</strong> {{ $client->municipio }}<br>
                            <strong>Bairro:</strong> {{ $client->bairro }}<br>
                            <strong>Ocupação:</strong> {{ $client->ocupacao }}
                        </p>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</div>
@endsection
