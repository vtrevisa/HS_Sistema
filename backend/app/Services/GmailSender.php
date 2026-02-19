<?php

namespace App\Services;

use App\Models\IntegrationToken;
use Google\Client as GoogleClient;
use Google\Service\Gmail;
use Google\Service\Gmail\Message;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Exception;

class GmailSender
{
    /**
     * Envia e-mail usando a conta Gmail do usuário.
     *
     * @param int $userId
     * @param string $to
     * @param string $subject
     * @param string $htmlBody
     * @return bool
     * @throws Exception
     */
    public function send(int $userId, string $to, string $subject, string $htmlBody): bool
    {
        // 1. Buscar token do usuário
        $token = IntegrationToken::where('user_id', $userId)
            ->where('provider', 'gmail')
            ->first();

        if (!$token) {
            throw new Exception('Nenhuma conta Gmail conectada.');
        }

        // 2. Decriptografar tokens
        try {
            $accessToken = Crypt::decryptString($token->access_token);
            $refreshToken = $token->refresh_token 
                ? Crypt::decryptString($token->refresh_token) 
                : null;
        } catch (\Exception $e) {
            throw new Exception('Erro ao decriptografar tokens. Reconecte a conta.');
        }

        // 3. Configurar cliente Google
        $client = new GoogleClient();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setAccessToken([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => $token->expires_at->diffInSeconds(now()),
        ]);

        // 4. Verificar expiração e renovar se necessário
        if ($client->isAccessTokenExpired()) {
            if (!$refreshToken) {
                throw new Exception('Token expirado e sem refresh_token. Reconecte a conta.');
            }

            Log::info("Token Gmail expirado para usuário {$userId}. Renovando...");
            $newTokens = $this->refreshAccessToken($refreshToken);

            // Atualizar no banco
            $token->access_token = Crypt::encryptString($newTokens['access_token']);
            // O Google NÃO envia novo refresh_token na renovação, então mantemos o existente
            $token->expires_at = now()->addSeconds($newTokens['expires_in']);
            $token->save();

            // Atualizar cliente com novo token
            $client->setAccessToken($newTokens['access_token']);
            Log::info("Token Gmail renovado com sucesso para usuário {$userId}");
        }

        // 5. Construir mensagem MIME e enviar via Gmail API
        $gmail = new Gmail($client);

        // Montar a mensagem no formato RFC 2822
        $message = new Message();

        $strMessage = "From: {$token->email}\r\n";
        $strMessage .= "To: {$to}\r\n";
        $strMessage .= "Subject: =?utf-8?B?" . base64_encode($subject) . "?=\r\n";
        $strMessage .= "MIME-Version: 1.0\r\n";
        $strMessage .= "Content-Type: text/html; charset=utf-8\r\n";
        $strMessage .= "\r\n" . $htmlBody;

        // Codificar em base64url
        $encodedMessage = rtrim(strtr(base64_encode($strMessage), '+/', '-_'), '=');
        $message->setRaw($encodedMessage);

        try {
            $gmail->users_messages->send('me', $message);
            Log::info("E-mail enviado via Gmail para {$to} (usuário {$userId})");
            return true;
        } catch (\Exception $e) {
            Log::error("Falha no envio Gmail: " . $e->getMessage());
            throw new Exception('Falha no envio do e-mail: ' . $e->getMessage());
        }
    }

    /**
     * Renova access_token usando refresh_token (chamada direta à API Google).
     *
     * @param string $refreshToken
     * @return array
     * @throws Exception
     */
    private function refreshAccessToken(string $refreshToken): array
    {
        $client = new GoogleClient();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));

        try {
            $newToken = $client->refreshToken($refreshToken);
            return [
                'access_token' => $newToken['access_token'],
                'expires_in' => $newToken['expires_in'],
            ];
        } catch (\Exception $e) {
            throw new Exception('Falha ao renovar token Gmail: ' . $e->getMessage());
        }
    }

    /**
     * Verifica se o usuário tem uma conta Gmail válida conectada.
     *
     * @param int $userId
     * @return bool
     */
    public function isConnected(int $userId): bool
    {
        $token = IntegrationToken::where('user_id', $userId)
            ->where('provider', 'gmail')
            ->first();

        if (!$token) {
            return false;
        }

        // Se expirado e sem refresh_token, considera desconectado
        if ($token->expires_at->isPast() && !$token->refresh_token) {
            return false;
        }

        return true;
    }

    /**
     * Desconecta a conta Gmail do usuário.
     *
     * @param int $userId
     * @return bool
     */
    public function disconnect(int $userId): bool
    {
        return IntegrationToken::where('user_id', $userId)
            ->where('provider', 'gmail')
            ->delete();
    }
}