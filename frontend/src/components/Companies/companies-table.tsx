import {
 AlertCircle,
 Building,
 CheckCircle,
 Globe,
 Loader2,
 Mail,
 MapPin,
 Pencil,
 Phone,
 RefreshCw,
 Trash2,
 User,
 UserPlus,
 CalendarRange,
 Goal,
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import type { CompanyRequest } from '@/http/types/companies'
import { DatePickerWithRange } from '../ui/date-picker'
import { Label } from '@/components/ui/label'
import type { DateRange } from 'react-day-picker'

interface CompaniesTableProps {
 companies: CompanyRequest[]
 processingEnrichment: number[]
 enhanceData: (company: CompanyRequest) => void
 onCompanyClick?: (company: CompanyRequest) => void
 onDeleteCompany: (company: CompanyRequest) => void
 generateNewLead: (company: CompanyRequest) => void
 loadingCompanyId: string | number | null
 selectedStatus: string
 setSelectedStatus: (status: string) => void
 dateRange: DateRange | undefined
 setDateRange: (range: DateRange | undefined) => void
}

export function CompaniesTable({
 companies,
 processingEnrichment,
 enhanceData,
 onCompanyClick,
 onDeleteCompany,
 generateNewLead,
 loadingCompanyId,
 selectedStatus,
 setSelectedStatus,
 dateRange,
 setDateRange,
}: CompaniesTableProps) {

 return (
  <Card>
  <CardHeader>
   <div className="flex items-center justify-between w-full">
    <CardTitle>Empresas para Enriquecimento</CardTitle>

    <Label htmlFor="expirationPeriod" className="flex items-center gap-1">
       <CalendarRange size={14} />
      Vencimento:
    </Label>
    <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
    <Label htmlFor="statusFilter" className="flex items-center gap-1">
     <Goal size={15}/>Status:
    </Label>
    <select
     value={selectedStatus}
     onChange={e => setSelectedStatus(e.target.value)}
     className="border border-gray-300 bg-background rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
    >
     <option value="todos">Todos</option>
     <option value="pendente">Pendentes</option>
     <option value="enriquecido">Enriquecidos</option>
     <option value="lead">Leads</option>
    </select>
   </div>
  </CardHeader>
   <CardContent>
    <div className="data-table overflow-hidden">
     {/* Versão Desktop */}
     <div className="hidden 1150:block overflow-x-auto scrollbar-thin">
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
          Tipo de Serviço
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
          Data de Vencimento
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 xl-max2:hidden">
          Telefone
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 xl-max2:hidden">
          E-mail
         </th>
         <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 xl-max2:hidden">
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
           ) : company.status === 'lead' ? (
            <Badge
             variant="default"
             className="bg-blue-100 text-blue-800 hover:bg-blue-100"
            >
             <User className="h-3 w-3 mr-1" />
             Lead
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
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 capitalize">
           {[
            company.address.toLowerCase(),
            company.number,
            company.district,
            company.city,
            company.state
           ]
            .filter(Boolean)
            .join(', ')}
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
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 xl-max2:hidden">
           {company.phone || '-'}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 xl-max2:hidden">
           {company.email || '-'}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 xl-max2:hidden">
           {company.cnpj || '-'}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           <div className="flex gap-2">
            {company.status === 'pendente' && (
             <Button
              size="sm"
              variant="outline"
              title="Enriquecer"
              aria-label={`Enriquecer ${company.company}`}
              onClick={() => enhanceData(company)}
              disabled={processingEnrichment.includes(company.id)}
              className="dark:hover:bg-red-600 dark:hover:border-red-600"
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
             title="Editar"
             aria-label={`Editar ${company.company}`}
             onClick={() => onCompanyClick?.(company)}
             className="dark:hover:bg-red-600 dark:hover:border-red-600"
            >
             <Pencil size={14} />
            </Button>

            <Button
             size="sm"
             variant="outline"
             title="Deletar"
             aria-label={`Deletar ${company.company}`}
             onClick={e => {
             e.stopPropagation()
             onDeleteCompany(company)
            }}
             className="bg-red-500 hover:bg-red-600 dark:hover:bg-red-700 dark:hover:border-red-700"
            >
             <Trash2  size={14} />
            </Button>

           </div>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           <Button
            size="sm"
            onClick={() => generateNewLead(company)}
            disabled={loadingCompanyId === company.id || company.status === 'lead'}
            className={company.status.toLowerCase() === 'lead' ? `bg-green-600 hover:bg-green-300 dark:text-white` : `bg-blue-600 hover:bg-blue-700 dark:text-white`}
           >
            {loadingCompanyId === company.id ? (
             <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
             </>
            ) : company.status.toLowerCase() === 'lead' ? (
             <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Lead Gerado
             </>
            ) : (
             <>
              <UserPlus className="h-3 w-3 mr-1" />
              Gerar Lead
             </>
            )}
           </Button>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
     
     {/* Versão Mobile */}
     <div className="block 1150:hidden divide-y divide-border">
      {companies.map(company => (
       <div
        key={company.id}
        onClick={() => onCompanyClick?.(company)}
        className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
       >
        <div className="flex justify-between items-start mb-3">
         <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
           <h3 className="font-semibold text-foreground text-sm leading-snug whitespace-normal break-words mb-1">
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
           onClick={() => generateNewLead(company)}
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

         {company.contact && (
          <div className="flex items-center gap-2 text-muted-foreground">
           <User size={14} className="flex-shrink-0 mt-0.5" />
           <span className="text-xs line-clamp-2">{company.contact}</span>
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

         {company.website && (
          <div className="flex items-center gap-2 text-muted-foreground">
           <Globe size={14} className="flex-shrink-0 mt-0.5" />
           <span className="text-xs line-clamp-2">{company.website}</span>
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
