import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from 'axios'
import type { LeadRequest } from "./types/leads"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function useLead() {
  const queryClient = useQueryClient();



  // Fn to show all leads
  const leadsDB = useQuery<LeadRequest[], AxiosError>({
    queryKey: ["leads"],
    queryFn: async (): Promise<LeadRequest[]> => {
      const { data } = await api.get<{ status: boolean; leads: LeadRequest[] }>("/leads");
      return data.leads;
    },
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
          ? '1 lead foi salvo com sucesso!'
          : `${savedLeads.length} leads foram salvos com sucesso!`
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
  const updateMutation = useMutation<LeadRequest, AxiosError<any>, LeadRequest>({
    mutationFn: async (lead: LeadRequest) => {
      if (!lead.id) throw new Error("Lead não encontrado!");
       const { data } = await api.put<{ status: boolean; lead: LeadRequest }>(
        `/leads/${lead.id}`,
        lead
      );
      return data.lead;

    },
    onSuccess: (updatedLead) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });

      setTimeout(() => {
        toast.success(`Lead ${updatedLead.empresa} atualizado com sucesso!`)
      }, 1200)
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

