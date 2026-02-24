import { useCallback, useRef, useEffect } from "react";
import type { LeadRequest } from "./types/leads";
import type { UserRequest } from "./types/user";
import { useEmail } from "./use-email";
import { api } from "@/lib/api";

export function usePipelineAutomation() {
  const { emailStatus } = useEmail();
  const dataRef = useRef(emailStatus);
  
  useEffect(() => {
    dataRef.current = emailStatus;
  }, [emailStatus]);
  
  
  const runAutomations = useCallback(async (lead: LeadRequest, newStatusId: string, user: UserRequest) => {
    console.log("🔧 Automação acionada para:", lead, "status:", newStatusId);

    const provider = dataRef.current?.data?.gmail?.connected
    ? "gmail"
    : dataRef.current?.data?.microsoft?.connected
      ? "microsoft"
      : null;
    console.log('📧 Provedor de e-mail gmail: ', dataRef.current?.data?.gmail?.connected,
      'microsoft: ', dataRef.current?.data?.microsoft?.connected,
      'provider selecionado: ', provider
     )

    switch (newStatusId) {
      case "contato-automatico": {
        const providerEmail = dataRef.current?.data?.gmail?.email || dataRef.current?.data?.microsoft?.email || null;
        if (!providerEmail) {
          console.warn('Nenhum provedor de e-mail conectado para o usuário.');
          break;
        }

        try {
          await api.post('send-email', {
            user_id: user.id,
            provider,
            to: lead.email,
            subject: (user as any).email_subject,
            body: (user as any).email_body,
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
