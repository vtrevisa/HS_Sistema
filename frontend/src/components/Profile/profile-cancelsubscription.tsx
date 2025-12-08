import { useState } from 'react'
import { toast } from 'sonner'
import {
 AlertTriangle,
 Calendar,
 CheckCircle,
 CreditCard,
 XCircle
} from 'lucide-react'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from '../ui/card'
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Textarea } from '../ui/textarea'

interface ProfileCancelSubscriptionProps {
 planName: string
 nextBillingDate: string
 onCancel?: () => void
}

const cancellationReasons = [
 { id: 'expensive', label: 'O preço está muito alto' },
 { id: 'not-using', label: 'Não estou usando o suficiente' },
 { id: 'missing-features', label: 'Faltam funcionalidades que preciso' },
 { id: 'switching', label: 'Estou mudando para outro serviço' },
 { id: 'temporary', label: 'Preciso pausar temporariamente' },
 { id: 'other', label: 'Outro motivo' }
]

export function ProfileCancelSubscription({
 planName,
 nextBillingDate,
 onCancel
}: ProfileCancelSubscriptionProps) {
 const [selectedReason, setSelectedReason] = useState('')
 const [additionalComments, setAdditionalComments] = useState('')
 const [isProcessing, setIsProcessing] = useState(false)
 const [isCancelled, setIsCancelled] = useState(false)

 async function handleCancelSubscription() {
  if (!selectedReason) {
   toast.error('Por favor, selecione um motivo para o cancelamento')
   return
  }

  setIsProcessing(true)

  // TODO: Integrate with backend
  // await new Promise(resolve => setTimeout(resolve, 2000))

  setIsProcessing(false)
  setIsCancelled(true)
  toast.success(
   'Assinatura cancelada. Você ainda terá acesso até o fim do período pago.'
  )
  onCancel?.()
 }

 if (isCancelled) {
  return (
   <Card className="border-yellow-500/20 bg-yellow-500/5">
    <CardHeader>
     <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
       <Calendar className="h-5 w-5 text-yellow-600" />
      </div>
      <div>
       <CardTitle className="text-yellow-600">Cancelamento Agendado</CardTitle>
       <CardDescription>Sua assinatura será encerrada em breve</CardDescription>
      </div>
     </div>
    </CardHeader>
    <CardContent className="space-y-4">
     <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
      <div className="flex items-start gap-3">
       <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
       <div>
        <p className="font-medium text-yellow-600">Cancelamento confirmado</p>
        <p className="text-sm text-muted-foreground mt-1">
         Você continuará tendo acesso ao plano {planName} até{' '}
         <strong>
          {new Date(nextBillingDate).toLocaleDateString('pt-BR')}
         </strong>
         . Após essa data, sua conta será convertida para o plano gratuito.
        </p>
       </div>
      </div>
     </div>

     <Button
      variant="outline"
      className="w-full"
      onClick={() => {
       setIsCancelled(false)
       toast.success('Cancelamento revertido! Sua assinatura continua ativa.')
      }}
     >
      Reverter Cancelamento
     </Button>
    </CardContent>
   </Card>
  )
 }

 return (
  <Card className="border-destructive/20">
   <CardHeader>
    <div className="flex items-center gap-3">
     <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
      <XCircle className="h-5 w-5 text-destructive" />
     </div>
     <div>
      <CardTitle>Cancelar Assinatura</CardTitle>
      <CardDescription>Encerrar seu plano {planName}</CardDescription>
     </div>
    </div>
   </CardHeader>
   <CardContent className="space-y-4">
    <div className="p-4 rounded-lg bg-muted/50 border">
     <div className="flex items-start gap-3">
      <CreditCard className="h-5 w-5 text-muted-foreground" />
      <div className="text-sm">
       <p className="font-medium">Ao cancelar você perderá:</p>
       <ul className="mt-2 space-y-1 text-muted-foreground">
        <li>• Acesso a 200 alvarás mensais</li>
        <li>• CRM completo de gestão de leads e pipeline</li>
        <li>• Busca de dados empresariais</li>
        <li>• Suporte prioritário</li>
       </ul>
      </div>
     </div>
    </div>

    <AlertDialog>
     <AlertDialogTrigger asChild>
      <Button variant="destructive" className="w-full">
       <AlertTriangle className="h-4 w-4 mr-2" />
       Cancelar Assinatura
      </Button>
     </AlertDialogTrigger>
     <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
       <AlertDialogTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        Confirmar Cancelamento
       </AlertDialogTitle>
       <AlertDialogDescription>
        Antes de cancelar, por favor nos conte o motivo. Isso nos ajuda a
        melhorar.
       </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-4 py-4">
       <div className="space-y-3">
        <Label>Por que você está cancelando?</Label>
        <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
         {cancellationReasons.map(reason => (
          <div key={reason.id} className="flex items-center space-x-2">
           <RadioGroupItem value={reason.id} id={reason.id} />
           <Label htmlFor={reason.id} className="font-normal cursor-pointer">
            {reason.label}
           </Label>
          </div>
         ))}
        </RadioGroup>
       </div>

       <div className="space-y-2">
        <Label htmlFor="comments">Comentários adicionais (opcional)</Label>
        <Textarea
         id="comments"
         placeholder="Conte-nos mais sobre sua experiência..."
         value={additionalComments}
         onChange={e => setAdditionalComments(e.target.value)}
         rows={3}
        />
       </div>

       <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <p className="text-sm text-yellow-600">
         <strong>Importante:</strong> Você continuará tendo acesso até{' '}
         {new Date(nextBillingDate).toLocaleDateString('pt-BR')}.
        </p>
       </div>
      </div>

      <AlertDialogFooter>
       <AlertDialogCancel className="w-full">
        Manter Assinatura
       </AlertDialogCancel>
       <AlertDialogAction
        onClick={handleCancelSubscription}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        disabled={isProcessing || !selectedReason}
       >
        {isProcessing ? 'Processando...' : 'Confirmar Cancelamento'}
       </AlertDialogAction>
      </AlertDialogFooter>
     </AlertDialogContent>
    </AlertDialog>
   </CardContent>
  </Card>
 )
}
