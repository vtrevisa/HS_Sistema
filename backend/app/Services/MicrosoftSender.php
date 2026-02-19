<?php
// app/Services/MicrosoftSender.php

namespace App\Services;

use App\Models\IntegrationToken;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Exception;

class MicrosoftSender
{
    /**
     * Envia e-mail usando a conta microsoft do usuário.
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
            ->where('provider', 'microsoft')
            ->first();

        if (!$token) {
            throw new Exception('Nenhuma conta Microsoft conectada.');
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

        // 3. Verificar expiração e renovar se necessário
        if ($token->expires_at->isPast()) {
            if (!$refreshToken) {
                throw new Exception('Token expirado e sem refresh_token. Reconecte a conta.');
            }

            Log::info("Token Microsoft expirado para usuário {$userId}. Renovando...");
            $newTokens = $this->refreshAccessToken($refreshToken);

            // Atualizar tokens no banco
            $token->access_token = Crypt::encryptString($newTokens['access_token']);
            
            // Microsoft pode retornar um NOVO refresh_token (renovação rotativa)
            if (isset($newTokens['refresh_token'])) {
                $token->refresh_token = Crypt::encryptString($newTokens['refresh_token']);
            }
            
            $token->expires_at = now()->addSeconds($newTokens['expires_in']);
            $token->save();

            $accessToken = $newTokens['access_token'];
            Log::info("Token Microsoft renovado com sucesso para usuário {$userId}");
        }

        // 4. Construir a mensagem no formato da Microsoft Graph API
        $message = [
            'message' => [
                'subject' => $subject,
                'body' => [
                    'contentType' => 'HTML',
                    'content' => $htmlBody,
                ],
                'toRecipients' => [
                    [
                        'emailAddress' => [
                            'address' => $to,
                        ],
                    ],
                ],
            ],
            'saveToSentItems' => true,
        ];

        // 5. Enviar via Graph API
        $response = Http::withToken($accessToken)
            ->timeout(30)
            ->retry(2, 100)
            ->post('https://graph.microsoft.com/v1.0/me/sendMail', $message);

        if ($response->failed()) {
            $status = $response->status();
            $body = $response->body();
            
            Log::error("microsoft send failed (HTTP {$status}): {$body}");
            
            // Tratamento específico para token inválido
            if ($status === 401) {
                $token->delete(); // Remove token inválido
                throw new Exception('Sua conexão com o microsoft expirou. Por favor, conecte novamente.');
            }
            
            throw new Exception("Falha no envio do e-mail: HTTP {$status}");
        }

        Log::info("E-mail enviado com sucesso via microsoft para {$to} (usuário {$userId})");
        return true;
    }

    /**
     * Renova o access_token usando o refresh_token.
     *
     * @param string $refreshToken
     * @return array
     * @throws Exception
     */
    private function refreshAccessToken(string $refreshToken): array
    {
        $response = Http::asForm()->post(
            'https://login.microsoftonline.com/' . env('MICROSOFT_TENANT_ID', 'common') . '/oauth2/v2.0/token',
            [
                'client_id' => env('MICROSOFT_CLIENT_ID'),
                'client_secret' => env('MICROSOFT_CLIENT_SECRET'),
                'refresh_token' => $refreshToken,
                'grant_type' => 'refresh_token',
                'redirect_uri' => env('MICROSOFT_REDIRECT_URI'),
            ]
        );

        if ($response->failed()) {
            $error = $response->json();
            $errorDescription = $error['error_description'] ?? 'Erro desconhecido';
            
            Log::error("Failed to refresh Microsoft token: {$errorDescription}");
            throw new Exception("Falha ao renovar token: {$errorDescription}");
        }

        return $response->json();
    }

    /**
     * Verifica se o usuário tem uma conta Microsoft válida conectada.
     *
     * @param int $userId
     * @return bool
     */
    public function isConnected(int $userId): bool
    {
        $token = IntegrationToken::where('user_id', $userId)
            ->where('provider', 'microsoft')
            ->first();

        if (!$token) {
            return false;
        }

        // Se expirou mas tem refresh_token, ainda está conectado (vai renovar automático)
        if ($token->expires_at->isPast() && !$token->refresh_token) {
            return false;
        }

        return true;
    }

    /**
     * Desconecta a conta Microsoft do usuário.
     *
     * @param int $userId
     * @return bool
     */
    public function disconnect(int $userId): bool
    {
        return IntegrationToken::where('user_id', $userId)
            ->where('provider', 'microsoft')
            ->delete();
    }
}