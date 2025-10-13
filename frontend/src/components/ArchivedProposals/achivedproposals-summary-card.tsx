import type { ArchivedProposal } from '@/http/types/crm'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ArchivedProposalsSummaryCardProps {
 proposals: ArchivedProposal[] | undefined
}

export function ArchivedProposalsSummaryCard({
 proposals
}: ArchivedProposalsSummaryCardProps) {
 const totalGanhas =
  proposals?.filter(proposal => proposal.status === 'Ganho') || []
 const totalPerdidas =
  proposals?.filter(proposal => proposal.status === 'Perdido') || []

 const valorTotalGanhas = totalGanhas.reduce(
  (sum, p) => sum + (p.value || 0),
  0
 )
 const valorTotalPerdidas = totalPerdidas.reduce(
  (sum, p) => sum + (p.value || 0),
  0
 )

 return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
   <Card>
    <CardHeader className="pb-2">
     <CardTitle className="text-sm font-medium text-muted-foreground">
      Total de Propostas
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="text-2xl font-bold text-foreground">
      {proposals?.length || 0}
     </div>
    </CardContent>
   </Card>

   <Card>
    <CardHeader className="pb-2">
     <CardTitle className="text-sm font-medium text-muted-foreground">
      Propostas Ganhas
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="text-2xl font-bold text-green-600 dark:text-green-400">
      {totalGanhas.length}
     </div>
     <p className="text-xs text-muted-foreground mt-1">
      {new Intl.NumberFormat('pt-BR', {
       style: 'currency',
       currency: 'BRL'
      }).format(valorTotalGanhas)}
     </p>
    </CardContent>
   </Card>

   <Card>
    <CardHeader className="pb-2">
     <CardTitle className="text-sm font-medium text-muted-foreground">
      Propostas Perdidas
     </CardTitle>
    </CardHeader>
    <CardContent>
     <div className="text-2xl font-bold text-red-600 dark:text-red-400">
      {totalPerdidas.length}
     </div>
     <p className="text-xs text-muted-foreground mt-1">
      {new Intl.NumberFormat('pt-BR', {
       style: 'currency',
       currency: 'BRL'
      }).format(valorTotalPerdidas)}
     </p>
    </CardContent>
   </Card>
  </div>
 )
}
