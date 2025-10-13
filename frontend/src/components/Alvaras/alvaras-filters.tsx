import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import {
 CalendarRange,
 FileText,
 Filter,
 MapPin,
 MapPinHouse
} from 'lucide-react'
import { AlvarasActions } from './alvaras-actions'

interface AlvarasFiltersProps {
 selectedState: string
 setSelectedState: (status: string) => void
 city: string
 setCity: (status: string) => void
 initDate: string
 setInitDate: (status: string) => void
 endDate: string
 setEndDate: (status: string) => void
 selectedType: string
 setSelectedType: (type: string) => void
 applyFilter: () => void
 exportList: () => void
 selectedAlvaras: string[]
}

export function AlvarasFilters({
 selectedState,
 setSelectedState,
 city,
 setCity,
 initDate,
 setInitDate,
 endDate,
 setEndDate,
 selectedType,
 setSelectedType,
 applyFilter,
 exportList,
 selectedAlvaras
}: AlvarasFiltersProps) {
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Filter className="h-5 w-5" />
     Filtros de Busca
    </CardTitle>
   </CardHeader>
   <CardContent className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
     <div className="space-y-2">
      <Label htmlFor="estado" className="flex items-center gap-1">
       <MapPinHouse size={14} />
       Estado
      </Label>
      <select
       value={selectedState}
       onChange={e => setSelectedState(e.target.value)}
       className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
      >
       <option value="">Selecione o estado</option>
       <option value="SP">São Paulo</option>
       <option value="RJ">Rio de Janeiro</option>
       <option value="MG">Minas Gerais</option>
       <option value="RS">Rio Grande do Sul</option>
      </select>
     </div>

     <div className="space-y-2">
      <Label htmlFor="cidade" className="flex items-center gap-1">
       <MapPin size={14} />
       Cidade
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
      <Label htmlFor="dataInicio" className="flex items-center gap-1">
       <CalendarRange size={14} />
       Data de Início
      </Label>
      <Input
       id="dataInicio"
       type="date"
       value={initDate}
       onChange={e => setInitDate(e.target.value)}
       className="text-foreground placeholder:text-foreground border-gray-300"
      />
     </div>

     <div className="space-y-2">
      <Label htmlFor="dataTermino" className="flex items-center gap-1">
       <CalendarRange size={14} />
       Data de Término
      </Label>
      <Input
       id="dataTermino"
       type="date"
       value={endDate}
       onChange={e => setEndDate(e.target.value)}
       className="text-foreground placeholder:text-foreground border-gray-300"
      />
     </div>

     <div className="space-y-2">
      <Label htmlFor="tipoServico" className="flex items-center gap-1">
       <FileText size={14} />
       Tipo de Serviço
      </Label>
      <select
       value={selectedType}
       onChange={e => setSelectedType(e.target.value)}
       className="w-full h-[40px] border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none text-sm"
      >
       <option value="">Selecione o tipo</option>
       <option value="AVCB">AVCB</option>
       <option value="CLCB">CLCB</option>
      </select>
     </div>
    </div>

    <AlvarasActions
     applyFilter={applyFilter}
     exportList={exportList}
     selectedAlvaras={selectedAlvaras}
    />
   </CardContent>
  </Card>
 )
}
