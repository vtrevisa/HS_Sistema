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
     !filters.cidade &&
     !filters.tipoServico &&
     !filters.dataInicio &&
     !filters.dataTermino
      ? 'Nenhuma proposta arquivada encontrada.'
      : 'Nenhuma proposta encontrada com os filtros aplicados.'}
    </p>
   </CardContent>
  </Card>
 )
}
