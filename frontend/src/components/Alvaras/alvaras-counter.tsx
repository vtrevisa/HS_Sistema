import { AlertTriangle, CheckCircle, FileText } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'

interface AlvarasCounterProps {
 totalFound: number
 available: number
 onRelease?: () => void
 onPayment?: () => void
}

export function AlvarasCounter({
 totalFound,
 available,
 onRelease,
 onPayment
}: AlvarasCounterProps) {
 const needsPayment = totalFound > available
 const excess = needsPayment ? totalFound - available : 0

 return (
  <Card className="p-6 my-6 border-2">
   <div className="flex items-start gap-4">
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
        Dentro do seu limite disponível ({available} alvarás)
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

       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
        <div>
         <p className="text-xs text-muted-foreground">Total Requisitado</p>
         <p className="text-xl font-bold">{totalFound}</p>
        </div>
        <div>
         <p className="text-xs text-muted-foreground">Disponíveis</p>
         <p className="text-xl font-bold text-green-600">{available}</p>
        </div>
        <div>
         <p className="text-xs text-muted-foreground">Excedente</p>
         <p className="text-xl font-bold text-orange-600">{excess}</p>
        </div>
        <div>
         <p className="text-xs text-muted-foreground">Valor Total</p>
         <p className="text-xl font-bold text-primary">
          R$ {(excess * 5).toFixed(2)}
         </p>
        </div>
       </div>

       <p className="text-sm text-muted-foreground">
        Valor por alvará extra: <strong>R$ 5,00</strong>
       </p>
      </div>
     )}

     <div className="flex gap-3">
      {!needsPayment ? (
       <Button onClick={onRelease} size="lg">
        <CheckCircle className="mr-2 h-4 w-4" />
        Liberar Alvarás
       </Button>
      ) : (
       <Button onClick={onPayment} size="lg">
        Pagar Alvarás Extras
       </Button>
      )}
     </div>
    </div>
   </div>
  </Card>
 )
}
