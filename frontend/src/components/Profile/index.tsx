import { useState } from 'react'
import { ProfileData } from './profile-data'
import { ProfileSubscription } from './profile-subscription'
import { ProfileUpdatePlan } from '../Modals/profile-updateplan'
import { ProfileTabs } from './profile-tabs'

const mockSubscription = {
 planId: 1,
 planName: 'Básico',
 status: 'active',
 creditsLimit: 200,
 alvarasUsed: 45,
 nextBillingDate: '2025-01-04',
 price: 800
}

export function Profile() {
 const [subscription] = useState(mockSubscription)
 const [showPlanSelectorModal, setShowPlanSelectorModal] = useState(false)

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
    <ProfileData />

    <ProfileSubscription
     subscriptionInfo={subscription}
     onOpenPlanSelector={() => setShowPlanSelectorModal(true)}
    />
   </div>

   <ProfileTabs />

   <ProfileUpdatePlan
    currentPlanId={subscription.planId}
    isOpen={showPlanSelectorModal}
    onClose={() => setShowPlanSelectorModal(false)}
    onSelectPlan={(planId: number) => {
     // TODO: Integrate with backend
     console.log(planId)
     setShowPlanSelectorModal(false)
    }}
   />
  </div>
 )
}
