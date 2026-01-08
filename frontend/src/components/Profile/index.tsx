import { useState } from 'react'
import { toast } from 'sonner'
import { ProfileData } from './profile-data'
import { ProfileSubscription } from './profile-subscription'
import { ProfileUpdatePlan } from '../Modals/profile-updateplan'
import { ProfileTabs } from './profile-tabs'
import { useUser } from '@/http/use-user'
import { usePlan } from '@/http/use-plan'
import { ProfileAdmin } from './admin/'

export function Profile() {
 const [showPlanSelectorModal, setShowPlanSelectorModal] = useState(false)

 const { user, isLoading } = useUser()
 const { requestPlanChangeMutation } = usePlan()

 const isAdmin = user.role === 'admin'

 if (isAdmin) {
  return <ProfileAdmin />
 }

 if (isLoading) return <p>Carregando...</p>

 if (!user) return null

 const subscription = {
  planId: user.plan.id,
  planName: user.plan.name,
  status: user.plan_active ? 'active' : 'inactive',
  creditsLimit: user.plan.monthly_credits,
  alvarasUsed: user.plan.monthly_used,
  nextBillingDate: user.plan.plan_renews_at,
  price: Number(user.plan.price)
 }

 function handleSelectPlan(planId: number) {
  requestPlanChangeMutation.mutate(
   { plan_id: planId },
   {
    onSuccess: data => {
     if (data.status) {
      toast.success(data.message || 'Solicitação enviada! Aguarde aprovação.')
      setShowPlanSelectorModal(false)
     } else {
      toast.error(data.message || 'Não foi possível solicitar a troca.')
     }
    },
    onError: () => {
     toast.error('Erro ao solicitar troca de plano.')
    }
   }
  )
 }

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
      Minha Conta
     </h1>
     <p className="text-muted-foreground">
      Gerencie suas informações pessoais e assinatura
     </p>
    </div>
   </div>

   <div className="grid gap-6 lg:grid-cols-3">
    <ProfileData user={user} />

    <ProfileSubscription
     subscriptionInfo={subscription}
     onOpenPlanSelector={() => setShowPlanSelectorModal(true)}
    />
   </div>

   <ProfileTabs user={user} />

   <ProfileUpdatePlan
    currentPlanId={subscription.planId}
    isOpen={showPlanSelectorModal}
    onClose={() => setShowPlanSelectorModal(false)}
    onSelectPlan={handleSelectPlan}
   />
  </div>
 )
}
