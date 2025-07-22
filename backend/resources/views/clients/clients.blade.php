@extends('baseLayout')

@section('title', 'Clientes')

@section('page-content')
<div class="container">
    <div class="d-flex justify-content-between mb-4">
        <h1>Clientes</h1>
        <!-- Import CSV Button triggers modal -->
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#importCsvModal">
            Import CSV
        </button>
    </div>

    <!-- Import CSV Modal -->
    <div class="modal fade" id="importCsvModal" tabindex="-1" aria-labelledby="importCsvModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form method="POST" action="{{ route('clients.importCsv') }}" enctype="multipart/form-data">
            @csrf
            <div class="modal-header">
              <h5 class="modal-title" id="importCsvModalLabel">Importar Clientes via CSV</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="file" name="csv_file" class="form-control" accept=".csv" required />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Importar</button>
            </div>
          </form>
        </div>
      </div>
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
                            <strong>Endereço:</strong> {{ $client->endereco }}{{ $client->numero ? ', ' . $client->numero : '' }}<br>
                            <strong>Complemento:</strong> {{ $client->complemento ?? '-' }}<br>
                            <strong>Município:</strong> {{ $client->municipio }}<br>
                            <strong>Bairro:</strong> {{ $client->bairro }}<br>
                            <strong>Ocupação:</strong> {{ $client->ocupacao }}
                        </p>
                    </div>
                    <div class="card-footer text-end">
                        <a href="{{ route('clients.moreinfo', $client->id) }}" class="btn btn-info">Mais Info</a>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</div>
@endsection
