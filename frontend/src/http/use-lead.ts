import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from 'axios'
import type { LeadRequest } from "./types/leads"
import { api } from "@/lib/api"
import { toast } from "sonner"

export type LeadWithAttachments = LeadRequest & {
  attachments?: { id?: number; name: string; url: string }[];
};

export interface LeadEditRequest extends Partial<LeadRequest> {
  attachmentsFilesFormData?: FormData;
}

export function useLead() {
  const queryClient = useQueryClient();

  // List all leads
  const leadsDB = useQuery<LeadRequest[], AxiosError>({
    queryKey: ["leads"],
    queryFn: async (): Promise<LeadRequest[]> => {
      const { data } = await api.get<{ status: boolean; leads: LeadRequest[] }>("/leads");
      return data.leads;
    },
    staleTime: 1 * 60 * 1000, 
    gcTime: 30 * 60 * 1000,
  });

  // Mutation to save leads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveMutation = useMutation<LeadRequest[], AxiosError<any>, LeadRequest[]>({
    mutationFn: async (leads: LeadRequest[]) => {
      const responses = await Promise.all(
        leads.map(lead => api.post<LeadRequest>("/leads", lead).then(response => response.data))
      );
      return responses;
    },
    onSuccess: (savedLeads) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });

      setTimeout(() => {
        toast.success(
          savedLeads.length === 1
          ? '1 lead foi gerado com sucesso!'
          : `${savedLeads.length} leads foram geradoscd com sucesso!`
        )
      }, 3200)
    },
    onError: (error) => {
      const messages = Object.values(error.response?.data.erros).flat() .join("\n"); 

      setTimeout(() => {
        toast.error('Erro ao salvar lead no sistema!', {
          description: messages
        })
      }, 3200)
    }
  })

  // Mutation to update leads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateMutation = useMutation<LeadWithAttachments, AxiosError<any>, LeadEditRequest>({
    mutationFn: async (lead) => {
      if (!lead.id) throw new Error("Lead não encontrado!");

      // Upload file attachments
      if (lead.attachmentsFilesFormData) {
        const { data } = await api.post<{
          status: boolean;
          attachments: LeadWithAttachments['attachments'];
          lead: LeadWithAttachments;
        }>(`/leads/${lead.id}/attachments`, lead.attachmentsFilesFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.lead;
      }

    
      const { data } = await api.put<{ status: boolean; lead: LeadWithAttachments }>(`/leads/${lead.id}`,lead)
      return data.lead;
    },
    onSuccess: (updatedLead, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });

      if (!variables.attachmentsFilesFormData) {
        setTimeout(() => {
          toast.success(`Lead ${updatedLead.company} atualizado com sucesso!`)
        }, 1200);
      }
    },
    onError: (error) => {
      const messages = Object.values(error.response?.data.erros).flat() .join("\n"); 

      setTimeout(() => {
        toast.error('Erro ao editar lead no sistema!', {
          description: messages
        })
      }, 1200)
    }
  })

  // Mutation to delete leads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deleteMutation = useMutation<void, AxiosError<any>, number>({
    mutationFn: async (id: number) => {
      await api.delete(`/leads/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })

      setTimeout(() => {
        toast.success("Lead deletado com sucesso!")
      }, 1200)
    },
    onError: (error) => {
      const messages = Object.values(error.response?.data.erros).flat().join("\n")
      setTimeout(() => {
        toast.error("Erro ao deletar lead no sistema!", { description: messages })
      }, 1200)
    }
  })
  
  return {
    saveLeads: saveMutation,
    updateLead: updateMutation,
    deleteLead: deleteMutation,
    leadsDB,
  };
}

