import { useState } from 'react'
import {
 ChevronsLeftRightEllipsis,
 CreditCard,
 Lock,
 Receipt,
 Shield
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ProfilePlan } from './profile-plan'
import { ProfilePaymentHistory } from './profile-paymenthistory'
import { ProfileSecurity } from './profile-security'
import { ProfileCancelSubscription } from './profile-cancelsubscription'
import type { UserRequest } from '@/http/types/user'
import { ProfileLinks } from './profile-links'

const mockSubscription = {
 planId: 1,
 planName: 'Básico',
 status: 'active',
 creditsLimit: 200,
 alvarasUsed: 45,
 nextBillingDate: '2025-01-04',
 price: 800
}

interface ProfileTabsProps {
 user: UserRequest
}

export function ProfileTabs({ user }: ProfileTabsProps) {
 const [subscription] = useState(mockSubscription)

 return (
  <Tabs defaultValue="plan-features" className="w-full">
   <TabsList className="grid w-full grid-cols-5">
    <TabsTrigger value="plan-features" className="flex items-center gap-2">
     <Shield className="h-4 w-4" />
     <span className="hidden sm:inline">Recursos</span>
    </TabsTrigger>
    <TabsTrigger value="payments" className="flex items-center gap-2">
     <Receipt className="h-4 w-4" />
     <span className="hidden sm:inline">Pagamentos</span>
    </TabsTrigger>
    <TabsTrigger value="security" className="flex items-center gap-2">
     <Lock className="h-4 w-4" />
     <span className="hidden sm:inline">Segurança</span>
    </TabsTrigger>
    <TabsTrigger value="vinculacoes" className="flex items-center gap-2">
     <ChevronsLeftRightEllipsis className="h-4 w-4" />
     <span className="hidden sm:inline">Vinculações</span>
    </TabsTrigger>
    <TabsTrigger
     value="cancel"
     className="flex items-center gap-2 text-destructive"
    >
     <CreditCard className="h-4 w-4" />
     <span className="hidden sm:inline">Cancelar</span>
    </TabsTrigger>
   </TabsList>
   <TabsContent value="plan-features" className="mt-6">
    <ProfilePlan user={user} />
   </TabsContent>
   <TabsContent value="payments" className="mt-6">
    <ProfilePaymentHistory />
   </TabsContent>
   <TabsContent value="security" className="mt-6">
    <div className="max-w-md">
     <ProfileSecurity />
    </div>
   </TabsContent>
   <TabsContent value="vinculacoes" className="mt-6">
    <ProfileLinks user={user} />
   </TabsContent>
   <TabsContent value="cancel" className="mt-6">
    <div className="max-w-md">
     <ProfileCancelSubscription
      planName={subscription.planName}
      nextBillingDate={subscription.nextBillingDate}
     />
    </div>
   </TabsContent>
  </Tabs>
 )
}
