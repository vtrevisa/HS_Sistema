import { useEffect } from 'react'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle
} from '../ui/dialog'
import { usePayments } from '@/http/use-payments'

interface PaymentDetailsProps {
 isOpen: boolean
 onClose: () => void
 creditsPackage: { credits: number; price: number }
 onSuccess: () => void
}

export function PaymentDetails({
 isOpen,
 onClose,
 creditsPackage,
 onSuccess
}: PaymentDetailsProps) {
 //const checkoutUrl = `https://pay.hotmart.com/SEU_CHECKOUT?credits=${creditsPackage.credits}&price=${creditsPackage.price}`

 const purchaseCredits = usePayments()

 const mockUrl = `/mock-checkout.html?price=${creditsPackage.price}&credits=${creditsPackage.credits}`

 useEffect(() => {
  function handleMessage(event: MessageEvent) {
   if (event.data?.status === 'paid') {
    const transactionId = event.data?.transaction_id || `TID-${Date.now()}`

    // ✅ REGISTRAR A COMPRA NO BACKEND
    purchaseCredits.mutate({
     credits: creditsPackage.credits,
     amount_paid: creditsPackage.price,
     payment_method: 'mock-hotmart',
     transaction_id: transactionId
    })

    // ✅ feedback visual / avançar fluxo
    onSuccess()
    onClose()
   }
  }

  window.addEventListener('message', handleMessage)
  return () => window.removeEventListener('message', handleMessage)
 }, [
  purchaseCredits,
  creditsPackage.credits,
  creditsPackage.price,
  onClose,
  onSuccess
 ])

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="sm:max-w-md">
    <DialogHeader>
     <DialogTitle className="flex items-center gap-2">
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
       <span className="text-sm text-muted-foreground">Créditos:</span>
       <span className="text-2xl font-bold text-primary">
        {creditsPackage.credits}
       </span>
      </div>
      <div className="flex justify-between items-center mt-1">
       <span className="text-sm text-muted-foreground">Valor a pagar:</span>
       <span className="text-2xl font-bold text-primary">
        R$ {creditsPackage.price.toFixed(2)}
       </span>
      </div>
     </div>

     <iframe src={mockUrl} width="100%" height="650" frameBorder="0"></iframe>

     <p className="text-xs text-center text-muted-foreground">
      O pagamento será processado via Hotmart.
     </p>
    </div>
   </DialogContent>
  </Dialog>
 )
}
