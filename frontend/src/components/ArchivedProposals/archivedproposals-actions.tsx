import type { ArchivedProposal } from '@/http/types/crm'
import { Button } from '../ui/button'

interface ArchivedProposalsActionsProps {
 proposals: ArchivedProposal[]
 removeFilters: () => void
}

export function ArchivedProposalsActions({
 proposals,
 removeFilters
}: ArchivedProposalsActionsProps) {
 return (
  <div className="flex justify-between items-center mt-4 pt-4 border-t">
   <Button onClick={removeFilters} variant="outline">
    Limpar Filtros
   </Button>
   <span className="text-sm text-muted-foreground">
    {proposals.length} proposta(s) encontrada(s)
   </span>
  </div>
 )
}
