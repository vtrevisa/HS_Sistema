import type { Dispatch, SetStateAction } from 'react'
import type { Filters } from '.'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { PlansAdminTable } from './plans-admin-table'
import { usePlan } from '@/http/use-plan'

interface PlansDataProps {
 filters: Filters
 setFilters: Dispatch<SetStateAction<Filters>>
}

export function PlansData({ filters, setFilters }: PlansDataProps) {
 const { plans, isLoading } = usePlan(filters.status)

 return (
  <Card>
   <CardHeader>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
     <div>
      <CardTitle>Solicitações</CardTitle>
      <CardDescription>
       Lista de todas as solicitações de alteração de plano do sistema
      </CardDescription>
     </div>

     <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
       <span className="text-sm text-muted-foreground">Status:</span>
       <select
        value={filters.status}
        onChange={e =>
         setFilters({
          ...filters,
          status: e.target.value as Filters['status']
         })
        }
        className="w-full h-9 border border-gray-300 bg-background rounded-lg px-2 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
       >
        <option value="all">Todas</option>
        <option value="pending">Pendentes</option>
        <option value="approved">Aprovadas</option>
        <option value="rejected">Rejeitadas</option>
       </select>
      </div>
     </div>
    </div>
   </CardHeader>

   <PlansAdminTable plans={plans} isLoading={isLoading} />
  </Card>
 )
}
