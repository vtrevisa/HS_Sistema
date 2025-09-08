import { useState } from 'react'
import { toast } from 'sonner'
import { AlvarasFilters } from './alvaras-filters'
import { AlvarasTable } from './alvaras-table'

export function Alvaras() {
 const [selectedStateFilter, setSelectedStateFilter] = useState('')
 const [city, setCity] = useState('')
 const [initDate, setInitDate] = useState('')
 const [endDate, setEndDate] = useState('')
 const [selectedTypeFilter, setSelectedTypeFilter] = useState('')
 const [selectedAlvaras, setSelectedAlvaras] = useState<string[]>([])

 function applyFilter() {
  console.log('Buscando alvarás com filtros:', {
   selectedStateFilter,
   city,
   initDate,
   endDate,
   selectedTypeFilter
  })

  toast.success('Filtros Aplicados', {
   description: 'A busca foi executada com os filtros selecionados.'
  })
 }

 function exportList() {
  if (selectedAlvaras.length === 0) {
   toast.error('Seleção Necessária', {
    description: 'Selecione pelo menos um alvará para exportar.'
   })

   return
  }
  setSelectedAlvaras([])

  toast.success('Lista Exportada', {
   description:
    selectedAlvaras.length === 1
     ? '1 alvará foi enviado para a aba "Busca de Dados da Empresa".'
     : `${selectedAlvaras.length} alvarás foram enviados para a aba "Busca de Dados da Empresa".`
  })
 }

 return (
  <div className="p-6 space-y-6">
   <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold text-primary">Captação de Alvarás</h1>
   </div>

   {/* Filtros */}
   <AlvarasFilters
    selectedState={selectedStateFilter}
    setSelectedState={setSelectedStateFilter}
    city={city}
    setCity={setCity}
    initDate={initDate}
    setInitDate={setInitDate}
    endDate={endDate}
    setEndDate={setEndDate}
    selectedType={selectedTypeFilter}
    setSelectedType={setSelectedTypeFilter}
    applyFilter={applyFilter}
    exportList={exportList}
    selectedAlvaras={selectedAlvaras}
   />

   {/* Tabela de Resultados */}
   <AlvarasTable
    selectedAlvaras={selectedAlvaras}
    setSelectedAlvaras={setSelectedAlvaras}
   />
  </div>
 )
}
