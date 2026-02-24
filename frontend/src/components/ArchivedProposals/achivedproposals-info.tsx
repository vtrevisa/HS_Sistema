import type { Filters } from '.'
import { Card, CardContent } from '../ui/card'

interface ArchivedProposalsInfoProps {
 filters: Filters
}

export function ArchivedProposalsInfo({ filters }: ArchivedProposalsInfoProps) {
 return (
  <Card>
   <CardContent className="text-center py-8">
    <p className="text-muted-foreground">
     {filters.status === 'todas' &&
     !filters.city &&
     !filters.type &&
     !filters.dateRange
      ? 'Nenhuma proposta arquivada encontrada.'
      : 'Nenhuma proposta encontrada com os filtros aplicados.'}
    </p>
   </CardContent>
  </Card>
 )
}
