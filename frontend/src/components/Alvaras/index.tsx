import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { useUser } from '@/http/use-user'
import { useAlvaras } from '@/http/use-alvaras'

import { buildSearchPayload, handleQuantityChange } from '@/services/alvaras'

import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'

import { AlvarasFilters } from './alvaras-filters'
import { AlvarasCounter } from './alvaras-counter'
import { AlvarasSubscriptionBox } from './alvaras-subscription-box'
import { PaymentDetails } from '../Modals/payment-details'
import { ProfileUpdatePlan } from '../Modals/profile-updateplan'
import { MyAlvaras } from './my-alvaras'

export function Alvaras() {
 const [city, setCity] = useState('')
 const [dateRange, setDateRange] = useState<DateRange | undefined>()
 const [selectedTypeFilter, setSelectedTypeFilter] = useState<
  'Todos' | 'AVCB' | 'CLCB'
 >('Todos')
 const [quantity, setQuantity] = useState(0)
 const [showPlansModal, setShowPlansModal] = useState(false)
 const [showPaymentModal, setShowPaymentModal] = useState(false)

 const [selectedCreditsPackage, setSelectedCreditsPackage] = useState<{
  credits: number
  price: number
 } | null>(null)

 const { user, isLoading: loadingUser } = useUser()

 const safePlan = user?.plan ?? {
  name: '',
  monthly_credits: 0,
  monthly_used: 0,
  credits: 0,
  plan_renews_at: new Date()
 }

 const monthlyLimit = safePlan.monthly_credits
 const usedMonthly = safePlan.monthly_used ?? 0

 const subscriptionData = {
  planName: safePlan.name,
  monthlyLimit,
  used: usedMonthly,
  credits: safePlan.credits,
  resetDate: safePlan.plan_renews_at
   ? new Date(safePlan.plan_renews_at)
   : new Date()
 }

 const {
  flowState,
  isActive,

  consumedAlvaras,
  exportAlvaras,

  searchResults,

  searchAlvaras,
  releaseAlvaras,

  startNewQuery,
  cancelNewQuery
 } = useAlvaras(subscriptionData)

 useEffect(() => {
  if (searchResults?.totalFound) {
   setQuantity(searchResults.totalFound)
  }
 }, [searchResults?.totalFound])

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

 function handleNewQuery() {
  startNewQuery()
  setCity('')
  setDateRange(undefined)
  setSelectedTypeFilter('Todos')
  setQuantity(0)
 }

 function handleCancelSearch() {
  cancelNewQuery()
  setCity('')
  setDateRange(undefined)
  setSelectedTypeFilter('Todos')
  setQuantity(0)
 }

 function handleExportAlvaras() {
  const alvaraIds = consumedAlvaras
   .filter(alvara => !alvara.exported_at)
   .map(alvara => alvara.id)

  if (alvaraIds.length === 0) {
   toast.warning('Nenhum alvará disponível para exportação')
   return
  }

  exportAlvaras.mutate({
   alvara_ids: alvaraIds
  })
 }

 if (loadingUser) return <p>Carregando...</p>
 if (!user) return <p>Erro ao carregar usuário.</p>

 // Conditional rendering based on the user plan.
 if (!user.plan) {
  return (
   <div className="p-4 lg:p-6 space-y-6">
    <h1 className="text-3xl font-bold text-foreground">Captação de Alvarás</h1>

    <Alert
     variant="destructive"
     className="border-primary dark:border-primary text-primary [&>svg]:text-primary"
    >
     <AlertCircle className="h-4 w-4" />
     <AlertDescription>
      <div className="space-y-3">
       <p className="font-semibold">
        Para requisitar alvarás, é necessário ter uma assinatura ativa.
       </p>
       <Button onClick={() => setShowPlansModal(true)}>Ver Planos</Button>
      </div>
     </AlertDescription>
    </Alert>

    <ProfileUpdatePlan
     isOpen={showPlansModal}
     onClose={() => setShowPlansModal(false)}
    />
   </div>
  )
 }

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold text-foreground">Captação de Alvarás</h1>
    {flowState === 'alvaras-released' && (
     <Button onClick={handleNewQuery} variant="outline">
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
    available={subscriptionData.credits}
    resetDate={subscriptionData.resetDate}
    flowState={flowState}
   />

   {/* Seção Meus Alvarás - visível quando não está no fluxo de busca */}

   {flowState === 'my-alvaras' && (
    <MyAlvaras
     alvaras={consumedAlvaras}
     onNewQuery={handleNewQuery}
     onExport={() => handleExportAlvaras()}
    />
   )}

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
     cancelSearch={handleCancelSearch}
     isLoading={searchAlvaras.isPending}
    />
   )}

   {/* Resultado da Busca */}
   {searchResults &&
    (flowState === 'search-result' || flowState === 'payment-required') && (
     <AlvarasCounter
      totalFound={searchResults.totalFound}
      creditsAvailable={searchResults.available}
      used={subscriptionData.used}
      extraNeeded={searchResults.extraNeeded ?? 0}
      quantity={quantity}
      isLoading={releaseAlvaras.isPending}
      onQuantityChange={(value: string) => {
       setQuantity(handleQuantityChange(value, searchResults.totalFound))
      }}
      onRelease={() =>
       releaseAlvaras.mutate({
        totalToRelease: quantity,
        city,
        service_type: selectedTypeFilter,
        period_start: dateRange!.from!.toISOString().split('T')[0],
        period_end: dateRange!.to!.toISOString().split('T')[0]
       })
      }
      onPayment={pkg => {
       setSelectedCreditsPackage(pkg)
       setShowPaymentModal(true)
      }}
     />
    )}

   {/* Modal de Pagamento */}
   {flowState === 'payment-required' && selectedCreditsPackage && (
    <PaymentDetails
     isOpen={showPaymentModal}
     onClose={() => setShowPaymentModal(false)}
     creditsPackage={selectedCreditsPackage}
     onSuccess={() =>
      releaseAlvaras.mutate({
       totalToRelease: quantity,
       city,
       service_type: selectedTypeFilter,
       period_start: dateRange!.from!.toISOString().split('T')[0],
       period_end: dateRange!.to!.toISOString().split('T')[0]
      })
     }
    />
   )}
  </div>
 )
}
