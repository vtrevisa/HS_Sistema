import { useCallback } from "react";
import type { LeadRequest } from "./types/leads";


export function usePipelineAutomation() {
  const runAutomations = useCallback(async (lead: LeadRequest, newStatusId: string) => {
    console.log("🔧 Automação acionada para:", lead, "status:", newStatusId);


    switch (newStatusId) {
      case "contato-automatico":
        console.log("📨 Backend enviará e-mail automaticamente");
        console.log("💬 Aqui futuramente enviaremos WhatsApp via Waseller");
        break;

      case "contato-manual":
        console.log("👤 Automação de contato manual (opcional)");
        break;

      case "proposta-followup":
        console.log("📄 Automação de followup de proposta (opcional)");
        break;

      default:
        break;
    }
  }, []);

  return { runAutomations };
}
