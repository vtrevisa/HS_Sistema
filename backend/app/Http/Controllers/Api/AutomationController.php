<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\WasellerContact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        $url = $this->wascriptUrl . $this->wascriptToken;

        try {
            $response = Http::get($url, [
                'phone' => $phone,
                'message' => $message,
            ]);

            $json = $response->json();
            info("🚀 Envio Wascript resposta: " . json_encode($json, JSON_PRETTY_PRINT));

            $remoteId = $json['remote'] ?? uniqid('tmp_');

            Cache::put('waseller_mapping_' . $remoteId, $lead->id, now()->addMinutes(30));
            info("⚠️ ID interno do Wascript será atualizado via webhook de envio (cache setado)");
        } catch (\Exception $e) {
            info("🔥 ERRO envio Wascript: " . $e->getMessage());
        }
    }



    public function receiveWhatsAppWebhook(Request $request)
    {
        $data = $request->all();
        info('📩 Webhook RECEBIDO RAW: ' . json_encode($data));

        if (!isset($data['eventDetails'])) {
            info('⚠️ eventDetails ausente no webhook');
            return response()->json(['success' => false]);
        }

        $event = $data['eventDetails'];
        $fromMe = $event['id']['fromMe'] ?? false;
        $remoteId = $event['id']['remote'] ?? null;
        $body = $event['body'] ?? null;



        if ($fromMe) {
            if (!$remoteId) {
                info("⚠️ RemoteId ausente no evento fromMe");
                return response()->json(['success' => true]);
            }

            $leadId = Cache::get('waseller_mapping_' . $remoteId);

            if (!$leadId) {
                info("❌ Lead não encontrado no cache para remoteId: {$remoteId}");
                return response()->json(['success' => true]);
            }

            WasellerContact::updateOrCreate(
                ['lead_id' => $leadId],
                ['waseller_id' => $remoteId]
            );

            info("💾 Lead {$leadId} mapeado com ID Waseller: {$remoteId}");
        } else {
            $fromPhone = $this->normalizePhone(str_replace(['@c.us', '@lid'], '', $event['from'] ?? ''));

            $mapping = WasellerContact::all()->first(function ($c) use ($fromPhone) {
                return $c->lead && $this->normalizePhone($c->lead->phone) === $fromPhone;
            });

            if (!$mapping) {
                info("❌ Lead não encontrado para número normalizado: {$fromPhone}");
                return response()->json(['success' => true]);
            }

            $lead = $mapping->lead;

            $lead->update([
                'last_message' => $body,
                'status' => 'Follow-up', // ajuste conforme lógica
            ]);

            info("✅ Lead {$lead->id} atualizado pelo webhook.");
        }

        return response()->json(['success' => true]);
    }
}
