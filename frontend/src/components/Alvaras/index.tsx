import { useState } from 'react'
import { toast } from 'sonner'
import type { DateRange } from 'react-day-picker'
import { AlvarasFilters } from './alvaras-filters'
import { AlvarasCounter } from './alvaras-counter'
import type { SearchAlvarasPayload } from '@/http/types/alvaras'
import { useAlvaras } from '@/http/use-alvaras'

// type FlowState =
//  | 'no-subscription'
//  | 'subscription-active'
//  | 'search-result'
//  | 'payment-required'
//  | 'alvaras-released'

export function Alvaras() {
 const [city, setCity] = useState('')
 const [dateRange, setDateRange] = useState<DateRange | undefined>()
 const [selectedTypeFilter, setSelectedTypeFilter] = useState<
  'Todos' | 'AVCB' | 'CLCB'
 >('Todos')

 const [subscriptionData] = useState({
  planName: 'Premium',
  monthlyLimit: 200,
  used: 50,
  resetDate: new Date(2025, 10, 1)
 })

 const { alvarasData, searchAlvaras, searchResults, flowState } =
  useAlvaras(subscriptionData)

 async function handleSearchAlvaras() {
  if (!city.trim()) {
   toast.info('Campo obrigatório', {
    description: 'Por favor, informe a cidade.'
   })
   return
  }

  if (!dateRange?.from || !dateRange?.to) {
   toast.info('Período obrigatório', {
    description: 'Por favor, selecione o período de vencimento.'
   })
   return
  }

  const from = new Date(dateRange.from)
  const to = new Date(dateRange.to)

  if (to < from) {
   toast.info('Período inválido', {
    description: 'A data de término deve ser maior que a data de início.'
   })
   return
  }

  const monthMap = [
   'jan',
   'fev',
   'mar',
   'abr',
   'mai',
   'jun',
   'jul',
   'ago',
   'set',
   'out',
   'nov',
   'dez'
  ]

  const payload: SearchAlvarasPayload = {
   city,
   from: { year: from.getFullYear(), month: monthMap[from.getMonth()] },
   to: { year: to.getFullYear(), month: monthMap[to.getMonth()] },
   selectedTypeFilter
  }

  console.log('Payload para backend:', payload)

  try {
   await searchAlvaras.mutateAsync(payload)
  } catch (error) {
   console.error(error)
   toast.error('Erro ao buscar alvarás')
  }
 }

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex items-center justify-between">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     Captação de Alvarás
    </h1>
   </div>

   {/* Resultado da Busca */}
   {searchResults &&
    (flowState === 'search-result' || flowState === 'payment-required') && (
     <AlvarasCounter
      totalFound={searchResults.totalFound}
      available={searchResults.available}
     />
    )}

   {/* Filtros */}
   <AlvarasFilters
    city={city}
    setCity={setCity}
    dateRange={dateRange}
    setDateRange={setDateRange}
    selectedType={selectedTypeFilter}
    setSelectedType={setSelectedTypeFilter}
    applyFilter={handleSearchAlvaras}
   />
  </div>
 )
}
