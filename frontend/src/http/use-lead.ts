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
  const fetchLeads = async (): Promise<LeadRequest[]> => {
    const { data } = await api.get<{ status: boolean; leads: LeadRequest[] }>("/leads");
    return data.leads;
  };

  // Hook to salve leads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveMutation = useMutation<LeadResponse[], AxiosError<any>, LeadRequest[]>({
    mutationFn: saveLeads,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      const messages = Object.values(error.response?.data.erros).flat() .join("\n"); 
      toast.error(messages)
    }
  })

  // Hook to find leads
  const leadsDB = useQuery<LeadRequest[], AxiosError>({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });

  return {
    saveLeads: saveMutation,
    leadsDB,
  };
}