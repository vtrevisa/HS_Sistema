import { useState } from 'react'
import { PlansData } from './plans-admin'

export type Filters = {
 status: 'all' | 'pending' | 'approved' | 'rejected'
}

export function Plans() {
 const [filters, setFilters] = useState<Filters>({
  status: 'all'
 })

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
     <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
      Solicitações de Alteração de Plano
     </h1>
     <p className="text-muted-foreground">
      Gerencie as solicitações de alteração de plano dos usuários
     </p>
    </div>
   </div>

   <PlansData filters={filters} setFilters={setFilters} />
  </div>
 )
}
