import { useCallback, useRef, useEffect } from "react";
import type { LeadRequest } from "./types/leads";
import { useEmail } from "./use-email";
import { api } from "@/lib/api";
import type { EmailTemplate } from "./types/email";

export function usePipelineAutomation() {
  const { emailStatus } = useEmail();
  const dataRef = useRef(emailStatus);
  
  useEffect(() => {
    dataRef.current = emailStatus;
  }, [emailStatus]);
  
  
  const runAutomations = useCallback(async (lead: LeadRequest, newStatusId: string, template: EmailTemplate) => {
    console.log("🔧 Automação acionada para:", lead, "status:", newStatusId);

    const provider = dataRef.current?.data?.gmail?.connected
    ? "gmail"
    : dataRef.current?.data?.microsoft?.connected
      ? "microsoft"
      : null;

    switch (newStatusId) {
      case "contato-automatico": {
        const providerEmail = dataRef.current?.data?.gmail?.email || dataRef.current?.data?.microsoft?.email || null;
        if (!providerEmail) {
          console.warn('Nenhum provedor de e-mail conectado para o usuário.');
          break;
        }
        console.log(`📧 Enviando e-mail de contato automático via ${provider} para ${lead.email} usando template:`, template);
        try {
          await api.post('send-email', {
            user_id: template.user_id,
            provider,
            to: lead.email,
            subject: (template as any).subject,
            body: (template as any).body,
          });
          console.log("📧 E-mail de contato automático enviado para", lead.email);
        } catch (error: any) {
          console.error('Erro ao enviar e-mail:', error.response?.data ?? error.message);
          }
        console.log("💬 Aqui futuramente enviaremos WhatsApp via Waseller");
        break;
      }

      case "contato-manual": {
        console.log("👤 Automação de contato manual (opcional)");
        break;
      }

      case "proposta-followup": {
        console.log("📄 Automação de followup de proposta (opcional)");
        break;
      }

      default:
        break;
    }
  }, []);

  return { runAutomations };
}
