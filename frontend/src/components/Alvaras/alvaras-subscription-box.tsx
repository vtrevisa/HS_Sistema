import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { motion } from 'framer-motion'

interface AlvarasSubscriptionBoxProps {
 isActive: boolean
 planName: string
 monthlyLimit: number
 used: number
 resetDate: Date
}

export function AlvarasSubscriptionBox({
 isActive,
 planName,
 monthlyLimit,
 used,
 resetDate
}: AlvarasSubscriptionBoxProps) {
 const available = Math.max(monthlyLimit - used, 0)
 const usagePercentage =
  monthlyLimit > 0 ? Math.min((used / monthlyLimit) * 100, 100) : 0

 return (
  <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
   <div className="flex items-start justify-between">
    <div className="space-y-3 flex-1">
     <div className="flex items-center gap-2">
      {isActive ? (
       <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
       <AlertCircle className="h-5 w-5 text-destructive" />
      )}
      <h3 className="font-semibold text-lg">
       {isActive ? 'Assinatura Ativa' : 'Assinatura Inativa'}
      </h3>
      <Badge variant={isActive ? 'default' : 'destructive'}>{planName}</Badge>
     </div>

     {isActive && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
       <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Limite Mensal</p>
        <p className="text-2xl font-bold">{monthlyLimit}</p>
        <p className="text-xs text-muted-foreground">alvarás/mês</p>
       </div>

       <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Já Utilizados</p>
        <p className="text-2xl font-bold text-orange-600">{used}</p>
        <p className="text-xs text-muted-foreground">neste mês</p>
       </div>

       <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Disponíveis</p>
        <p className="text-2xl font-bold text-green-600">{available}</p>
        <p className="text-xs text-muted-foreground">restantes</p>
       </div>
      </div>
     )}

     {isActive && (
      <div className="space-y-2">
       <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Uso do plano</span>
        <span className="font-medium">{usagePercentage.toFixed(0)}%</span>
       </div>
       <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <motion.div
         className="bg-primary h-3 rounded-full"
         initial={{ width: 0 }}
         animate={{ width: `${usagePercentage}%` }}
         transition={{ duration: 0.6, ease: 'easeOut' }}
        />
       </div>
       <p className="text-xs text-muted-foreground">
        Renovação em: {resetDate.toLocaleDateString('pt-BR')}
       </p>
      </div>
     )}
    </div>
   </div>
  </Card>
 )
}
