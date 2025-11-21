<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class AutomationController extends Controller
{

    private $wasellerToken;
    private $wasellerUrl;

    public function __construct()
    {

        $this->wasellerToken = env('WASELLER_TOKEN');
        $this->wasellerUrl = 'https://api.waseller.com.br/v1/messages/sendText';
    }


    public function handleStatusAutomation(Lead $lead)
    {
        if ($lead->status === 'Primeiro contato') {
            $this->sendFirstEmail($lead);
            $this->sendWhatsApp($lead);
        }

        return response()->json([
            'success' => true,
            'automation' => 'executada'
        ]);
    }

    private function sendFirstEmail(Lead $lead)
    {
        $html = "
            <h2>Olá {$lead->company}!</h2>
            <p>Recebemos o seu contato e retornaremos em breve.</p>
            <br>
            <p>Atenciosamente,<br>Equipe Comercial</p>
        ";

        Mail::send([], [], function ($message) use ($lead, $html) {
            $message->to($lead->email)
                ->subject('Primeiro contato — Obrigado!')
                ->html($html);
        });
    }

    private function sendWhatsApp(Lead $lead)
    {
        $message = "Olá {$lead->company}! Recebemos seu contato e em breve retornaremos.";

        $phone = preg_replace('/\D+/', '', $lead->phone);
        if (substr($phone, 0, 2) !== '55') {
            $phone = '55' . $phone;
        }

        info("📱 Simulando envio de WhatsApp para {$phone}");

        // Aqui você só faz um log ou chama o webhook de teste
        $webhookUrl = 'https://webhook.site/2a2e44de-bd7d-43d3-a394-d816b6ddce6d/api/whatsapp/webhook';

        $response = Http::post($webhookUrl, [
            'phone' => $phone,
            'message' => $message,
        ]);


        // $response = Http::withHeaders([
        //     'Authorization' => "Bearer {$this->wasellerToken}",
        //     'Content-Type' => 'application/json',
        // ])->post($this->wasellerUrl, [
        //     'phone' => $phone,
        //     'message' => $message,
        // ]);

        if ($response->successful()) {
            info("✅ WhatsApp enviado para {$phone}");
        } else {
            info("❌ Erro ao enviar WhatsApp para {$phone}: " . $response->body());
        }
    }

    public function receiveWhatsAppWebhook(Request $request)
    {
        $data = $request->all(); // Dados enviados pelo Waseller
        // Exemplo de dados: $data['phone'], $data['message']

        info("Mensagem recebida via WhatsApp: " . json_encode($data));

        // Aqui você pode atualizar o lead ou criar notificações
        $lead = Lead::where('phone', $data['phone'])->first();
        if ($lead) {
            // Exemplo: adicionar log
            $lead->update(['last_message' => $data['message']]);
        }

        return response()->json(['success' => true]);
    }
}
