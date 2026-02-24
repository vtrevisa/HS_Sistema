import { useCallback, useMemo, useState } from "react";
import { useLead } from "@/http/use-lead";
import type { LeadRequest } from "./types/leads";
import { useUser } from "./use-user";
import type { UserRequest } from "./types/user";
import { usePipelineAutomation } from "./use-pipeline-automation";

export function useCRM(){
  const { leadsDB, updateLead } = useLead();
  const { runAutomations } = usePipelineAutomation();
  const { user } = useUser();

  const leads = useMemo(() => leadsDB.data ?? [], [leadsDB.data]);
 
  const statusMap = useMemo(() => ({
    lead: "Lead",
    "contato-automatico": "Primeiro contato",
    "contato-manual": "Follow-up",
    "proposta-followup": "Proposta enviada",
    "cliente-fechado": "Cliente fechado",
    arquivado: "Arquivado",
  } as const),
    []
  );

  const statusIdFromLabel = useMemo(() => {
    return Object.fromEntries(
      Object.entries(statusMap).map(([id, label]) => [label, id])
    ) as Record<string, string>;
  }, [statusMap]);

   
  const [draggingLead, setDraggingLead] = useState<LeadRequest | null>(null)

  const pipelineLeads = useMemo(() => {
    return leads.map((lead) => {
      const statusId = statusIdFromLabel[lead.status] ?? "lead";

      const updatedAt = new Date(lead.updated_at || lead.created_at || Date.now());
      const now = new Date();

      const daysInStage = Math.floor(
        (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const deadlines: Record<string, number | null> = {
        lead: 7,
        "contato-automatico": 7,
        "contato-manual": 30,
        "proposta-followup": 60,
        "cliente-fechado": null,
        arquivado: null,
      };

      const deadline = deadlines[statusId];
      const isOverdue = deadline ? daysInStage > deadline : false;

      return {
        ...lead,
        statusId,        
        daysInStage,
        isOverdue,
      };
    });

  }, [leads, statusIdFromLabel]);

  const getLeadsByStatus = (statusId: string) =>
    pipelineLeads.filter((lead) => lead.statusId === statusId)


  const getColumnSummary = (statusId: string) => {
   const columnLeads = getLeadsByStatus(statusId);
    return {
      count: columnLeads.length,
      totalValue: columnLeads.reduce(
        (sum, lead) => sum + parseFloat(lead.service_value || '0'),
        0
      )
    }
  }
  
  const updateLeadStatus = useCallback(
    async (leadId: number, newStatusId: string) => {
      const lead = leads.find((lead) => lead.id === leadId);
      if (!lead) return;

      const newStatusLabel = statusMap[newStatusId];
      const updatedLead = { ...lead, status: newStatusLabel };

      try {
        await updateLead.mutate(updatedLead);
        console.log(`✅ Lead #${leadId} movido para: ${newStatusLabel}`);

        await runAutomations(updatedLead, newStatusId, user as UserRequest);
      } catch (error) {
        console.error("Erro ao atualizar status do lead:", error);
      }
    },
    [leads, statusMap, updateLead, runAutomations] 
  );


  const handleDragStart = useCallback((lead: LeadRequest) => {
    setDraggingLead(lead);
  }, []);


  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    async (newStatusId: string) => {
      if (!draggingLead) return;
        await updateLeadStatus(draggingLead.id!, newStatusId);
      setDraggingLead(null);
    },
    [draggingLead, updateLeadStatus]
  );

  const getColumnColor = useCallback((statusId: string) => {
    const colors: Record<string, string> = {
      lead: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900",
      "contato-automatico": "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900",
      "contato-manual": "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900",
      "proposta-followup": "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-90",
      "cliente-fechado": "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900",
      default: 'bg-muted border-border'
    };
    return colors[statusId] ?? "";
  }, []);

  return {
    pipelineLeads,
    getLeadsByStatus,
    getColumnSummary,
    updateLeadStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    draggingLead,
    getColumnColor,
  }

}