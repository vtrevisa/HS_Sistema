import { Building, Calendar, DollarSign } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { ArchivedProposal } from '@/http/types/crm'

interface ArchivedProposalsCardProps {
 proposals: ArchivedProposal[] | undefined
}

export function ArchivedProposalsCard({
 proposals
}: ArchivedProposalsCardProps) {
 return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
   {proposals?.map(proposal => {
    return (
     <Card key={proposal.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
       <div className="flex justify-between items-start">
        <CardTitle className="text-base font-semibold text-card-foreground">
         {proposal.company}
        </CardTitle>
        <Badge
         variant={proposal.status === 'Ganho' ? 'default' : 'destructive'}
         className={
          proposal.status === 'Ganho'
           ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
           : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
         }
        >
         {proposal.status}
        </Badge>
       </div>
      </CardHeader>
      <CardContent className="space-y-3">
       <div className="flex items-center gap-2 text-sm">
        <Building size={14} className="text-muted-foreground" />
        <span className="font-medium text-card-foreground">Tipo:</span>
        <span className="text-muted-foreground">Alvará {proposal.type}</span>
       </div>
       <div className="flex items-center gap-2 text-sm">
        <DollarSign size={14} className="text-muted-foreground" />
        <span className="font-medium text-card-foreground">Valor:</span>
        <span className="font-semibold text-foreground">
         {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
         }).format(proposal.value)}
        </span>
       </div>
       <div className="flex items-center gap-2 text-sm">
        <Calendar size={14} className="text-muted-foreground" />
        <span className="font-medium text-card-foreground">Arquivado em:</span>
        <span className="text-muted-foreground">
         {new Date(proposal.archived_at).toLocaleDateString('pt-BR')}
        </span>
       </div>

       {proposal.reason && (
        <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
         <span className="font-medium text-card-foreground">Motivo:</span>
         <p className="text-muted-foreground mt-1">{proposal.reason}</p>
        </div>
       )}
      </CardContent>
     </Card>
    )
   })}
  </div>
 )
}
