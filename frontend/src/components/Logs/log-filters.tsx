import { CalendarRange, FileText, Filter, MapPin, User } from 'lucide-react'
import { MonthPicker, type SelectedMonth } from '../ui/month-picker'

import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface LogFiltersProps {
 user: string
 setUser: (status: string) => void
 city: string
 setCity: (status: string) => void
 selectedType: 'Todos' | 'AVCB' | 'CLCB'
 setSelectedType: (type: 'Todos' | 'AVCB' | 'CLCB') => void
 selectedMonth?: SelectedMonth
 setSelectedMonth: (value: SelectedMonth | undefined) => void
}

export function LogFilters({
 user,
 setUser,
 city,
 setCity,
 selectedType,
 setSelectedType,
 selectedMonth,
 setSelectedMonth
}: LogFiltersProps) {
 return (
  <Card className="p-6">
   <div className="flex items-center gap-2 mb-4">
    <Filter className="h-5 w-5" />
    <h2 className="text-lg font-semibold">Filtros</h2>
   </div>

   <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
     <div className="space-y-2">
      <Label htmlFor="user" className="flex items-center gap-1">
       <User size={14} />
       Usuário
      </Label>
      <Input
       id="user"
       placeholder="Nome ou email"
       value={user}
       onChange={e => setUser(e.target.value)}
       className="text-foreground placeholder:text-foreground border-gray-300"
      />
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
      <Label htmlFor="service" className="flex items-center gap-1">
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

     <div className="space-y-2">
      <Label htmlFor="expirationPeriod" className="flex items-center gap-1 ">
       <CalendarRange size={14} />
       Período do Consumo
      </Label>
      <MonthPicker
       value={selectedMonth}
       onChange={setSelectedMonth}
       className="border border-gray-300 rounded-md dark:border-0"
      />
     </div>
    </div>
   </div>
  </Card>
 )
}
