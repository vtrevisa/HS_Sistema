import { Building2, Check, Star, Zap } from 'lucide-react'
import {
 Dialog,
 DialogDescription,
 DialogHeader,
 DialogTitle
} from '../ui/dialog'
import { DialogContent } from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

interface ProfileUpdatePlanProps {
 id: number
 name: string
 price: string
 creditsLimit: number | string
 description: string
 features: string[]
 icon: React.ReactNode
 popular?: boolean
}

interface PlanSelectorProps {
 currentPlanId: number
 isOpen: boolean
 onClose: () => void
 onSelectPlan: (planId: number) => void
}

const plans: ProfileUpdatePlanProps[] = [
 {
  id: 1,
  name: 'Básico',
  price: '800.00',
  creditsLimit: 200,
  description: 'Ideal para quem está começando',
  icon: <Zap className="h-6 w-6" />,
  popular: true,
  features: [
   '200 alvarás por mês',
   'CRM completo',
   'Aprimoramento de dados empresariais',
   'Pipeline de vendas',
   'Gestão de leads',
   'Suporte por e-mail e whatsapp'
  ]
 },
 {
  id: 2,
  name: 'Avançado',
  price: '1500.00',
  creditsLimit: 500,
  description: 'Para profissionais que querem crescer',
  icon: <Star className="h-6 w-6" />,
  popular: false,
  features: [
   '500 alvarás por mês',
   'CRM completo',
   'Aprimoramento de dados empresariais',
   'Pipeline de vendas',
   'Gestão de leads',
   'Suporte por e-mail e whatsapp'
  ]
 },
 {
  id: 3,
  name: 'Premium',
  price: 'customizado',
  creditsLimit: 'customizado',
  description: 'Sem limites para sua operação',
  icon: <Building2 className="h-6 w-6" />,
  features: [
   'Alvarás ilimitados',
   'CRM completo',
   'Aprimoramento de dados empresariais',
   'Pipeline de vendas',
   'Gestão de leads',
   'Suporte por e-mail e whatsapp'
  ]
 }
]

export function ProfileUpdatePlan({
 currentPlanId,
 isOpen,
 onClose,
 onSelectPlan
}: PlanSelectorProps) {
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
     <DialogTitle className="text-2xl">Escolha seu plano</DialogTitle>
     <DialogDescription>
      Selecione o plano ideal para suas necessidades. Você pode alterar a
      qualquer momento.
     </DialogDescription>
    </DialogHeader>

    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
     {plans.map(plan => {
      const isCurrent = plan.id === currentPlanId

      return (
       <div
        key={plan.id}
        className={cn(
         'relative flex flex-col p-5 rounded-xl border-2 transition-all',
         plan.popular
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border hover:border-primary/50',
         isCurrent && 'ring-2 ring-primary ring-offset-2'
        )}
       >
        {plan.popular && (
         <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Mais Popular
         </Badge>
        )}

        {isCurrent && (
         <Badge variant="secondary" className="absolute -top-3 right-4">
          Atual
         </Badge>
        )}

        <div className="flex items-center gap-3 mb-3">
         <div
          className={cn(
           'h-10 w-10 rounded-lg flex items-center justify-center',
           plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
         >
          {plan.icon}
         </div>
         <div>
          <h3 className="font-semibold">{plan.name}</h3>
          <p className="text-xs text-muted-foreground">{plan.description}</p>
         </div>
        </div>

        <div className="mb-4">
         <>
          {plan.price === 'customizado' ? (
           <span className="text-3xl font-bold">
            {plan.price.replace('.', ',')}
           </span>
          ) : (
           <>
            <span className="text-3xl font-bold">
             R$ {plan.price.replace('.', ',')}
            </span>
            <span className="text-muted-foreground">/mês</span>
           </>
          )}
         </>
        </div>

        <div className="flex-1 space-y-2 mb-4">
         {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
           <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
           <span>{feature}</span>
          </div>
         ))}
        </div>

        <Button
         variant={
          isCurrent ? 'secondary' : plan.popular ? 'default' : 'outline'
         }
         className="w-full"
         disabled={isCurrent}
         onClick={() => onSelectPlan(plan.id)}
        >
         {isCurrent ? 'Plano Atual' : 'Selecionar'}
        </Button>
       </div>
      )
     })}
    </div>

    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
     <p className="text-sm text-muted-foreground text-center">
      💡 <strong>Dica:</strong> Ao fazer upgrade, você terá acesso imediato aos
      novos recursos. Ao fazer downgrade, as mudanças entrarão em vigor no
      próximo ciclo de cobrança.
     </p>
    </div>
   </DialogContent>
  </Dialog>
 )
}
