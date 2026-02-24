import type { AlvaraLog } from '@/http/types/logs'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { formatDate } from '@/lib/date'

interface LogTableProps {
 filteredLogs: AlvaraLog[]
}

export function LogTable({ filteredLogs }: LogTableProps) {
 return (
  <Card className="p-2 md:p-6">
   <div className="rounded-md border overflow-x-auto">
    <table className="w-full caption-bottom text-sm">
     <thead className="[&_tr]:border-b">
      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Usuário
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
        Cidade
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Tipo de Serviço
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Quantidade
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
        Data do Consumo
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
        Período Consultado
       </th>
      </tr>
     </thead>
     <tbody className="[&_tr:last-child]:border-0">
      {filteredLogs.length === 0 ? (
       <tr>
        <td colSpan={6} className="text-center py-8 text-muted-foreground">
         Nenhum registro encontrado
        </td>
       </tr>
      ) : (
       filteredLogs.map(log => (
        <tr
         key={log.id}
         className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
        >
         <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
          <div>
           <p className="font-medium">{log.userName}</p>
           <p className="text-sm text-muted-foreground">{log.userEmail}</p>
          </div>
         </td>
         <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
          {log.city}
         </td>
         <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
          <Badge
           variant={
            log.service === 'AVCB'
             ? 'default'
             : log.service === 'CLCB'
             ? 'secondary'
             : 'outline'
           }
          >
           {log.service}
          </Badge>
         </td>
         <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-semibold text-right md:text-left">
          {log.quantity}
         </td>
         <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
          {formatDate(log.consumedAt)}
         </td>
         <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
          {formatDate(log.period.start)} - {formatDate(log.period.end)}
         </td>
        </tr>
       ))
      )}
     </tbody>
    </table>
   </div>
  </Card>
 )
}
