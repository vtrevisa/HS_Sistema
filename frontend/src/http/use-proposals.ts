import { useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import type { ArchivedProposal } from "./types/crm"
import { api } from "@/lib/api"

export interface ProposalFilters {
  status?: 'Ganho' | 'Perdido' | 'todas'
  cidade?: string
  tipoServico?: string
  dataInicio?: string
  dataTermino?: string
}


export function useProposals(filters: ProposalFilters) {

  const shouldFetch = 
    !!filters.status && filters.status !== 'todas' ||
    !!filters.cidade ||
    !!filters.tipoServico ||
    !!filters.dataInicio ||
    !!filters.dataTermino

  const proposalsDB = useQuery<ArchivedProposal[], AxiosError>({
    queryKey: ["archived-proposals", filters],
    queryFn: async (): Promise<ArchivedProposal[]> => {
      const params = new URLSearchParams()

      if (filters.status && filters.status !== 'todas') params.append('status', filters.status)
      if (filters.cidade) params.append('cidade', filters.cidade)
      if (filters.tipoServico) params.append('tipoServico', filters.tipoServico)
      if (filters.dataInicio) params.append('dataInicio', filters.dataInicio)
      if (filters.dataTermino) params.append('dataTermino', filters.dataTermino)

      const { data } = await api.get<{ status: boolean; proposals: ArchivedProposal[] }>(
        `/archived-proposals?${params.toString()}`
      )

      return data.proposals
    },
    staleTime: 1 * 60 * 1000, 
    gcTime: 30 * 60 * 1000,
    enabled: shouldFetch,
  })

  return {
    proposalsDB,
    isLoading: proposalsDB.isLoading
  }
}