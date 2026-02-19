import { Search } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { DatePickerWithRange } from '../ui/date-picker'

interface LeadsFiltersProps {
 searchTerm: string
 setSearchTerm: (term: string) => void

 selectedType: string
 setSelectedType: (type: string) => void

 selectedStatus: string
 setSelectedStatus: (status: string) => void

 dateRange: DateRange | undefined
 setDateRange: (range: DateRange | undefined) => void
}

export function LeadsFilters({
 searchTerm,
 setSearchTerm,
 selectedType,
 setSelectedType,
 selectedStatus,
 setSelectedStatus,
 dateRange,
 setDateRange
}: LeadsFiltersProps) {
 return (
  <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="relative">
     <Search className="absolute left-3 top-3 h-4 w-4 text-foreground" />
     <input
      type="text"
      placeholder="Buscar por empresa, contato..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      className="pl-10 w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
     />
    </div>

    <select
     value={selectedStatus}
     onChange={e => setSelectedStatus(e.target.value)}
     className="border border-border rounded-lg px-4 py-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
    >
     <option value="todos">Todos os status</option>
     <option value="Lead">Lead</option>
     <option value="Primeiro contato">Primeiro Contato</option>
     <option value="Follow-up">Follow-up</option>
     <option value="Proposta enviada">Proposta Enviada</option>
     <option value="Cliente fechado">Cliente Fechado</option>
     <option value="Ganho">Ganho</option>
     <option value="Perdido">Perdido</option>
    </select>

    <select
     value={selectedType}
     onChange={e => setSelectedType(e.target.value)}
     className="border border-border rounded-lg px-4 py-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
    >
     <option value="todos">Todos os tipos</option>
     <option value="AVCB">AVCB</option>
     <option value="CLCB">CLCB</option>
     <option value="Laudo Técnico">Laudo Técnico</option>
    </select>

    <div className="relative">
     <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
    </div>
   </div>
  </div>
 )
}
