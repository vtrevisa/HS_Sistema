import type { Dispatch, SetStateAction } from 'react'
import type { DateRange } from 'react-day-picker'
import type { SearchAlvarasPayload } from '@/http/types/alvaras'
import type { FlowState } from '@/http/use-alvaras'
import type { UseMutationResult } from "@tanstack/react-query";

import { toast } from 'sonner'

type SearchResults = { totalFound: number; available: number; } | null

interface ReleaseParams {
  releaseAlvaras: UseMutationResult<
    { creditsUsed: number; creditsAvailable: number; extraNeeded: number },
    Error,
    { totalToRelease: number }
  >;
   totalToRelease: number
}

interface SuccessParams {
  releaseAlvaras: UseMutationResult<
    { creditsUsed: number; creditsAvailable: number; extraNeeded: number },
    Error,
    { totalToRelease: number }
  >
  totalToRelease: number
}

interface PaginationParams<T> {
  data: T[]
  currentPage: number
  itemsPerPage: number
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

export function handleReleaseAlvaras({ releaseAlvaras, totalToRelease }: ReleaseParams) {
  releaseAlvaras.mutate({ totalToRelease });
}

export function handleQuantityChange(value: string, totalFound?: number){
  const numValue = parseInt(value) || 0;

  if (typeof totalFound === 'number') {
    return Math.min(Math.max(0, numValue), totalFound)
  }

  return Math.max(0, numValue)
};

export async function handlePaymentSuccess({ releaseAlvaras, totalToRelease }: SuccessParams) {
 try {
    toast.info("Pagamento registrado", { 
      description: "Finalizando liberação dos alvarás..." 
    });

    await releaseAlvaras.mutateAsync({ totalToRelease })

  } catch (err) {
    console.error("Erro ao finalizar a liberação após pagamento.", err);

    toast.error('Falha na liberação', {
      description: 'Ocorreu um erro ao processar a liberação final. Se o pagamento foi efetuado, contate o suporte.'
    });

    console.error(err)
  }
}

export function getPaginatedData<T>({ data, currentPage, itemsPerPage }: PaginationParams<T>) {
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  return data.slice(start, end)
}

export function getTotalPages(totalItems: number, itemsPerPage: number) {
  return Math.ceil(totalItems / itemsPerPage)
}

export function handlePageChange(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages)
}

export function handleItemsPerPageChange(value: string, setCurrentPage: Dispatch<SetStateAction<number>>) {
  setCurrentPage(1)
  return Number(value)
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