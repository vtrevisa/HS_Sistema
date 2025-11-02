import { Download } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'

interface AlvarasTableProps {
 alvarasData: {
  id: number
  tipoServico: string
  dataVencimento: Date
  enderecoCompleto: string
  ocupacao: string
 }[]
}

export function AlvarasTable({ alvarasData }: AlvarasTableProps) {
 console.log(alvarasData)

 return (
  <Card className="p-6">
   <div className="flex flex-row items-center justify-between mb-4">
    <h2 className="text-xl font-semibold">Alvarás Liberados</h2>
    <Button onClick={() => {}}>
     <Download className="h-4 w-4 mr-2" />
     Exportar Lista
    </Button>
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
      {alvarasData.map(alvara => (
       <tr
        key={alvara.id}
        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
       >
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         <Badge
          variant={alvara.tipoServico === 'AVCB' ? 'default' : 'secondary'}
         >
          {alvara.tipoServico}
         </Badge>
        </td>
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         {new Date(alvara.dataVencimento).toLocaleDateString('pt-BR')}
        </td>
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         {alvara.enderecoCompleto}
        </td>
        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
         {alvara.ocupacao}
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>
   <div className="mt-4 text-sm text-muted-foreground">
    Total de alvarás exibidos: {alvarasData.length}
   </div>
  </Card>
 )
}
