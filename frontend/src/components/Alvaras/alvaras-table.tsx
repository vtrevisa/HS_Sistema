import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import {
 getPaginatedData,
 getTotalPages,
 handleItemsPerPageChange,
 handlePageChange
} from '@/services/alvaras'
// import type { CompanyRequest } from '@/http/types/companies'
// import { useCompany } from '@/http/use-company'

interface AlvarasTableProps {
 alvarasData: {
  id: number
  service: string
  endDate: Date
  address: string
  occupation: string
 }[]
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250, 500]

export function AlvarasTable({ alvarasData }: AlvarasTableProps) {
 const [currentPage, setCurrentPage] = useState(1)
 const [itemsPerPage, setItemsPerPage] = useState(25)

 //const { exportCompanies } = useCompany()

 const totalItems = alvarasData.length
 const totalPages = getTotalPages(totalItems, itemsPerPage)

 const paginatedData = useMemo(() => {
  return getPaginatedData({ data: alvarasData, currentPage, itemsPerPage })
 }, [alvarasData, currentPage, itemsPerPage])

 const handlePrev = () => {
  setCurrentPage(prev => handlePageChange(prev - 1, totalPages))
 }

 const handleNext = () => {
  setCurrentPage(prev => handlePageChange(prev + 1, totalPages))
 }

 const handleItemsPerPageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = handleItemsPerPageChange(e.target.value, setCurrentPage)
  setItemsPerPage(value)
 }

 function handleExportAlvaras() {
  //if (alvarasData.length === 0) return

  //   const companiesToSave: Omit<CompanyRequest, 'id'>[] = alvarasData.map(
  //    alvara => ({
  //     name: alvara.address,
  //     service: alvara.service,
  //     expiration_date: alvara.endDate.toISOString(),
  //     address: alvara.address,
  //     occupation: alvara.occupation
  //    })
  //   )

  //   exportCompanies.mutate(companiesToSave)

  console.log('Exportar alvarás:', alvarasData)
 }

 return (
  <Card className="p-6">
   <div className="flex flex-row items-center justify-between mb-4">
    <h2 className="text-xl font-semibold">Alvarás Liberados</h2>
    <Button onClick={handleExportAlvaras}>Exportar Alvarás</Button>
   </div>

   <div className="flex flex-row items-center justify-between gap-4 mb-4">
    <div className="flex items-center gap-2 text-sm">
     <label htmlFor="itemsPerPage" className="mr-2">
      Itens por página:
     </label>
     <select
      id="itemsPerPage"
      value={itemsPerPage}
      onChange={handleItemsPerPageSelect}
      className="border rounded px-2 py-1 dark:text-black"
     >
      {PAGE_SIZE_OPTIONS.map(option => (
       <option key={option} value={String(option)}>
        {option}
       </option>
      ))}
     </select>
    </div>

    <div className="text-sm text-muted-foreground dark:text-white">
     Página {currentPage} de {totalPages} • Total: {totalItems}
    </div>
   </div>

   <div className="rounded-md border overflow-x-auto">
    <table className="w-full caption-bottom text-sm">
     <thead className="[&_tr]:border-b">
      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Tipo de Serviço
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Data de Vencimento
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Endereço Completo
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Ocupação
       </th>
      </tr>
     </thead>
     <tbody className="[&_tr:last-child]:border-0">
      {paginatedData.map(alvara => (
       <tr
        key={alvara.id}
        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
       >
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         <Badge variant={alvara.service === 'AVCB' ? 'default' : 'secondary'}>
          {alvara.service}
         </Badge>
        </td>
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         {new Date(alvara.endDate).toLocaleDateString('pt-BR')}
        </td>
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         {alvara.address}
        </td>
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         {alvara.occupation}
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>
   <div className="flex items-center justify-between mt-4">
    <Button variant="outline" disabled={currentPage === 1} onClick={handlePrev}>
     Anterior
    </Button>

    <Button
     variant="outline"
     disabled={currentPage === totalPages}
     onClick={handleNext}
    >
     Próxima
    </Button>
   </div>
   <div className="mt-4 text-sm text-muted-foreground">
    Total de alvarás exibidos: {alvarasData.length}
   </div>
  </Card>
 )
}
