import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, FileText, Loader2 } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import type { FlowState } from '@/http/use-alvaras'

interface AlvarasCounterProps {
 totalFound: number
 creditsAvailable: number
 extraNeeded: number
 flowState: FlowState
 isLoading: boolean
 onRelease?: () => void
 onPayment?: (creditsPackage: { credits: number; price: number }) => void
}

export function AlvarasCounter({
 totalFound,
 creditsAvailable,
 extraNeeded,
 flowState,
 isLoading,
 onRelease,
 onPayment
}: AlvarasCounterProps) {
 const [displayedAvailable, setDisplayedAvailable] = useState(creditsAvailable)
 const [displayedExtraNeeded, setDisplayedExtraNeeded] = useState(extraNeeded)

 useEffect(() => {
  const isStableState =
   flowState === 'alvaras-released' ||
   flowState === 'subscription-active' ||
   flowState === 'payment-required' ||
   flowState === 'no-subscription'

  if (isStableState) {
   if (displayedAvailable !== creditsAvailable) {
    setDisplayedAvailable(creditsAvailable)
   }
   if (displayedExtraNeeded !== extraNeeded) {
    setDisplayedExtraNeeded(extraNeeded)
   }
  } else if (
   flowState === 'search-result' &&
   displayedAvailable === 0 &&
   creditsAvailable > 0
  ) {
   setDisplayedAvailable(creditsAvailable)
   setDisplayedExtraNeeded(extraNeeded)
  }
 }, [
  flowState,
  creditsAvailable,
  extraNeeded,
  displayedAvailable,
  displayedExtraNeeded
 ])

 const safeCreditsAvailable = Math.max(displayedAvailable, 0)
 const needsPayment = displayedExtraNeeded > 0

 const creditPackages = [
  { credits: 50, price: 250 },
  { credits: 100, price: 400 },
  { credits: 250, price: 750 },
  { credits: 500, price: 0 }
 ]

 const [selectedPackage, setSelectedPackage] = useState(creditPackages[0])

 return (
  <Card className="p-6 my-6 border-2">
   <div className="flex flex-col md:flex-row items-start gap-4">
    <div className="p-3 rounded-full bg-primary/10">
     <FileText className="h-6 w-6 text-primary" />
    </div>

    <div className="flex-1 space-y-4">
     <div>
      <h3 className="text-2xl font-bold mb-2">
       Foram encontrados {totalFound} alvarás
      </h3>
      <p className="text-muted-foreground">com os filtros aplicados na busca</p>
     </div>

     {!needsPayment ? (
      <div className="flex items-center gap-2 text-green-600">
       <CheckCircle className="h-5 w-5" />
       <span className="font-medium">
        Dentro do seu limite disponível ({safeCreditsAvailable} alvarás
        restantes)
       </span>
      </div>
     ) : (
      <div className="space-y-3">
       <div className="flex items-center gap-2 text-orange-600">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">
         Sua solicitação excede os alvarás disponíveis no seu plano
        </span>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
        <div>
         <p className="text-xs text-muted-foreground">Total Requisitado</p>
         <p className="text-xl font-bold">{totalFound}</p>
        </div>
        <div>
         <p className="text-xs text-muted-foreground">Disponíveis</p>
         <p className="text-xl font-bold text-green-600">
          {safeCreditsAvailable}
         </p>
        </div>
        <div>
         <p className="text-xs text-muted-foreground">Excedente</p>
         <p className="text-xl font-bold text-orange-600">{extraNeeded}</p>
        </div>
        <div>
         <p className="text-xs text-muted-foreground">
          Escolha um pacote de créditos extras
         </p>
         <select
          value={selectedPackage.credits}
          onChange={e => {
           const credits = Number(e.target.value)
           const pkg = creditPackages.find(p => p.credits === credits)!
           setSelectedPackage(pkg)
          }}
          className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
         >
          {creditPackages.map(packages => (
           <option key={packages.credits} value={packages.credits}>
            {packages.credits} créditos -{' '}
            {packages.price > 0 ? `R$ ${packages.price}` : 'Consultar'}
           </option>
          ))}
         </select>
        </div>
       </div>

       {creditPackages.find(pkg => pkg.credits === selectedPackage.credits)
        ?.price === 0 ? (
        <p className="text-sm text-muted-foreground">
         Entre em contato com o consultor cliquei no botão abaixo.
        </p>
       ) : (
        <p className="text-sm text-muted-foreground">
         Selecione o pacote de créditos extras que deseja comprar.
        </p>
       )}
      </div>
     )}

     <div className="flex flex-col md:flex-row gap-3">
      {!needsPayment ? (
       <Button onClick={onRelease} size="lg">
        {isLoading ? (
         <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Liberando alvarás...
         </>
        ) : (
         <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Liberar Alvarás
         </>
        )}
       </Button>
      ) : (
       <>
        {creditPackages.find(pkg => pkg.credits === selectedPackage.credits)
         ?.price === 0 ? (
         <a
          href="https://wa.me/5599999999999?text=Olá! Gostaria de informações sobre o pacote de créditos acima de 250."
          target="_blank"
          rel="noopener noreferrer"
         >
          <Button
           size="lg"
           className="bg-green-600 hover:bg-green-700 text-white"
          >
           Contate o consultor pelo WhatsApp
          </Button>
         </a>
        ) : (
         // ✅ Botão normal de pagamento
         <Button
          onClick={() => onPayment && onPayment(selectedPackage)}
          size="lg"
         >
          Pagar Alvarás Extras
         </Button>
        )}
       </>
      )}
     </div>
    </div>
   </div>
  </Card>
 )
}
