<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class AutomationController extends Controller
{

    private $wascriptToken;
    private $wascriptUrl;

    public function __construct()
    {

        $this->wascriptToken = env('WASELLER_TOKEN');
        $this->wascriptUrl = 'https://api-whatsapp.wascript.com.br/api/enviar-texto/';
    }


    public function handleStatusAutomation(Lead $lead)

    {

        info("STATUS ATUAL NA AUTOMATION: " . $lead->status);

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

    private function normalizePhone($phone)
    {

        $digits = preg_replace('/\D+/', '', $phone);


        if (substr($digits, 0, 2) !== '55') {
            $digits = '55' . $digits;
        }

        return $digits;
    }

    private function sendWhatsApp(Lead $lead)
    {
        $message = "Olá {$lead->company}! Tudo bem ?";
        $phone = $this->normalizePhone($lead->phone);

        info("📱 Enviando WhatsApp via Wascript para: {$phone}");

        $url = $this->wascriptUrl . $this->wascriptToken;

        try {
            $response = Http::get($url, [
                'phone'   => $phone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                info("✅ WhatsApp enviado via Wascript para {$phone}. Resposta: " . $response->body());
            } else {
                info("❌ Erro ao enviar WhatsApp para {$phone}. Status: {$response->status()}. Resposta: " . $response->body());
            }
        } catch (\Exception $e) {
            info("🔥 EXCEPTION ao enviar WhatsApp: " . $e->getMessage());
        }
    }

    public function receiveWhatsAppWebhook(Request $request)
    {
        $data = $request->all();

        info("📩 Webhook recebido da Wascript: " . json_encode($data));

        if (empty($data['phone']) || empty($data['message'])) {
            info("⚠️ Webhook ignorado: numero ou mensagem ausentes");
            return response()->json(['ignored' => true]);
        }

        $cleanPhone = preg_replace('/\D+/', '', $data['phone']);

        // Busca o lead pelo telefone
        $lead = Lead::whereRaw("
        REPLACE(REPLACE(REPLACE(phone, '+', ''), '-', ''), ' ', '') LIKE ?
    ", ["%$cleanPhone%"])->first();

        if (!$lead) {
            info("⚠️ Nenhum lead encontrado para o telefone: {$cleanPhone}");
            return response()->json(['lead_found' => false]);
        }

        $lead->update([
            'last_message' => $data['message'],
            'status' => 'Follow-up',
        ]);

        info("✅ Lead {$lead->id} atualizado após resposta do WhatsApp");

        return response()->json(['success' => true]);
    }
}
