import { Search } from 'lucide-react'

interface LeadsFiltersProps {
 searchTerm: string
 setSearchTerm: (term: string) => void
 selectedStatus: string
 setSelectedStatus: (status: string) => void

 //selectedFilter: string
 // setSelectedFilter: (filter: string) => void
 selectedType: string
 setSelectedType: (type: string) => void
}

export function LeadsFilters({
 searchTerm,
 setSearchTerm,
 selectedStatus,
 setSelectedStatus,
 selectedType,
 setSelectedType
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
     value={selectedStatus}
     onChange={e => setSelectedStatus(e.target.value)}
     className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
    >
     <option value="todos">Todos os Status</option>
     <option value="Lead">Lead</option>
     <option value="Primeiro contato">Primeiro Contato</option>
     <option value="Follow-up">Follow-up</option>
     <option value="Proposta enviada">Proposta Enviada</option>
     <option value="Cliente fechado">Cliente Fechado</option>
     <option value="Arquivado">Arquivado</option>
    </select>

    <select
     value={selectedType}
     onChange={e => setSelectedType(e.target.value)}
     className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
    >
     <option value="todos">Todos os Tipos</option>
     <option value="AVCB">AVCB</option>
     <option value="CLCB">CLCB</option>
     <option value="Laudo Técnico">Laudo Técnico</option>
    </select>
   </div>
  </div>
 )
}
