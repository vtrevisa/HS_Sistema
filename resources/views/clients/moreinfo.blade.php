@extends('baseLayout')

@section('title', 'Mais Informações do Cliente')

@section('page-content')
<div class="container">
    <h1>Mais Informações para: {{ $address }}</h1>
    <hr>
    <h3>Resultados de <a href="https://dados.gov.br/" target="_blank">dados.gov.br</a></h3>
    <pre>{{ $dadosGovResult ?? 'Nenhum dado encontrado.' }}</pre>
    <h3>Resultados de <a href="https://www.jucesponline.sp.gov.br/" target="_blank">JUCESP Online</a></h3>
    <pre>{{ $jucespResult ?? 'Nenhum dado encontrado.' }}</pre>
    <a href="{{ route('clients.index') }}" class="btn btn-secondary mt-3">Voltar</a>
</div>
@endsection
