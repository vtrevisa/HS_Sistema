import { useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { useUser } from '@/http/use-user'
import { useAlvaras } from '@/http/use-alvaras'

import {
 buildSearchPayload,
 calculateExtraAmount,
 handleNewQuery,
 handlePaymentSuccess,
 handleReleaseAlvaras
} from '@/services/alvaras'

import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'

import { AlvarasFilters } from './alvaras-filters'
import { AlvarasCounter } from './alvaras-counter'
import { AlvarasSubscriptionBox } from './alvaras-subscription-box'
import { PaymentDetails } from '../Modals/payment-details'
import { AlvarasTable } from './alvaras-table'

export function Alvaras() {
 const [city, setCity] = useState('')
 const [dateRange, setDateRange] = useState<DateRange | undefined>()
 const [selectedTypeFilter, setSelectedTypeFilter] = useState<
  'Todos' | 'AVCB' | 'CLCB'
 >('Todos')
 const [showPaymentModal, setShowPaymentModal] = useState(false)

 const { data: authUser, isLoading: loadingUser } = useUser()

 const safePlan = authUser?.plan ?? {
  name: '',
  monthly_credits: 0
 }

 const subscriptionData = {
  planName: safePlan.name,
  monthlyLimit: safePlan.monthly_credits,
  used: safePlan.monthly_credits - (authUser?.credits ?? 0),
  resetDate: authUser?.plan_renews_at
   ? new Date(authUser.plan_renews_at)
   : new Date()
 }

 const {
  alvarasData,
  searchAlvaras,
  searchResults,
  setSearchResults,
  releaseAlvaras,
  isActive,
  isLoading,
  flowState,
  setFlowState
 } = useAlvaras(subscriptionData)

 if (loadingUser) {
  return <p>Carregando...</p>
 }

 if (!authUser) {
  return <p>Erro ao carregar usuário.</p>
 }

 const extraAmount = searchResults
  ? calculateExtraAmount(searchResults.totalFound, searchResults.available)
  : 0

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

  const payload = buildSearchPayload(city, dateRange, selectedTypeFilter)

  if (!payload) {
   toast.info('Período inválido', {
    description: 'A data de término deve ser maior que a data de início.'
   })
   return
  }

  try {
   await searchAlvaras.mutateAsync(payload)
  } catch (error) {
   console.error(error)
   toast.error('Erro ao buscar alvarás')
  }
 }

 // Conditional rendering based on the user plan.
 if (!authUser.plan) {
  return (
   <div className="p-4 lg:p-6 space-y-6">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     Captação de Alvarás
    </h1>

    <Alert variant="destructive">
     <AlertCircle className="h-4 w-4" />
     <AlertDescription>
      <div className="space-y-3">
       <p className="font-semibold">
        Para requisitar alvarás, é necessário ter uma assinatura ativa.
       </p>
       <Button
        onClick={() =>
         toast.info('Em breve', {
          description: 'Página de planos em desenvolvimento.'
         })
        }
       >
        Ver Planos
       </Button>
      </div>
     </AlertDescription>
    </Alert>

    {/* Temporary button to simulate activation. */}
    <div className="mt-6">
     <Button
      variant="outline"
      onClick={() => {
       setFlowState('subscription-active')
       toast.success('Assinatura ativada', {
        description: 'Modo de teste ativado com sucesso.'
       })
      }}
     >
      Simular Assinatura Ativa (Teste)
     </Button>
    </div>
   </div>
  )
 }

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex items-center justify-between">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     Captação de Alvarás
    </h1>
    {flowState === 'alvaras-released' && (
     <Button
      onClick={() =>
       handleNewQuery(
        setFlowState,
        setSearchResults,
        setCity,
        setDateRange,
        setSelectedTypeFilter,
        setShowPaymentModal
       )
      }
      variant="outline"
     >
      Nova Consulta
     </Button>
    )}
   </div>

   {/* Box sobre a assinatura */}
   <AlvarasSubscriptionBox
    isActive={isActive}
    planName={subscriptionData.planName}
    monthlyLimit={subscriptionData.monthlyLimit}
    used={subscriptionData.used}
    resetDate={subscriptionData.resetDate}
   />

   {/* Filtros */}
   {(flowState === 'subscription-active' ||
    flowState === 'search-result' ||
    flowState === 'payment-required') && (
    <AlvarasFilters
     city={city}
     setCity={setCity}
     dateRange={dateRange}
     setDateRange={setDateRange}
     selectedType={selectedTypeFilter}
     setSelectedType={setSelectedTypeFilter}
     applyFilter={handleSearchAlvaras}
     isLoading={isLoading}
    />
   )}

   {/* Resultado da Busca */}
   {searchResults &&
    (flowState === 'search-result' || flowState === 'payment-required') && (
     <AlvarasCounter
      totalFound={searchResults.totalFound}
      available={searchResults.available}
      onRelease={() =>
       handleReleaseAlvaras({
        releaseAlvaras,
        totalFound: searchResults.totalFound
       })
      }
      onPayment={() => setShowPaymentModal(true)}
     />
    )}

   {/* Modal de Pagamento */}
   {flowState === 'payment-required' && (
    <PaymentDetails
     isOpen={showPaymentModal}
     onClose={() => setShowPaymentModal(false)}
     amount={extraAmount}
     onSuccess={() => handlePaymentSuccess(setFlowState)}
    />
   )}

   {/* Tabela de Alvarás Liberados */}
   {flowState === 'alvaras-released' && alvarasData.length > 0 && (
    <AlvarasTable alvarasData={alvarasData} />
   )}
  </div>
 )
}
