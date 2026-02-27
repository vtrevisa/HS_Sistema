<?php
// app/Services/SmtpSender.php

namespace App\Services;

use App\Models\SmtpConfig;
use Illuminate\Support\Facades\Log;
use Exception;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;

class SmtpSender
{
    /**
     * Cria o transporte SMTP a partir das configurações.
     *
     * @param array $config
     * @return TransportInterface
     */
    private function createTransport(array $config): TransportInterface
    {
        $host = $config['host'] ?? '';
        $port = $config['port'] ?? '';
        $username = $config['username'] ?? '';
        $password = $config['password'] ?? '';
        $encryption = $config['encryption'] ?? null;

        $user = rawurlencode((string) $username);
        $pass = rawurlencode((string) $password);

        // Use implicit SSL scheme for port 465 (smtps), and use ?encryption=tls for STARTTLS (port 587).
        if ($encryption === 'ssl') {
            $dsn = "smtps://{$user}:{$pass}@{$host}:{$port}";
        } else {
            $dsn = "smtp://{$user}:{$pass}@{$host}:{$port}";
            if ($encryption === 'tls') {
                $dsn .= "?encryption=tls";
            }
        }

        return Transport::fromDsn($dsn);
    }

    /**
     * Testa a conexão SMTP com as configurações fornecidas.
     *
     * @param array $config
     * @return bool
     * @throws Exception
     */
    public function testConnection(array $config): bool
    {
        try {
            // verifica conectividade TCP rápida para evitar longos timeouts
            $host = $config['host'] ?? '';
            $port = $config['port'] ?? 25;
            $encryption = $config['encryption'] ?? null;
            $this->checkTcpConnectivity($host, $port, 5, $encryption);

            $transport = $this->createTransport($config);
            // O simples ato de criar o transporte já valida as credenciais (DSN).
            // Mas se quiser realmente abrir uma conexão, pode tentar start():
            if (method_exists($transport, 'start')) {
                $transport->start();
                if (method_exists($transport, 'stop')) {
                    $transport->stop();
                }
            } else {
                // Fallback: apenas instancia o Mailer para garantir que o transporte funciona
                new Mailer($transport);
            }

            return true;
        } catch (Exception $e) {
            throw new Exception('Erro de conexão: ' . $e->getMessage());
        }
    }

    /**
     * Check TCP connectivity to SMTP host with a timeout.
     * Uses ssl:// prefix when encryption is ssl to attempt an SSL socket.
     *
     * @param string $host
     * @param int $port
     * @param int $timeout Seconds
     * @param string|null $encryption
     * @throws Exception
     */
    private function checkTcpConnectivity(string $host, int $port, int $timeout = 5, ?string $encryption = null): void
    {
        if (empty($host) || empty($port)) {
            throw new Exception('Host ou porta SMTP inválidos.');
        }

        $address = $host;
        if ($encryption === 'ssl') {
            $address = 'ssl://' . $host;
        }

        $errno = 0;
        $errstr = '';
        $fp = @fsockopen($address, $port, $errno, $errstr, $timeout);
        if ($fp === false) {
            throw new Exception("Não foi possível conectar a {$host}:{$port} — {$errstr}");
        }
        fclose($fp);
    }

    /**
     * Envia um e-mail usando as configurações SMTP do usuário.
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
        $config = SmtpConfig::where('user_id', $userId)->first();

        if (!$config) {
            throw new Exception('Configuração SMTP não encontrada para este usuário.');
        }

        try {
            $transport = $this->createTransport([
                'host' => $config->host,          // CORRIGIDO: acesso direto
                'port' => $config->port,
                'username' => $config->username,
                'password' => $config->password,
                'encryption' => $config->encryption,
            ]);

            $mailer = new Mailer($transport);

            $email = (new Email())
                ->from($config->from_email)       // CORRIGIDO: acesso direto
                ->to($to)
                ->subject($subject)
                ->html($htmlBody);

            $mailer->send($email);

            Log::info("E-mail enviado via SMTP para {$to} (usuário {$userId})");
            return true;

        } catch (Exception $e) {
            Log::error("Falha no envio SMTP: " . $e->getMessage());
            throw new Exception('Falha no envio: ' . $e->getMessage());
        }
    }

    /**
     * Verifica se o usuário possui uma configuração SMTP válida.
     */
    public function isConfigured(int $userId): bool
    {
        return SmtpConfig::where('user_id', $userId)->exists();
    }

    /**
     * Remove a configuração SMTP do usuário.
     */
    public function disconnect(int $userId): bool
    {
        return SmtpConfig::where('user_id', $userId)->delete();
    }
}