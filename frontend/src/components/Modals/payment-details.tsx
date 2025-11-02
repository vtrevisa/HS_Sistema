import { useState } from 'react'
import { CreditCard, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle
} from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface PaymentDetailsProps {
 isOpen: boolean
 onClose: () => void
 amount: number
 onSuccess: () => void
}

export function PaymentDetails({
 isOpen,
 onClose,
 amount,
 onSuccess
}: PaymentDetailsProps) {
 const [isProcessing, setIsProcessing] = useState(false)
 const [cardName, setCardName] = useState('')
 const [cardNumber, setCardNumber] = useState('')
 const [cardExpiry, setCardExpiry] = useState('')
 const [cardCvv, setCardCvv] = useState('')

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
   toast.info('Campos obrigatórios', {
    description: 'Por favor, preencha todos os campos do cartão.'
   })
   return
  }

  setIsProcessing(true)

  // Simulate payment processing
  setTimeout(() => {
   setIsProcessing(false)
   toast.success('Pagamento realizado com sucesso!', {
    description: `Valor de R$ ${amount.toFixed(
     2
    )} processado. Seus alvarás estão sendo liberados.`
   })
   onSuccess()
   onClose()

   // Clean fields
   setCardName('')
   setCardNumber('')
   setCardExpiry('')
   setCardCvv('')
  }, 2000)
 }

 const formatCardNumber = (value: string) => {
  const cleaned = value.replace(/\s/g, '')
  const chunks = cleaned.match(/.{1,4}/g)
  return chunks ? chunks.join(' ') : cleaned
 }

 const formatExpiry = (value: string) => {
  const cleaned = value.replace(/\//g, '')
  if (cleaned.length >= 2) {
   return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
  }
  return cleaned
 }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="sm:max-w-md">
    <DialogHeader>
     <DialogTitle className="flex items-center gap-2">
      <CreditCard className="h-5 w-5" />
      Pagamento de Alvarás Extras
     </DialogTitle>
     <DialogDescription>
      Complete o pagamento para liberar seus alvarás adicionais
     </DialogDescription>
    </DialogHeader>

    <div className="space-y-6">
     {/* Payment Summary */}
     <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
      <div className="flex justify-between items-center">
       <span className="text-sm text-muted-foreground">Valor a pagar:</span>
       <span className="text-2xl font-bold text-primary">
        R$ {amount.toFixed(2)}
       </span>
      </div>
     </div>

     {/* Card Application Form (Simulated) */}
     <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
       <Label htmlFor="cardName">Nome no cartão</Label>
       <Input
        id="cardName"
        placeholder="João da Silva"
        value={cardName}
        onChange={e => setCardName(e.target.value)}
        disabled={isProcessing}
       />
      </div>

      <div className="space-y-2">
       <Label htmlFor="cardNumber">Número do cartão</Label>
       <Input
        id="cardNumber"
        placeholder="1234 5678 9012 3456"
        maxLength={19}
        value={cardNumber}
        onChange={e => setCardNumber(formatCardNumber(e.target.value))}
        disabled={isProcessing}
       />
      </div>

      <div className="grid grid-cols-2 gap-4">
       <div className="space-y-2">
        <Label htmlFor="cardExpiry">Validade</Label>
        <Input
         id="cardExpiry"
         placeholder="MM/AA"
         maxLength={5}
         value={cardExpiry}
         onChange={e => setCardExpiry(formatExpiry(e.target.value))}
         disabled={isProcessing}
        />
       </div>

       <div className="space-y-2">
        <Label htmlFor="cardCvv">CVV</Label>
        <Input
         id="cardCvv"
         type="password"
         placeholder="123"
         maxLength={4}
         value={cardCvv}
         onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
         disabled={isProcessing}
        />
       </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
       <Lock className="h-3 w-3" />
       <span>Pagamento seguro e criptografado</span>
      </div>

      <Button
       type="submit"
       className="w-full"
       size="lg"
       disabled={isProcessing}
      >
       {isProcessing ? (
        <>
         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
         Processando pagamento...
        </>
       ) : (
        <>
         <CreditCard className="mr-2 h-4 w-4" />
         Confirmar Pagamento
        </>
       )}
      </Button>
     </form>

     <p className="text-xs text-center text-muted-foreground">
      Este é um simulador. Nenhum valor real será cobrado.
     </p>
    </div>
   </DialogContent>
  </Dialog>
 )
}
