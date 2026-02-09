import { useMemo, useState } from 'react'
import { Badge } from '../ui/badge'
import type { Alvaras } from '@/http/types/alvaras'
import { getPaginatedData, getTotalPages } from '@/services/alvaras'
import { Button } from '../ui/button'

interface MyAlvarasTableProps {
 alvaras: Alvaras[]
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250, 500]

export function MyAlvarasTable({ alvaras }: MyAlvarasTableProps) {
 const [currentPage, setCurrentPage] = useState(1)
 const [itemsPerPage, setItemsPerPage] = useState(25)

 const totalItems = alvaras.length
 const totalPages = getTotalPages(totalItems, itemsPerPage)

 const paginatedData = useMemo(() => {
  return getPaginatedData({ data: alvaras, currentPage, itemsPerPage })
 }, [alvaras, currentPage, itemsPerPage])

 const handlePrev = () => {
  setCurrentPage(prev => Math.max(prev - 1, 1))
 }

 const handleNext = () => {
  setCurrentPage(prev => Math.min(prev + 1, totalPages))
 }

 const handleItemsPerPageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = Number(e.target.value)
  setItemsPerPage(value)
  setCurrentPage(1)
 }

 return (
  <>
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
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Cidade
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
         {new Date(alvara.validity).toLocaleDateString('pt-BR')}
        </td>
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         {alvara.address}
        </td>
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         {alvara.occupation}
        </td>
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         {alvara.city}
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
    Total de alvarás: {alvaras.length}
   </div>
  </>
 )
}
