import { Badge } from '../ui/badge'
import type { Alvaras } from '@/http/types/alvaras'

interface MyAlvarasTableProps {
 alvaras: Alvaras[]
}

export function MyAlvarasTable({ alvaras }: MyAlvarasTableProps) {
 return (
  <>
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
      {alvaras.map(alvara => (
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
   <div className="mt-4 text-sm text-muted-foreground">
    Total de alvarás: {alvaras.length}
   </div>
  </>
 )
}
