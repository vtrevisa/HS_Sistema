import type { Dispatch, SetStateAction } from 'react'
import {
 BadgeInfo,
 CalendarRange,
 FileText,
 Target,
 Filter,
 MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { ArchivedProposalsActions } from './archivedproposals-actions'
import type { Filters } from '.'
import { DatePickerWithRange } from '../ui/date-picker'
import type { ArchivedProposal } from '@/http/types/crm'
import { useCities } from '@/http/use-cities'
import type { DateRange } from 'react-day-picker'

interface ArchivedProposalsFiltersProps {
 filters: Filters
 setFilters: Dispatch<SetStateAction<Filters>>
 dateRange: DateRange | undefined
 onDateRangeChange: (range: DateRange | undefined) => void
 proposals: ArchivedProposal[]
 removeFilters: () => void
}

export function ArchivedProposalsFilters({
 filters,
 setFilters,
 dateRange,
 onDateRangeChange,
 proposals,
 removeFilters
}: ArchivedProposalsFiltersProps) {
 const { data: cities, isLoading: isCitiesLoading } = useCities()

 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Filter className="h-5 w-5" />
     Filtros e Relatórios
    </CardTitle>
   </CardHeader>
   <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
     {/* Filtro de Cidade */}
     <div className="space-y-2">
      <Label htmlFor="city" className="flex items-center gap-1">
       <MapPin size={14} />
       Cidade
      </Label>
      <select
       id="city"
       value={filters.city}
       onChange={e => setFilters({ ...filters, city: e.target.value })}
       disabled={isCitiesLoading}
       className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
      >
       <option value="">
        {isCitiesLoading ? 'Carregando cidades...' : 'Selecione a cidade'}
       </option>
       {cities?.map(city => (
        <option key={city.id} value={city.nome}>
         {city.nome}
        </option>
       ))}
      </select>
     </div>

     {/* Filtro de Tipo de Serviço */}
     <div className="space-y-2">
      <Label htmlFor="type" className="flex items-center gap-1">
       <FileText size={14} />
       Tipo de Serviço
      </Label>
      <select
       id="type"
       value={filters.type}
       onChange={e => setFilters({ ...filters, type: e.target.value })}
       className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
      >
       <option value="">Selecione o tipo</option>
       <option value="AVCB">AVCB</option>
       <option value="CLCB">CLCB</option>
      </select>
     </div>

     {/* Filtro de Status */}
     <div className="space-y-2">
      <Label htmlFor="status-filter" className="flex items-center gap-1">
       <BadgeInfo size={14} />
       Status
      </Label>
      <select
       value={filters.status}
       onChange={e =>
        setFilters({ ...filters, status: e.target.value as Filters['status'] })
       }
       className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
      >
       <option value="todas">Todas</option>
       <option value="Ganho">Ganhas</option>
       <option value="Perdido">Perdidas</option>
      </select>
     </div>

     {/* Filtro de Data de Vencimento Alvará */}
     <div className="space-y-2">
      <Label
       htmlFor="expiration-alvara-filter"
       className="flex items-center gap-1"
      >
       <Target size={14} />
       Vencimento do alvará
      </Label>
      <select
       value={filters.expiration}
       onChange={e =>
        setFilters({
         ...filters,
         expiration: e.target.value as Filters['expiration']
        })
       }
       className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
      >
       <option value="">Selecione o período</option>
       <option value="vencido">Vencidos</option>
       <option value="30">Vencem em até 30 dias</option>
       <option value="60">Vencem em até 60 dias</option>
      </select>
     </div>

     {/* Filtro de Data de Cadastro Lead */}
     <div className="space-y-2">
      <Label htmlFor="add-lead-filter" className="flex items-center gap-1">
       <CalendarRange size={14} />
       Lead criado em
      </Label>
      <select
       value={filters.leadCreatedAt}
       onChange={e =>
        setFilters({
         ...filters,
         leadCreatedAt: e.target.value as Filters['leadCreatedAt']
        })
       }
       className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
      >
       <option value="">Selecione o período</option>
       <option value="7">Últimos 7 dias</option>
       <option value="30">Últimos 30 dias</option>
      </select>
     </div>

     {/* Filtro de arquivamento da proposta */}
     <div className="space-y-2">
      <Label htmlFor="expirationPeriod" className="flex items-center gap-1">
       <CalendarRange size={14} />
       Período de arquivamento
      </Label>
      <DatePickerWithRange date={dateRange} onDateChange={onDateRangeChange} />
     </div>
    </div>

    {/* Botão para limpar filtros */}
    <ArchivedProposalsActions
     proposals={proposals}
     removeFilters={removeFilters}
    />
   </CardContent>
  </Card>
 )
}
