import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { useCLCB } from '@/contexts/CLCBContext'

export function ChecklistNotifications() {
 const { processos } = useCLCB()
 const navigate = useNavigate()

 // Buscar processos com checklists pendentes
 const processosComPendencias = processos.filter(processo => {
  if (!processo.checklists || processo.progresso === 100) return false

  const temItensPendentes = processo.checklists.some(checklist =>
   checklist.items.some(item => !item.concluido)
  )

  return temItensPendentes
 })

 // Buscar processos com baixo progresso há muito tempo
 const processosAtrasados = processosComPendencias.filter(processo => {
  const createdDate = new Date(processo.createdAt)
  const today = new Date()
  const daysSinceCreated = Math.ceil(
   (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSinceCreated > 7 && processo.progresso < 50
 })

 if (processosComPendencias.length === 0) {
  return (
   <Card>
    <CardContent className="pt-6">
     <div className="text-center text-gray-500">
      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Todos os checklists estão em dia!</p>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="space-y-4">
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2 text-lg">
      <Clock className="h-5 w-5 text-orange-600" />
      Checklists Pendentes
      <Badge variant="secondary">{processosComPendencias.length}</Badge>
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="space-y-3">
      {processosComPendencias.slice(0, 5).map(processo => {
       const pendingItems =
        processo.checklists?.reduce(
         (acc, checklist) =>
          acc + checklist.items.filter(item => !item.concluido).length,
         0
        ) || 0

       const isAtrasado = processosAtrasados.some(p => p.id === processo.id)

       return (
        <div
         key={processo.id}
         className={`p-3 border rounded-lg ${
          isAtrasado ? 'border-red-200 bg-red-50' : 'border-gray-200'
         }`}
        >
         <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
           <Badge variant="outline">{processo.tipoServico}</Badge>
           <span className="font-medium text-sm">
            {processo.responsavelInterno}
           </span>
           {isAtrasado && <AlertTriangle className="h-4 w-4 text-red-600" />}
          </div>
          <Button
           size="sm"
           variant="ghost"
           onClick={() => navigate('/clcb')}
           className="text-xs"
          >
           Ver detalhes
           <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
         </div>

         <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
           <span>{pendingItems} itens pendentes</span>
           <span>{processo.progresso}% concluído</span>
          </div>
          <Progress value={processo.progresso} className="h-1.5" />
         </div>

         {isAtrasado && (
          <div className="mt-2 text-xs text-red-700 flex items-center gap-1">
           <AlertTriangle className="h-3 w-3" />
           <span>Processo com atraso significativo</span>
          </div>
         )}
        </div>
       )
      })}

      {processosComPendencias.length > 5 && (
       <div className="text-center pt-2">
        <Button
         variant="outline"
         size="sm"
         onClick={() => navigate('/clcb')}
         className="text-xs"
        >
         Ver todos os {processosComPendencias.length} processos
        </Button>
       </div>
      )}
     </div>
    </CardContent>
   </Card>

   {processosAtrasados.length > 0 && (
    <Card className="border-red-200">
     <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg text-red-700">
       <AlertTriangle className="h-5 w-5" />
       Processos com Atraso
       <Badge variant="destructive">{processosAtrasados.length}</Badge>
      </CardTitle>
     </CardHeader>
     <CardContent>
      <p className="text-sm text-red-600 mb-3">
       Processos iniciados há mais de 7 dias com menos de 50% de progresso
      </p>
      <div className="space-y-2">
       {processosAtrasados.slice(0, 3).map(processo => (
        <div
         key={processo.id}
         className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200"
        >
         <div className="flex items-center gap-2">
          <Badge variant="outline">{processo.tipoServico}</Badge>
          <span className="text-sm">{processo.responsavelInterno}</span>
         </div>
         <div className="text-xs text-red-600">
          {processo.progresso}% concluído
         </div>
        </div>
       ))}
      </div>
     </CardContent>
    </Card>
   )}
  </div>
 )
}
