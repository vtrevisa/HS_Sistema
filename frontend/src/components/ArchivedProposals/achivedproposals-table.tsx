import { Badge } from '../ui/badge'
import type { ArchivedProposal } from '@/http/types/crm'

interface ArchivedProposalsTableProps {
 proposals: ArchivedProposal[] | undefined
}

export function ArchivedProposalsTable({
 proposals
}: ArchivedProposalsTableProps) {
 if (!proposals || proposals.length === 0) return null

 const hasLostProposals = proposals?.some(
  proposal => proposal.status === 'Perdido'
 )

 return (
  <div className="rounded-md border overflow-x-auto">
   <table className="w-full caption-bottom text-sm">
    <thead className="[&_tr]:border-b bg-muted/50">
     <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
       Empresa
      </th>
      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
       Cidade
      </th>
      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
       Tipo de Serviço
      </th>
      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
       Status
      </th>
      {hasLostProposals && (
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Motivo
       </th>
      )}
      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
       Valor do serviço
      </th>
      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
       Alvará vence em
      </th>
      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
       Lead criado em
      </th>
      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
       Arquivado em
      </th>
     </tr>
    </thead>
    <tbody className="[&_tr:last-child]:border-0">
     {proposals.map(proposal => (
      <tr
       key={proposal.id}
       className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
      >
       <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <span className="text-card-foreground">
         {proposal.company || proposal.lead?.company || '-'}
        </span>
       </td>
       <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <span className="text-card-foreground">
         {proposal.lead?.city || '-'}
        </span>
       </td>
       <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <span className="status-badge bg-destructive/10 text-destructive border border-destructive/20">
         {proposal.type}
        </span>
       </td>
       <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <Badge
         variant={proposal.status === 'Ganho' ? 'default' : 'destructive'}
         className={
          proposal.status === 'Ganho'
           ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100'
           : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-100'
         }
        >
         {proposal.status}
        </Badge>
       </td>
       {hasLostProposals && (
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         <span className="text-sm text-muted-foreground">
          {proposal.status === 'Perdido' ? proposal.reason || '-' : '-'}
         </span>
        </td>
       )}

       <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <span className="font-semibold text-card-foreground">
         {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
         }).format(proposal.value)}
        </span>
       </td>
       <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <span className="text-muted-foreground">
         {proposal.lead?.validity
          ? new Date(proposal.lead.validity).toLocaleDateString('pt-BR')
          : '-'}
        </span>
       </td>
       <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <span className="text-muted-foreground">
         {proposal.lead?.created_at
          ? new Date(proposal.lead.created_at).toLocaleDateString('pt-BR')
          : '-'}
        </span>
       </td>
       <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
        <span className="text-muted-foreground">
         {new Date(proposal.archived_at).toLocaleDateString('pt-BR')}
        </span>
       </td>
      </tr>
     ))}
    </tbody>
   </table>
  </div>
 )
}
