import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from 'axios'
import type { LeadRequest, LeadResponse } from "./types/leads"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function useLead() {
  const queryClient = useQueryClient();


  // Fn to save leads
  const saveLeads = async (leads: LeadRequest[]): Promise<LeadResponse[]> => {
    const responses: LeadResponse[] = [];
    for (const lead of leads) {
      const response = await api.post<LeadResponse>("/leads", lead);
      responses.push(response.data);
    }
    return responses;
  };

   // Fn to show all leads
  const fetchLeads = async (): Promise<LeadResponse[]> => {
    const { data } = await api.get<{ status: boolean; leads: LeadResponse[] }>("/leads");
    return data.leads;
  };

  // Hook to salve leads
  const saveMutation = useMutation<LeadResponse[], AxiosError<{ message: string }>, LeadRequest[]>({
    mutationFn: saveLeads,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erro ao salvar leads'
      toast.error(message)
    }
  })

  // Hook to find leads
  const leadsDB = useQuery<LeadResponse[], AxiosError>({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });

  return {
    saveLeads: saveMutation,
    leadsDB,
  };
}