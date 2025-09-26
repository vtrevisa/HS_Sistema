import {
 AlertCircle,
 Building,
 CheckCircle,
 Mail,
 MapPin,
 Phone,
 RefreshCw,
 UserPlus
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

export interface AlvaraEnriquecido {
 id: string
 nomeComercial: string
 endereco: string
 cidade: string
 estado: string
 tipoServico: 'AVCB' | 'CLCB'
 dataVencimento: string
 telefone?: string
 email?: string
 cnpj?: string
 enderecoFormatado?: string
 enriquecido: boolean
}

interface EmpresasTableProps {
 alvaras: AlvaraEnriquecido[]
 processingEnrichment: string[]
 enhanceData: (alvaraId: string) => void
 gererateNewLead: () => void
}

export function EmpresasTable({
 alvaras,
 processingEnrichment,
 enhanceData,
 gererateNewLead
}: EmpresasTableProps) {
 return (
  <Card>
   <CardHeader>
    <CardTitle>Empresas para Enriquecimento</CardTitle>
   </CardHeader>
   <CardContent>
    <div className="data-table overflow-hidden">
     {/* Versão Desktop */}
     <div className="hidden lg:block overflow-x-auto scrollbar-thin">
      <table className="w-full caption-bottom text-sm">
       <thead className="[&_tr]:border-b">
        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Status
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
          Data de Vencimento
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Telefone
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          E-mail
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          CNPJ
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Ações
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Gerar Lead
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
           {alvara.enriquecido ? (
            <Badge
             variant="default"
             className="bg-green-100 text-green-800 hover:bg-green-100"
            >
             <CheckCircle className="h-3 w-3 mr-1" />
             Enriquecido
            </Badge>
           ) : (
            <Badge variant="secondary">
             <AlertCircle className="h-3 w-3 mr-1" />
             Pendente
            </Badge>
           )}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
           {alvara.nomeComercial}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {alvara.enderecoFormatado || alvara.endereco}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {alvara.cidade}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {alvara.estado}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {' '}
           <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
             alvara.tipoServico === 'AVCB'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
            }`}
           >
            {alvara.tipoServico}
           </span>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {new Date(alvara.dataVencimento).toLocaleDateString('pt-BR')}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {alvara.telefone || '-'}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {alvara.email || '-'}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {alvara.cnpj || '-'}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {!alvara.enriquecido && (
            <Button
             size="sm"
             variant="outline"
             onClick={() => enhanceData(alvara.id)}
             disabled={processingEnrichment.includes(alvara.id)}
            >
             {processingEnrichment.includes(alvara.id) ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
             ) : (
              <RefreshCw className="h-3 w-3" />
             )}
            </Button>
           )}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           <Button
            size="sm"
            onClick={gererateNewLead}
            className="bg-blue-600 hover:bg-blue-700 dark:text-white"
           >
            <UserPlus className="h-3 w-3 mr-1" />
            Gerar Lead
           </Button>
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
            <div>
             {alvara.enriquecido ? (
              <Badge
               variant="default"
               className="bg-green-100 text-green-800 hover:bg-green-100"
              >
               <CheckCircle className="h-3 w-3 mr-1" />
               Enriquecido
              </Badge>
             ) : (
              <Badge variant="secondary">
               <AlertCircle className="h-3 w-3 mr-1" />
               Pendente
              </Badge>
             )}
            </div>
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
         <div className="flex flex-col sm:flex-row gap-2 ml-2">
          {!alvara.enriquecido && (
           <div>
            <Button
             size="sm"
             variant="outline"
             onClick={() => enhanceData(alvara.id)}
             disabled={processingEnrichment.includes(alvara.id)}
            >
             {processingEnrichment.includes(alvara.id) ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
             ) : (
              <RefreshCw className="h-3 w-3" />
             )}
            </Button>
           </div>
          )}
          <Button
           size="sm"
           onClick={gererateNewLead}
           className="bg-blue-600 hover:bg-blue-700 dark:text-white"
          >
           <UserPlus className="h-3 w-3 mr-1" />
           <span className="hidden sm:block">Gerar Lead</span>
          </Button>
         </div>
        </div>
        <div className="flex gap-2 flex-col">
         {alvara.cnpj && (
          <div className="flex items-center gap-2 text-muted-foreground">
           <Building size={14} className="flex-shrink-0 mt-0.5" />
           <span className="text-xs line-clamp-2">{alvara.cnpj}</span>
          </div>
         )}

         {alvara.telefone && (
          <div className="flex items-center gap-2 text-muted-foreground">
           <Phone size={14} className="flex-shrink-0 mt-0.5" />
           <span className="text-xs line-clamp-2">{alvara.telefone}</span>
          </div>
         )}

         {alvara.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
           <Mail size={14} className="flex-shrink-0 mt-0.5" />
           <span className="text-xs line-clamp-2">{alvara.email}</span>
          </div>
         )}

         <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin size={14} className="flex-shrink-0 mt-0.5" />
          <span className="text-xs line-clamp-2">
           {alvara.endereco}, {alvara.cidade} - {alvara.estado}
          </span>
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
