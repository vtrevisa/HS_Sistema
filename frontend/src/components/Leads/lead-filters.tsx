import { Search } from 'lucide-react'

interface LeadsFiltersProps {
 searchTerm: string
 setSearchTerm: (term: string) => void
 selectedFilter: string
 setSelectedFilter: (filter: string) => void
}

export function LeadsFilters({
 searchTerm,
 setSearchTerm,
 selectedFilter,
 setSelectedFilter
}: LeadsFiltersProps) {
 return (
  <div className="bg-background dark:data-table rounded-lg shadow-md p-6 mb-6">
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
     value={selectedFilter}
     onChange={e => setSelectedFilter(e.target.value)}
     className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
    >
     <option value="todos">Todos os Status</option>
     <option value="lead">Lead</option>
     <option value="primeiro-contato">Primeiro Contato</option>
     <option value="follow-up">Follow-up</option>
     <option value="proposta-enviada">Proposta Enviada</option>
     <option value="cliente-fechado">Cliente Fechado</option>
    </select>

    <select className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none">
     <option value="todos">Todos os Tipos</option>
     <option value="avcb">AVCB</option>
     <option value="clcb">CLCB</option>
     <option value="laudo">Laudo Técnico</option>
    </select>
   </div>
  </div>
 )
}
