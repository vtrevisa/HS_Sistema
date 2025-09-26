import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

interface Alvara {
 id: string
 nomeComercial: string
 endereco: string
 cidade: string
 estado: string
 tipoServico: 'AVCB' | 'CLCB'
 dataVencimento: string
 ocupacao: string
}

interface AlvarasTableProps {
 selectedAlvaras: string[]
 setSelectedAlvaras: React.Dispatch<React.SetStateAction<string[]>>
}

export function AlvarasTable({
 selectedAlvaras,
 setSelectedAlvaras
}: AlvarasTableProps) {
 const alvaras: Alvara[] = [
  {
   id: '1',
   nomeComercial: 'Shopping Center ABC',
   endereco: 'Av. Principal, 123',
   cidade: 'São Paulo',
   estado: 'SP',
   tipoServico: 'CLCB',
   dataVencimento: '2024-12-15',
   ocupacao: 'Shopping'
  },
  {
   id: '2',
   nomeComercial: 'Edifício Comercial XYZ',
   endereco: 'Rua Comercial, 456',
   cidade: 'Rio de Janeiro',
   estado: 'RJ',
   tipoServico: 'AVCB',
   dataVencimento: '2024-11-20',
   ocupacao: 'Comercial'
  }
 ]

 function toggleSelection(alvaraId: string) {
  setSelectedAlvaras(prev =>
   prev.includes(alvaraId)
    ? prev.filter(id => id !== alvaraId)
    : [...prev, alvaraId]
  )
 }

 return (
  <Card>
   <CardHeader>
    <CardTitle>Alvarás Encontrados</CardTitle>
   </CardHeader>
   <CardContent>
    <div className="data-table overflow-hidden">
     {/* Versão Desktop */}
     <div className="hidden lg:block overflow-x-auto scrollbar-thin">
      <table className="w-full caption-bottom text-sm">
       <thead className="[&_tr]:border-b">
        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-12">
          <input
           type="checkbox"
           onChange={e => {
            if (e.target.checked) {
             setSelectedAlvaras(alvaras.map(a => a.id))
            } else {
             setSelectedAlvaras([])
            }
           }}
           checked={selectedAlvaras.length === alvaras.length}
          />
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Nome Comercial
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Endereço
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Cidade
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Estado
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Tipo de Serviço
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Ocupação
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Data de Vencimento
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
           <input
            type="checkbox"
            checked={selectedAlvaras.includes(alvara.id)}
            onChange={() => toggleSelection(alvara.id)}
           />
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
           {alvara.nomeComercial}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {alvara.endereco}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {alvara.cidade}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {alvara.estado}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
             alvara.tipoServico === 'AVCB'
              ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
              : 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
            }`}
           >
            {alvara.tipoServico}
           </span>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
            {alvara.ocupacao}
           </span>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {new Date(alvara.dataVencimento).toLocaleDateString('pt-BR')}
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
     {/* Versão Mobile */}
     <div className="lg:hidden divide-y divide-border">
      {alvaras.map(alvara => (
       <div
        key={alvara.id}
        className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
       >
        <div className="flex justify-between items-start mb-3">
         <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
           <h3 className="font-semibold text-foreground truncate mb-1">
            {alvara.nomeComercial}
           </h3>
           <div className="flex gap-2">
            <span className="text-sm text-muted-foreground truncate px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
             {alvara.ocupacao}
            </span>
            <span
             className={`px-2 py-1 rounded-full text-sm truncate ${
              alvara.tipoServico === 'AVCB'
               ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
               : 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
             }`}
            >
             {alvara.tipoServico}
            </span>
           </div>
          </div>
         </div>
         <div className="flex gap-2 ml-2">
          <input
           type="checkbox"
           checked={selectedAlvaras.includes(alvara.id)}
           onChange={() => toggleSelection(alvara.id)}
          />
         </div>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
         <MapPin size={14} className="flex-shrink-0 mt-0.5" />
         <span className="text-xs line-clamp-2">
          {alvara.endereco}, {alvara.cidade} - {alvara.estado}
         </span>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
         <div className="text-xs text-muted-foreground">
          Data de Vencimento:{' '}
          {new Date(alvara.dataVencimento).toLocaleDateString('pt-BR')}
         </div>
        </div>
       </div>
      ))}
     </div>
    </div>
   </CardContent>
  </Card>
 )
}
