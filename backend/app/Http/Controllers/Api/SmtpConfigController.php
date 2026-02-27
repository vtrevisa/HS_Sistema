<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmtpConfig;
use App\Services\SmtpSender;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Traits\AuthenticatesWithToken;

class SmtpConfigController extends Controller
{
    protected SmtpSender $smtpSender;
    use AuthenticatesWithToken;

    public function __construct(SmtpSender $smtpSender)
    {
        $this->smtpSender = $smtpSender;
    }

    /**
     * Retorna a configuração atual do usuário (se existir).
     */
    public function show(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        $config = SmtpConfig::where('user_id', $user->id)->first();

        if (!$config) {
            return response()->json(['configured' => false]);
        }

        return response()->json([
            'configured' => true,
            'host' => $config->host,
            'port' => $config->port,
            'encryption' => $config->encryption,
            'username' => $config->username,
            'from_email' => $config->from_email,
            'from_name' => $config->from_name,
        ]);
    }

    /**
     * Salva (ou atualiza) a configuração SMTP.
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        $validator = Validator::make($request-> all(), [
            'host' => 'required|string|max:255',
            'port' => 'required|integer|between:1,65535',
            'encryption' => 'nullable|in:tls,ssl',
            'username' => 'required|email',
            'password'=> 'required|string|min:6',
            'from_email' => 'required|email',
            'from_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        //testar a conexão antes de salvar
        try {
            $this->smtpSender->testConnection($data);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Falha na conexão SMTP. Verifique os dados.',
                'error' => $e->getMessage()
            ], 422);
        }
        Log::info("Configuração SMTP testada com sucesso para o usuário " . $user->id);
        // Salvar configuração (criar ou atualizar)
        SmtpConfig::updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        return response()->json(['message' => 'Configuração salva com sucesso!']);
    }

    /**
     * Remove a configuração SMTP do usuário.
     */
    public function destroy(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        SmtpConfig::where('user_id', $user->id)->delete();
        return response()->json(['message' => 'Configuração Removida.']);
    }

    /**
     * Testa a conexão sem salvar (útil para o frontend validar antes de enviar).
     */
    public function test(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'host' => 'required|string|max:255',
            'port' => 'required|integer|between:1,65535',
            'encryption' => 'nullable|in:tls,ssl',
            'username' => 'required|email',
            'password'=> 'required|string|min:6', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        Log::info("Testando conexão SMTP com dados:", $validator->validated());

        try {
            $this->smtpSender->testConnection($validator->validated());
            return response()->json(['message' => 'Conexão bem-sucedida!']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}