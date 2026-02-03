import { Search } from 'lucide-react'

interface LeadsFiltersProps {
 searchTerm: string
 setSearchTerm: (term: string) => void

 selectedType: string
 setSelectedType: (type: string) => void

 selectedStatus: string
 setSelectedStatus: (status: string) => void

 expirationFilter: string
 setExpirationFilter: (value: string) => void

 createdAtFilter: string
 setCreatedAtFilter: (value: string) => void

 selectedResult: string
 setSelectedResult: (value: 'todos' | 'Ganho' | 'Perdido') => void
}

export function LeadsFilters({
 searchTerm,
 setSearchTerm,
 selectedType,
 setSelectedType,
 selectedStatus,
 setSelectedStatus,
 expirationFilter,
 setExpirationFilter,
 createdAtFilter,
 setCreatedAtFilter,
 selectedResult,
 setSelectedResult
}: LeadsFiltersProps) {
 console.log('Expiration Filter:', expirationFilter)

 return (
  <div className="bg-background dark:data-table rounded-lg shadow-md p-6 mb-6">
   <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
    <div className="relative">
     <Search className="absolute left-3 top-3 h-4 w-4 text-foreground" />
     <input
      type="text"
      placeholder="Buscar por empresa, contato..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      className="pl-10 w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
     />
    </div>

    <select
     value={selectedType}
     onChange={e => setSelectedType(e.target.value)}
     className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
    >
     <option value="todos">Todos os tipos</option>
     <option value="AVCB">AVCB</option>
     <option value="CLCB">CLCB</option>
     <option value="Laudo Técnico">Laudo Técnico</option>
    </select>

    <select
     value={selectedStatus}
     onChange={e => setSelectedStatus(e.target.value)}
     className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
    >
     <option value="todos">Todos os status</option>
     <option value="Lead">Lead</option>
     <option value="Primeiro contato">Primeiro Contato</option>
     <option value="Follow-up">Follow-up</option>
     <option value="Proposta enviada">Proposta Enviada</option>
     <option value="Cliente fechado">Cliente Fechado</option>
    </select>

    <select
     value={expirationFilter}
     onChange={e => setExpirationFilter(e.target.value)}
     className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
    >
     <option value="todos">Todos os alvarás</option>
     <option value="vencido">Vencidos</option>
     <option value="30">Vencem em até 30 dias</option>
     <option value="60">Vencem em até 60 dias</option>
    </select>

    <select
     value={createdAtFilter}
     onChange={e => setCreatedAtFilter(e.target.value)}
     className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
    >
     <option value="todos">Todas as datas</option>
     <option value="7">Últimos 7 dias</option>
     <option value="30">Últimos 30 dias</option>
    </select>

    <select
     value={selectedResult}
     onChange={e =>
      setSelectedResult(e.target.value as 'todos' | 'Ganho' | 'Perdido')
     }
     className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
    >
     <option value="todos">Ganhos e Perdidos</option>
     <option value="Ganho">Ganhos</option>
     <option value="Perdido">Perdidos</option>
    </select>
   </div>
  </div>
 )
}
