import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ArchivedProposal } from "./types/crm"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"

export interface ProposalFilters {
  city?: string
  type?: string
  status?: 'Ganho' | 'Perdido' | 'todas'
  expiration?: string
  leadCreatedAt?: string
  dateRange?: DateRange
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

  const proposalsDB = useQuery<ArchivedProposal[], AxiosError>({
    queryKey: ["archived-proposals", filters],
    queryFn: async (): Promise<ArchivedProposal[]> => {
      const params = new URLSearchParams()

      // Status
      if (filters.status && filters.status !== 'todas') params.append('status', filters.status)

      // Cidade  
      if (filters.city) params.append('city', filters.city)
      
      // Tipo de serviço
      if (filters.type) params.append('type', filters.type)

      // Data de vencimento alvará
      if (filters.expiration) params.append('expiration', filters.expiration)

      // Data de cadastro lead
      if (filters.leadCreatedAt) params.append('leadCreatedAt', filters.leadCreatedAt)
    

      // Período de arquivamento (dateRange)
      if (filters.dateRange?.from) {
        params.append(
          'dataInicio',
          filters.dateRange.from.toISOString().split('T')[0]
        )
      }

      if (filters.dateRange?.to) {
        params.append(
          'dataTermino',
          filters.dateRange.to.toISOString().split('T')[0]
        )
      }

      const { data } = await api.get<{ status: boolean; proposals: ArchivedProposal[] }>(
        `/archived-proposals?${params.toString()}`
      )

      return data.proposals
    },
    staleTime: 1 * 60 * 1000, 
    gcTime: 30 * 60 * 1000
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