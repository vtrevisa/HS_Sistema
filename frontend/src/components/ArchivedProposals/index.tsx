import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { ArchivedProposalsFilters } from './archivedproposals-filters'
import { useProposals } from '@/http/use-proposals'
import { ArchivedProposalsInfo } from './achivedproposals-info'
import { ArchivedProposalsSummaryCard } from './achivedproposals-summary-card'
import { ArchivedProposalsTable } from './achivedproposals-table'

export interface Filters {
 city: string
 type: string
 status: 'todas' | 'Ganho' | 'Perdido'
 expiration: string
 leadCreatedAt: string
 dateRange?: DateRange | undefined
}

export function ArchivedProposals() {
 const [dateRange, setDateRange] = useState<DateRange | undefined>()

 const [filters, setFilters] = useState<Filters>({
  city: '',
  type: '',
  status: 'todas',
  expiration: '',
  leadCreatedAt: '',
  dateRange: undefined
 })

 const { proposalsDB, isLoading } = useProposals(filters)

 function removeFilters() {
  setFilters({
   city: '',
   type: '',
   status: 'todas',
   expiration: '',
   leadCreatedAt: '',
   dateRange: undefined
  })
 }

 function handleDateRangeChange(range: DateRange | undefined) {
  setDateRange(range)
  setFilters(prev => ({
   ...prev,
   dateRange: range
  }))
 }

 const hasProposals = proposalsDB.data && proposalsDB.data.length > 0

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex items-center justify-between">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     Propostas Arquivadas
    </h1>
   </div>

   {/* Filtros */}
   <ArchivedProposalsFilters
    filters={filters}
    setFilters={setFilters}
    dateRange={dateRange}
    onDateRangeChange={handleDateRangeChange}
    proposals={proposalsDB.data ?? []}
    removeFilters={removeFilters}
   />

   <ArchivedProposalsSummaryCard proposals={proposalsDB.data} />

   {/* Loading */}
   {isLoading && (
    <div className="flex justify-center">
     <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
    </div>
   )}

   {/* Conteúdo */}

   {!isLoading && hasProposals && (
    <ArchivedProposalsTable proposals={proposalsDB.data} />
   )}

   {/* Informações */}

   {!isLoading && !hasProposals && <ArchivedProposalsInfo filters={filters} />}
  </div>
 )
}
