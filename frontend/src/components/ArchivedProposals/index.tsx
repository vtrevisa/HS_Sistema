import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { ArchivedProposalsFilters } from './archivedproposals-filters'
import { useProposals } from '@/http/use-proposals'
import { ArchivedProposalsInfo } from './achivedproposals-info'
import { ArchivedProposalsSummaryCard } from './achivedproposals-summary-card'
import { ArchivedProposalsCard } from './achivedproposals-card'

export interface Filters {
 status: 'todas' | 'Ganho' | 'Perdido'
 cidade: string
 tipoServico: string
 dataInicio: string
 dataTermino: string
}

export function ArchivedProposals() {
 const [filters, setFilters] = useState<Filters>({
  status: 'todas',
  cidade: '',
  tipoServico: '',
  dataInicio: '',
  dataTermino: ''
 })

 const isFilterApplied =
  filters.status !== 'todas' ||
  filters.cidade !== '' ||
  filters.tipoServico !== '' ||
  filters.dataInicio !== '' ||
  filters.dataTermino !== ''

 const { proposalsDB, isLoading } = useProposals(filters)

 function removeFilters() {
  setFilters({
   status: 'todas',
   cidade: '',
   tipoServico: '',
   dataInicio: '',
   dataTermino: ''
  })
 }

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
    proposals={proposalsDB.data ?? []}
    removeFilters={removeFilters}
   />

   {isFilterApplied && (
    <>
     {isLoading ? (
      <div className="flex justify-center">
       <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
     ) : (
      <>
       {/* Summary Cards */}
       <ArchivedProposalsSummaryCard proposals={proposalsDB.data} />

       {/* Proposals Grid */}
       <ArchivedProposalsCard proposals={proposalsDB.data} />
      </>
     )}
    </>
   )}

   {/* Informações */}

   {(!proposalsDB.data || proposalsDB.data?.length === 0) && (
    <ArchivedProposalsInfo filters={filters} />
   )}
  </div>
 )
}
