import type { Dispatch, SetStateAction } from 'react'
import type { DateRange } from 'react-day-picker'
import type { SearchAlvarasPayload } from '@/http/types/alvaras'
import type { FlowState } from '@/http/use-alvaras'
import type { UseMutationResult } from "@tanstack/react-query";

type SearchResults = { totalFound: number; available: number; } | null

interface ReleaseParams {
  releaseAlvaras: UseMutationResult<
    { creditsUsed: number; creditsAvailable: number; extraNeeded: number },
    Error,
    { totalToRelease: number }
  >;
  totalFound: number;
}

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

export function handleReleaseAlvaras({ releaseAlvaras, totalFound }: ReleaseParams) {
  releaseAlvaras.mutate({ totalToRelease: totalFound });
}

export async function handlePaymentSuccess({ releaseAlvaras, totalToRelease, setFlowState }) {
 try {
    // Atualiza o user com os novos créditos
    setFlowState("subscription-active")

    // ✅ Agora sim: liberação automática
    await releaseAlvaras.mutateAsync({ totalToRelease })

    setFlowState("alvaras-released")

  } catch (err) {
    console.error(err)
  }
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