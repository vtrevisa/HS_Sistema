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
 UserPlus
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import type { CompanyRequest } from '@/http/types/companies'
import { getPaginatedData, getTotalPages } from '@/services/alvaras'

interface CompaniesTableProps {
 companies: CompanyRequest[]
 processingEnrichment: number[]
 companiesWithLead: Set<string>
 enhanceData: (company: CompanyRequest) => void
 onCompanyClick?: (company: CompanyRequest) => void
 onDeleteCompany: (company: CompanyRequest) => void
 gererateNewLead: (company: CompanyRequest) => void
 loadingCompanyId: string | number | null
}

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250, 500]

export function CompaniesTable({
 companies,
 processingEnrichment,
 companiesWithLead,
 enhanceData,
 onCompanyClick,
 onDeleteCompany,
 gererateNewLead,
 loadingCompanyId
}: CompaniesTableProps) {
 const [currentPage, setCurrentPage] = useState(1)
 const [itemsPerPage, setItemsPerPage] = useState(25)

 const totalItems = companies.length
 const totalPages = getTotalPages(totalItems, itemsPerPage)

 const paginatedData = useMemo(() => {
  return getPaginatedData({ data: companies, currentPage, itemsPerPage })
 }, [companies, currentPage, itemsPerPage])

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
      className="border rounded px-2 py-1 bg-background dark:border-white"
     >
      {PAGE_SIZE_OPTIONS.map(option => (
       <option key={option} value={String(option)}>
        {option}
       </option>
      ))}
     </select>
    </div>

    <div className="text-sm text-muted-foreground">
     Página {currentPage} de {totalPages} • Total: {totalItems}
    </div>
   </div>

   <Card className="bg-secondary">
    <CardHeader>
     <CardTitle>Empresas para Enriquecimento</CardTitle>
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
         {paginatedData.map(company => {
          const hasLead = companiesWithLead.has(
           company.company?.trim().toUpperCase()
          )
          return (
           <tr
            key={company.id}
            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
           >
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
             {company.status === 'enriquecido' ? (
              <Badge
               variant="default"
               className="bg-brand-success/20 hover:bg-brand-success/20 text-brand-success hover:text-brand-success border-brand-success/30"
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
             <span className="px-2 py-1 rounded-full text-xs font-medium status-badge bg-destructive/10 text-destructive border border-destructive/20">
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
                onClick={() => enhanceData(company)}
                disabled={processingEnrichment.includes(company.id)}
                title="Aprimorar dados com IA"
                className="bg-primary/10 hover:bg-primary/20 text-primary"
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
               title="Editar"
              >
               <Pencil size={14} />
              </Button>

              <Button
               size="sm"
               variant="outline"
               title="Excluir alvará"
               aria-label="Excluir alvará"
               onClick={() => {
                onDeleteCompany(company)
               }}
               className="text-destructive hover:bg-destructive/10"
              >
               <Trash2 size={14} />
              </Button>
             </div>
            </td>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
             <Button
              size="sm"
              onClick={() => gererateNewLead(company)}
              disabled={hasLead || loadingCompanyId === company.id}
              title={hasLead ? 'Lead já gerado' : 'Gerar lead no CRM'}
              className={
               hasLead
                ? 'bg-brand-success hover:bg-brand-success/90 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }
             >
              {loadingCompanyId === company.id ? (
               <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
               </>
              ) : hasLead ? (
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
          )
         })}
        </tbody>
       </table>
      </div>
      {/* Versão Mobile */}
      <div className="block 1150:hidden divide-y divide-border">
       {paginatedData.map(company => {
        const hasLead = companiesWithLead.has(
         company.company?.trim().toUpperCase()
        )
        return (
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
                 className="bg-brand-success/20 hover:bg-brand-success/20 text-brand-success hover:text-brand-success border-brand-success/30"
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
              <span className="px-2 py-1 rounded-full text-xs font-medium status-badge bg-destructive/10 text-destructive border border-destructive/20">
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
                title="Aprimorar dados com IA"
                disabled={processingEnrichment.includes(company.id)}
                className="bg-primary/10 hover:bg-primary/20 text-primary"
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
              title="Editar"
             >
              <Pencil size={14} />
             </Button>

             <Button
              size="sm"
              variant="outline"
              title="Excluir alvará"
              aria-label="Excluir alvará"
              onClick={() => {
               onDeleteCompany(company)
              }}
              className="text-destructive hover:bg-destructive/10"
             >
              <Trash2 size={14} />
             </Button>
            </div>

            <Button
             size="sm"
             onClick={() => gererateNewLead(company)}
             disabled={hasLead}
             title={hasLead ? 'Lead já gerado' : 'Gerar lead no CRM'}
             className={
              hasLead
               ? 'bg-brand-success hover:bg-brand-success/90 text-white'
               : 'bg-primary hover:bg-primary/90 text-primary-foreground'
             }
            >
             {hasLead ? (
              <>
               <CheckCircle className="h-3 w-3 mr-1" />
               <span className="hidden sm:block">Lead Gerado</span>
              </>
             ) : (
              <>
               <UserPlus className="h-3 w-3 mr-1" />
               <span className="hidden sm:block">Gerar Lead</span>
              </>
             )}
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
             {company.address}, {company.number}, {company.city} -{' '}
             {company.state}
            </span>
           </div>
          </div>
         </div>
        )
       })}
      </div>
     </div>
     <div className="flex items-center justify-between mt-4">
      <Button
       variant="outline"
       disabled={currentPage === 1}
       onClick={handlePrev}
      >
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
      Total de empresas: {companies.length}
     </div>
    </CardContent>
   </Card>
  </>
 )
}
