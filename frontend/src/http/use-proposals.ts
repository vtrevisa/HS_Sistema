import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ArchivedProposal } from "./types/crm"
import { api } from "@/lib/api"
import { toast } from "sonner"

export interface ProposalFilters {
  status?: 'Ganho' | 'Perdido' | 'todas'
  city?: string
  service?: string
  initDate?: string
  endDate?: string
}

export interface CreateArchivedProposal {
  lead_id: number | undefined
  company?: string
  type?: string
  value?: number
  status: "Ganho" | "Perdido"
  reason?: string
}

interface CreateProposalResponse {
  status: boolean
  message: string
  proposal: ArchivedProposal
}

export function useProposals(filters: ProposalFilters) {

  const queryClient = useQueryClient();

  const shouldFetch = 
    !!filters.status && filters.status !== 'todas' ||
    !!filters.city ||
    !!filters.service ||
    !!filters.initDate ||
    !!filters.endDate

  const proposalsDB = useQuery<ArchivedProposal[], AxiosError>({
    queryKey: ["archived-proposals", filters],
    queryFn: async (): Promise<ArchivedProposal[]> => {
      const params = new URLSearchParams()

      if (filters.status && filters.status !== 'todas') params.append('status', filters.status)
      if (filters.city) params.append('city', filters.city)
      if (filters.service) params.append('service', filters.service)
      if (filters.initDate) params.append('initDate', filters.initDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const { data } = await api.get<{ status: boolean; proposals: ArchivedProposal[] }>(
        `/archived-proposals?${params.toString()}`
      )

      return data.proposals
    },
    staleTime: 1 * 60 * 1000, 
    gcTime: 30 * 60 * 1000,
    enabled: shouldFetch,
  })

  const createProposal = useMutation<CreateProposalResponse, AxiosError, CreateArchivedProposal>({

    mutationFn: async (payload) => {
      const { data } = await api.post<CreateProposalResponse>("/archived-proposals/archive", payload)
      return data
    }, 
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["archived-proposals"] })
      queryClient.invalidateQueries({ queryKey: ["leads"] })
    }
  })

  return {
    proposalsDB,
    isLoading: proposalsDB.isLoading,
    saveProposal: createProposal
  }
}