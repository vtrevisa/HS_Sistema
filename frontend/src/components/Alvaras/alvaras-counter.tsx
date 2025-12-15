import { useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface AlvarasCounterProps {
 totalFound: number
 creditsAvailable: number
 used: number
 extraNeeded: number
 isLoading: boolean
 quantity: number
 onRelease?: () => void
 onQuantityChange: (value: string) => void
 onPayment?: (creditsPackage: { credits: number; price: number }) => void
}

export function AlvarasCounter({
 totalFound,
 creditsAvailable,
 used,
 quantity,
 extraNeeded,
 isLoading,
 onRelease,
 onQuantityChange,
 onPayment
}: AlvarasCounterProps) {
 const safeCreditsAvailable = Math.max(creditsAvailable, 0)
 const needsPayment = extraNeeded > 0

 const creditPackages = [
  { credits: 50, price: 250 },
  { credits: 100, price: 400 },
  { credits: 250, price: 750 },
  { credits: 500, price: 0 }
 ]

 const [selectedPackage, setSelectedPackage] = useState(creditPackages[0])

 return (
  <Card className="p-6 my-6">
   <h2 className="text-xl font-semibold mb-4">Resultado da Busca</h2>

   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="p-4 rounded-lg bg-muted">
     <p className="text-sm text-muted-foreground">Alvarás Encontrados</p>
     <p className="text-2xl font-bold">{totalFound}</p>
    </div>
    <div className="p-4 rounded-lg bg-muted">
     <p className="text-sm text-muted-foreground">Disponíveis no Plano</p>
     <p className="text-2xl font-bold text-green-600">{safeCreditsAvailable}</p>
    </div>
    <div className="p-4 rounded-lg bg-muted">
     <p className="text-sm text-muted-foreground">Já Utilizados</p>
     <p className="text-2xl font-bold text-orange-600">{used}</p>
    </div>
   </div>

   <div className="space-y-4">
    <div className="space-y-2">
     <Label htmlFor="quantidade">Quantidade de Alvarás a Consumir *</Label>
     <div className="flex items-center gap-4">
      <Input
       id="quantidade"
       type="text"
       inputMode="numeric"
       pattern="[0-9]*"
       value={quantity}
       onChange={e => onQuantityChange(e.target.value)}
       className="w-32"
       placeholder="Digite a quantidade"
      />
      <span className="text-sm text-muted-foreground">
       de {totalFound} disponíveis
      </span>
     </div>
    </div>

    {needsPayment && (
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
  </Card>
 )
}
