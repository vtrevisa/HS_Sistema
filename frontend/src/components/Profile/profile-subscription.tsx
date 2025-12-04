import { Crown, Zap } from 'lucide-react'
import { Badge } from '../ui/badge'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from '../ui/card'

import { Separator } from '../ui/separator'
import { Button } from '../ui/button'

interface ProfileSubscriptionProps {
 subscriptionInfo: {
  planId: number
  planName: string
  status: string
  creditsLimit: number
  alvarasUsed: number
  nextBillingDate: string
  price: number
 }
 onOpenPlanSelector: () => void
}

export function ProfileSubscription({
 subscriptionInfo,
 onOpenPlanSelector
}: ProfileSubscriptionProps) {
 const getStatusBadge = (status: string) => {
  switch (status) {
   case 'active':
    return (
     <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-600 hover:text-white">
      Ativa
     </Badge>
    )
   case 'inactive':
    return <Badge variant="destructive">Inativa</Badge>
   case 'pending':
    return <Badge variant="secondary">Pendente</Badge>
   default:
    return <Badge variant="outline">{status}</Badge>
  }
 }

 return (
  <>
   <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
    <CardHeader>
     <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
       <Crown className="h-5 w-5 text-primary" />
      </div>
      <div>
       <CardTitle className="flex items-center gap-2">
        Plano {subscriptionInfo.planName}
        {getStatusBadge(subscriptionInfo.status)}
       </CardTitle>
       <CardDescription>Sua assinatura atual</CardDescription>
      </div>
     </div>
    </CardHeader>
    <CardContent className="space-y-4">
     <div className="space-y-3">
      <div className="flex justify-between items-center">
       <span className="text-sm text-muted-foreground">
        Créditos disponíveis
       </span>
       <span className="font-semibold">
        {subscriptionInfo.creditsLimit - subscriptionInfo.alvarasUsed} /{' '}
        {subscriptionInfo.creditsLimit}
       </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
       <div
        className="bg-primary h-2 rounded-full transition-all"
        style={{
         width: `${
          (subscriptionInfo.alvarasUsed / subscriptionInfo.creditsLimit) * 100
         }%`
        }}
       />
      </div>
      <p className="text-xs text-muted-foreground">
       {subscriptionInfo.alvarasUsed} alvarás utilizados este mês
      </p>
     </div>

     <Separator />

     <div className="space-y-2">
      <div className="flex justify-between items-center">
       <span className="text-sm text-muted-foreground">Valor mensal</span>
       <span className="font-bold text-lg">
        R$ {subscriptionInfo.price.toFixed(2).replace('.', ',')}
       </span>
      </div>
      <div className="flex justify-between items-center">
       <span className="text-sm text-muted-foreground">Próxima cobrança</span>
       <span className="text-sm">
        {new Date(subscriptionInfo.nextBillingDate).toLocaleDateString('pt-BR')}
       </span>
      </div>
     </div>

     <Button className="w-full mt-4" onClick={onOpenPlanSelector}>
      <Zap className="h-4 w-4 mr-2" />
      Alterar Plano
     </Button>
    </CardContent>
   </Card>
  </>
 )
}
