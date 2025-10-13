import type { Dispatch, SetStateAction } from 'react'
import {
 BadgeInfo,
 CalendarRange,
 FileText,
 Filter,
 MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { ArchivedProposalsActions } from './archivedproposals-actions'
import type { Filters } from '.'
import type { ArchivedProposal } from '@/http/types/crm'

interface ArchivedProposalsFiltersProps {
 filters: Filters
 setFilters: Dispatch<SetStateAction<Filters>>
 proposals: ArchivedProposal[]
 removeFilters: () => void
}

export function ArchivedProposalsFilters({
 filters,
 setFilters,
 proposals,
 removeFilters
}: ArchivedProposalsFiltersProps) {
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Filter className="h-5 w-5" />
     Filtros e Relatórios
    </CardTitle>
   </CardHeader>
   <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

     {/* Filtro de Cidade */}
     <div className="space-y-2">
      <Label htmlFor="cidade" className="flex items-center gap-1">
       <MapPin size={14} />
       Cidade
      </Label>
      <Input
       id="cidade"
       value={filters.cidade}
       onChange={e => setFilters({ ...filters, cidade: e.target.value })}
       placeholder="Digite a cidade..."
       className="text-foreground placeholder:text-foreground border-gray-300"
      />
     </div>

     {/* Filtro de Tipo de Serviço */}
     <div className="space-y-2">
      <Label htmlFor="tipoServico" className="flex items-center gap-1">
       <FileText size={14} />
       Tipo de Serviço
      </Label>
      <select
       value={filters.tipoServico}
       onChange={e => setFilters({ ...filters, tipoServico: e.target.value })}
       className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
      >
       <option value="">Selecione o tipo</option>
       <option value="AVCB">AVCB</option>
       <option value="CLCB">CLCB</option>
      </select>
     </div>

     {/* Data Inicial */}
     <div className="space-y-2">
      <Label htmlFor="dataInicio" className="flex items-center gap-1">
       <CalendarRange size={14} />
       Data Inicial
      </Label>
      <Input
       id="dataInicio"
       value={filters.dataInicio}
       onChange={e => setFilters({ ...filters, dataInicio: e.target.value })}
       type="date"
       className="text-foreground placeholder:text-foreground border-gray-300"
      />
     </div>

     {/* Data Final */}
     <div className="space-y-2">
      <Label htmlFor="dataTermino" className="flex items-center gap-1">
       <CalendarRange size={14} />
       Data Final
      </Label>
      <Input
       id="dataTermino"
       value={filters.dataTermino}
       onChange={e => setFilters({ ...filters, dataTermino: e.target.value })}
       type="date"
       className="text-foreground placeholder:text-foreground border-gray-300"
      />
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
