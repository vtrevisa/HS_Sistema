import {
 AlertCircle,
 Building,
 CheckCircle,
 Mail,
 MapPin,
 Pencil,
 Phone,
 RefreshCw,
 UserPlus
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import type { CompanyRequest } from '@/http/types/companies'

interface CompaniesTableProps {
 companies: CompanyRequest[]
 processingEnrichment: number[]
 enhanceData: (company: CompanyRequest) => void
 onCompanyClick?: (company: CompanyRequest) => void
 gererateNewLead: (company: CompanyRequest) => void
}

export function CompaniesTable({
 companies,
 processingEnrichment,
 enhanceData,
 onCompanyClick,
 gererateNewLead
}: CompaniesTableProps) {
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
        {companies.map(company => (
         <tr
          key={company.id}
          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
         >
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {company.status === 'enriquecido' ? (
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
           {company.company}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {company.address}, {company.number}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {company.city}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {company.state}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {' '}
           <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
             company.service === 'AVCB'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
            }`}
           >
            {company.service}
           </span>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {new Date(company.validity).toLocaleDateString('pt-BR')}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {company.phone || '-'}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {company.email || '-'}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {company.cnpj || '-'}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           <div className="flex gap-2">
            {company.status === 'pendente' && (
             <Button
              size="sm"
              variant="outline"
              onClick={() => enhanceData(company)}
              disabled={processingEnrichment.includes(company.id)}
             >
              {processingEnrichment.includes(company.id) ? (
               <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
               <RefreshCw className="h-3 w-3" />
              )}
             </Button>
            )}
            <Button
             size="sm"
             variant="outline"
             onClick={() => onCompanyClick?.(company)}
            >
             <Pencil size={14} />
            </Button>
           </div>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           <Button
            size="sm"
            onClick={() => gererateNewLead(company)}
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
      {companies.map(company => (
       <div
        key={company.id}
        onClick={() => onCompanyClick?.(company)}
        className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
       >
        <div className="flex justify-between items-start mb-3">
         <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
           <h3 className="font-semibold text-foreground truncate mb-1">
            {company.company}
           </h3>
           <div className="flex gap-2">
            <div>
             {company.status === 'enriquecido' ? (
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
              company.service === 'AVCB'
               ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
               : 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
             }`}
            >
             {company.service}
            </span>
           </div>
          </div>
         </div>
         <div className="flex flex-col sm:flex-row gap-2 ml-2">
          <div className="flex flex-col gap-2">
           {company.status === 'pendente' && (
            <div>
             <Button
              size="sm"
              variant="outline"
              onClick={() => enhanceData(company)}
              disabled={processingEnrichment.includes(company.id)}
             >
              {processingEnrichment.includes(company.id) ? (
               <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
               <RefreshCw className="h-3 w-3" />
              )}
             </Button>
            </div>
           )}
           <Button
            size="sm"
            variant="outline"
            onClick={() => onCompanyClick?.(company)}
           >
            <Pencil size={14} />
           </Button>
          </div>

          <Button
           size="sm"
           onClick={() => gererateNewLead(company)}
           className="bg-blue-600 hover:bg-blue-700 dark:text-white"
          >
           <UserPlus className="h-3 w-3 mr-1" />
           <span className="hidden sm:block">Gerar Lead</span>
          </Button>
         </div>
        </div>
        <div className="flex gap-2 flex-col">
         {company.cnpj && (
          <div className="flex items-center gap-2 text-muted-foreground">
           <Building size={14} className="flex-shrink-0 mt-0.5" />
           <span className="text-xs line-clamp-2">{company.cnpj}</span>
          </div>
         )}

         {company.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
           <Phone size={14} className="flex-shrink-0 mt-0.5" />
           <span className="text-xs line-clamp-2">{company.phone}</span>
          </div>
         )}

         {company.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
           <Mail size={14} className="flex-shrink-0 mt-0.5" />
           <span className="text-xs line-clamp-2">{company.email}</span>
          </div>
         )}

         <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin size={14} className="flex-shrink-0 mt-0.5" />
          <span className="text-xs line-clamp-2">
           {company.address}, {company.number}, {company.city} - {company.state}
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
