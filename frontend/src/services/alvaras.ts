import type { Dispatch, SetStateAction } from 'react'
import type { DateRange } from 'react-day-picker'
import type { SearchAlvarasPayload } from '@/http/types/alvaras'
import type { FlowState } from '@/http/use-alvaras'

type SearchResults = { totalFound: number; available: number } | null

export function buildSearchPayload(
  city: string,
  dateRange: DateRange | undefined,
  selectedTypeFilter: 'Todos' | 'AVCB' | 'CLCB'
): SearchAlvarasPayload | null {
  if (!dateRange?.from || !dateRange?.to) return null

  const from = new Date(dateRange.from)
  const to = new Date(dateRange.to)
  if (to < from) return null

  const monthMap = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

  return {
    city,
    from: { year: from.getFullYear(), month: monthMap[from.getMonth()] },
    to: { year: to.getFullYear(), month: monthMap[to.getMonth()] },
    selectedTypeFilter
  }
}

export function calculateExtraAmount(totalFound: number, available: number) {
  return Math.max(totalFound - available, 0) * 5
}

export function handleReleaseAlvaras(setFlowState: Dispatch<SetStateAction<FlowState>>) {
  setFlowState('alvaras-released')
}

export function handlePaymentSuccess(
  setFlowState: Dispatch<SetStateAction<FlowState>>
) {
  setFlowState('alvaras-released')
  // aqui você pode adicionar integração com backend se necessário
}

export function handleNewQuery(
  setFlowState: Dispatch<SetStateAction<FlowState>>,
  setSearchResults: Dispatch<SetStateAction<SearchResults>>,
  setCity: (city: string) => void,
  setDateRange: (range: DateRange | undefined) => void,
  setSelectedTypeFilter: (value: 'Todos' | 'AVCB' | 'CLCB') => void,
  setShowPaymentModal: (value: boolean) => void
) {
  setFlowState('subscription-active')
  setSearchResults(null)
  setCity('')
  setDateRange(undefined)
  setSelectedTypeFilter('Todos')
  setShowPaymentModal(false)
}