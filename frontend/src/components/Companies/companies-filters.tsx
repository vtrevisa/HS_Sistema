import { Filter, Search } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { DatePickerWithRange } from '../ui/date-picker'
import type { DateRange } from 'react-day-picker'
import { useCities } from '@/http/use-cities'

interface CompaniesFiltersProps {
 city: string
 setCity: (status: string) => void

 searchTerm: string
 setSearchTerm: (term: string) => void

 selectedStatus: string
 setSelectedStatus: (status: string) => void

 selectedType: string
 setSelectedType: (type: string) => void

 dateRange: DateRange | undefined
 setDateRange: (range: DateRange | undefined) => void
}

export function CompaniesFilters({
 city,
 setCity,
 searchTerm,
 setSearchTerm,
 selectedStatus,
 setSelectedStatus,
 selectedType,
 setSelectedType,
 dateRange,
 setDateRange
}: CompaniesFiltersProps) {
 const { data: cities, isLoading: isCitiesLoading } = useCities()

 return (
  <Card className="bg-secondary">
   <CardContent className="pt-4">
    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
     <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">Filtros:</span>
     </div>

     <div className="flex-1 min-w-[200px] w-full sm:w-auto">
      <div className="relative">
       <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
       <Input
        placeholder="Buscar por nome ou endereço..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="pl-10 w-full"
       />
      </div>
     </div>

     <select
      value={city}
      onChange={e => setCity(e.target.value)}
      disabled={isCitiesLoading}
      className="w-full sm:w-auto border border-border rounded-lg px-4 py-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
     >
      <option value="">
       {isCitiesLoading ? 'Carregando cidades...' : 'Todas as cidades'}
      </option>
      {cities?.map(city => (
       <option key={city.id} value={city.nome}>
        {city.nome}
       </option>
      ))}
     </select>

     <select
      value={selectedStatus}
      onChange={e => setSelectedStatus(e.target.value)}
      className="w-full sm:w-auto border border-border rounded-lg px-4 py-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
     >
      <option value="todos">Todos os status</option>
      <option value="pendente">Pendentes</option>
      <option value="enriquecido">Enriquecidos</option>
     </select>

     <select
      value={selectedType}
      onChange={e => setSelectedType(e.target.value)}
      className="w-full sm:w-auto border border-border rounded-lg px-4 py-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
     >
      <option value="todos">Todos os tipos</option>
      <option value="AVCB">AVCB</option>
      <option value="CLCB">CLCB</option>
     </select>

     <div className="relative w-full sm:w-auto">
      <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
     </div>
    </div>
   </CardContent>
  </Card>
 )
}
