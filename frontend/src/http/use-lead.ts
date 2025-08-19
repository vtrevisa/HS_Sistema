import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from 'axios'
import type { LeadRequest } from "./types/leads"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function useLead() {
  const queryClient = useQueryClient();


  // // Fn to save leads
  // const saveLeads = async (leads: LeadRequest[]): Promise<LeadResponse[]> => {
  //   const responses: LeadResponse[] = [];
  //   for (const lead of leads) {
  //     const response = await api.post<LeadResponse>("/leads", lead);
  //     responses.push(response.data);
  //   }
  //   return responses;
  // };

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
        leads.map(lead => api.post<LeadRequest>("/leads", lead).then(res => res.data))
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
  
  return {
    saveLeads: saveMutation,
    leadsDB,
  };
}

