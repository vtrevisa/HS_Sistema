import type { Alvaras } from '@/http/types/dashboard'
import { AlertTriangle, CircleAlert } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface AlvarasAlertProps {
 alvaras: Alvaras[]
}

export function AlvarasAlert({ alvaras }: AlvarasAlertProps) {
 const getStatusStyle = (status: string) => {
  switch (status) {
   case 'vencendo-hoje':
    return 'bg-brand-success/20 text-brand-success'
   case 'vencido':
    return 'bg-destructive/10 text-destructive'
   case 'ate-60-dias':
    return 'bg-accent text-accent-foreground'
   default:
    return 'bg-muted text-muted-foreground'
  }
 }

 const getStatusLabel = (status: string) => {
  switch (status) {
   case 'vencendo-hoje':
    return 'Vencendo Hoje'
   case 'vencido':
    return 'Vencido'
   case 'ate-60-dias':
    return 'Próximo do Vencimento'
   default:
    return status
  }
 }

 if (alvaras.length === 0) {
  return (
   <Card className="h-[110px]">
    <CardContent className="pt-6">
     <div className="text-center text-foreground">
      <CircleAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Nenhum alvará encontrado!</p>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="bg-card rounded-xl shadow-lg p-4 lg:p-6 border-l-4 border border-primary">
   <h2 className="text-lg lg:text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
    <AlertTriangle size={20} />
    Lista de Alvarás Vencendo
   </h2>
   <div className="space-y-4">
    {alvaras.map((alvara, index) => {
     return (
      <div
       key={index}
       className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors gap-2 sm:gap-0"
      >
       <div>
        <p className="font-semibold text-card-foreground text-sm lg:text-base">
         {alvara.company}
        </p>
        <p className="text-sm text-muted-foreground">{alvara.type}</p>
       </div>

       <div className="text-left sm:text-right">
        <span
         className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(alvara.status)}`}
        >
         {getStatusLabel(alvara.status)}
        </span>
        <p className="text-xs text-muted-foreground mt-1">
         Vence: {new Date(alvara.validity).toLocaleDateString('pt-BR')}
        </p>
       </div>
      </div>
     )
    })}
   </div>
  </div>
 )
}
