import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DatePickerWithRange } from '../ui/date-picker'
import type { DateRange } from 'react-day-picker'

import {
 CalendarRange,
 FileText,
 MapPin,
 MapPinHouse,
 Search
} from 'lucide-react'
import { AlvarasActions } from './alvaras-actions'

interface AlvarasFiltersProps {
 city: string
 setCity: (status: string) => void
 dateRange: DateRange | undefined
 setDateRange: (range: DateRange | undefined) => void
 selectedType: 'Todos' | 'AVCB' | 'CLCB'
 setSelectedType: (type: 'Todos' | 'AVCB' | 'CLCB') => void
 applyFilter: () => void
}

export function AlvarasFilters({
 city,
 setCity,
 dateRange,
 setDateRange,
 selectedType,
 setSelectedType,
 applyFilter
}: AlvarasFiltersProps) {
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Search className="h-5 w-5" />
     Buscar Alvarás
    </CardTitle>
   </CardHeader>
   <CardContent className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
     <div className="space-y-2">
      <Label htmlFor="estado" className="flex items-center gap-1">
       <MapPinHouse size={14} />
       Estado
      </Label>
      <Input value="SP" disabled className="bg-muted" />
     </div>

     <div className="space-y-2">
      <Label htmlFor="cidade" className="flex items-center gap-1">
       <MapPin size={14} />
       Cidade *
      </Label>
      <Input
       id="cidade"
       placeholder="Digite a cidade"
       value={city}
       onChange={e => setCity(e.target.value)}
       className="text-foreground placeholder:text-foreground border-gray-300"
      />
     </div>

     <div className="space-y-2">
      <Label htmlFor="expirationPeriod" className="flex items-center gap-1">
       <CalendarRange size={14} />
       Período de Vencimento *
      </Label>
      <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
     </div>

     <div className="space-y-2">
      <Label htmlFor="tipoServico" className="flex items-center gap-1">
       <FileText size={14} />
       Tipo de Serviço
      </Label>
      <select
       value={selectedType}
       onChange={e =>
        setSelectedType(e.target.value as 'Todos' | 'AVCB' | 'CLCB')
       }
       className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
      >
       <option value="Todos">Todos</option>
       <option value="AVCB">AVCB</option>
       <option value="CLCB">CLCB</option>
      </select>
     </div>
    </div>

    <AlvarasActions applyFilter={applyFilter} />
   </CardContent>
  </Card>
 )
}
