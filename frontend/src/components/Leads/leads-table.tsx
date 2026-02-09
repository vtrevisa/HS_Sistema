import type { LeadRequest } from '@/http/types/leads'
import { Calendar, Mail, MapPin, Pencil, Phone, Trash } from 'lucide-react'
import { WhatsappLogoIcon } from '@phosphor-icons/react'
import { Badge } from '../ui/badge'

interface LeadsTableProps {
 leads: LeadRequest[]
 onEnrichCompany?: (companyName: string, cnpj?: string) => Promise<unknown>
 isEnriching?: boolean
 hasEnrichmentConfig?: boolean
 onLeadClick?: (lead: LeadRequest) => void
 onDeleteClick: (lead: LeadRequest) => void
 onEnrichLead?: (leadId: number) => Promise<void>
 onBulkEnrich?: (leadIds: number[]) => Promise<void>
}

export function LeadsTable({
 leads,
 onLeadClick,
 onDeleteClick
}: LeadsTableProps) {
 function getCompleteAddress(lead: LeadRequest) {
  const parts: string[] = []
  if (lead.address?.trim()) parts.push(lead.address.trim())
  if (lead.number) parts.push(lead.number)
  if (lead.complement) parts.push(lead.complement)
  if (lead.district) parts.push(lead.district)
  if (lead.city) parts.push(lead.city)

  return parts.join(', ')
 }

 function getStatusColor(status: string) {
  switch (status) {
   case 'Lead':
    return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white'
   case 'Primeiro contato':
    return 'bg-blue-100 text-blue-800 dark:bg-blue-600/30 dark:text-white'
   case 'Follow-up':
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600/30 dark:text-white'
   case 'Proposta enviada':
    return 'bg-orange-100 text-orange-800 dark:bg-orange-600/30 dark:text-white'
   case 'Cliente fechado':
    return 'bg-green-100 text-green-800 dark:bg-green-600/30 dark:text-white'
   case 'Arquivado':
    return 'bg-red-100 text-red-800 dark:bg-red-600/30 dark:text-white'
   default:
    return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white'
  }
 }

 function isVencimentoProximo(vencimento: string) {
  const hoje = new Date()
  const dataVencimento = new Date(vencimento)
  const diasAteVencimento = Math.ceil(
   (dataVencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24)
  )
  return diasAteVencimento <= 30
 }

 return (
  <>
   <div className="data-table overflow-hidden">
    {/* Versão Desktop */}
    <div className="hidden lg:block overflow-x-auto scrollbar-thin">
     <table className="w-full">
      <thead className="bg-muted/50">
       <tr>
        <th className="data-cell text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
         Empresa
        </th>
        <th className="data-cell text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
         Tipo
        </th>
        <th className="data-cell text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
         Status
        </th>
        <th className="data-cell text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
         Vencimento
        </th>
        <th className="data-cell text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
         Data de cadastro
        </th>
        <th className="data-cell text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
         Status da proposta
        </th>

        <th className="data-cell text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
         Contato
        </th>

        <th className="data-cell text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
         Ações
        </th>
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {leads.map(lead => {
        const proposalStatus = lead.archived_proposal?.status

        return (
         <tr
          key={lead.license || lead.id}
          className="data-row cursor-pointer"
          onClick={() => onLeadClick?.(lead)}
         >
          <td className="data-cell">
           <div className="space-y-1">
            <div className="font-semibold text-foreground">{lead.company}</div>
            <div className="text-sm text-muted-foreground">
             {lead.service}-{lead.license}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
             <MapPin size={12} />
             <span className="text-truncate">{getCompleteAddress(lead)}</span>
            </div>
            {lead.categoria && (
             <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <span>📍</span>
              <span>{lead.categoria.replace(/_/g, ' ')}</span>
             </div>
            )}
           </div>
          </td>
          <td className="data-cell">
           <span className="status-badge bg-destructive/10 text-destructive border border-destructive/20">
            {lead.service}
           </span>
           <div className="text-xs text-muted-foreground mt-1">
            {lead.occupation}
           </div>
          </td>
          <td className="data-cell">
           <span
            className={`status-badge ${getStatusColor(lead.status)} capitalize`}
           >
            {lead.status}
           </span>
           <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Calendar size={12} />
            <span>
             Próxima: {new Date(lead.next_action).toLocaleDateString('pt-BR')}
            </span>
           </div>
          </td>
          <td className="data-cell">
           <div
            className={`text-sm ${
             isVencimentoProximo(lead.expiration_date)
              ? 'text-destructive font-semibold'
              : 'text-foreground'
            }`}
           >
            {new Date(lead.validity).toLocaleDateString('pt-BR')}
           </div>
           {isVencimentoProximo(lead.expiration_date) && (
            <div className="text-xs text-destructive flex items-center gap-1">
             <span>⚠️</span>
             <span>Vencimento próximo</span>
            </div>
           )}
          </td>
          <td className="data-cell">
           <div className="text-sm text-foreground mt-1">
            {new Date(lead.created_at ?? '').toLocaleDateString('pt-BR')}
           </div>
          </td>
          <td className="data-cell">
           <div className="text-sm font-medium text-foreground mt-1">
            <Badge
             variant={
              proposalStatus === 'Ganho'
               ? 'default'
               : proposalStatus === 'Perdido'
                 ? 'destructive'
                 : 'secondary'
             }
             className={
              proposalStatus === 'Ganho'
               ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100'
               : proposalStatus === 'Perdido'
                 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-100'
                 : 'bg-black text-white dark:bg-white dark:text-black hover:bg-black'
             }
            >
             {proposalStatus || 'Não arquivada'}
            </Badge>
           </div>
          </td>
          <td className="data-cell">
           <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">
             {lead.contact}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
             <Phone size={12} />
             <span>{lead.phone}</span>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
             <Mail size={12} />
             <span className="text-truncate">{lead.email}</span>
            </div>
            {lead.website && (
             <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>🌐</span>
              <a
               href={lead.website}
               target="_blank"
               rel="noopener noreferrer"
               className="text-truncate hover:underline"
              >
               {lead.website}
              </a>
             </div>
            )}
           </div>
          </td>

          <td className="data-cell">
           <div className="flex gap-1 flex-wrap">
            <button
             onClick={e => {
              e.stopPropagation()
              window.open(
               `https://wa.me/55${lead.phone?.replace(/\D/g, '')}`,
               '_blank'
              )
             }}
             title={`${lead.phone ? `Enviar mensagem para ${lead.phone}` : ''}`}
             type="button"
             className="bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 p-2 rounded-lg transition-colors"
            >
             <WhatsappLogoIcon size={18} />
            </button>
            <button
             onClick={e => {
              e.stopPropagation()
              window.open(`mailto:${lead.email}`, '_blank')
             }}
             title={`${lead.email ? `Enviar email para ${lead.email}` : ''}`}
             type="button"
             className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 p-2 rounded-lg transition-colors"
            >
             <Mail size={14} />
            </button>
            <button
             onClick={() => onLeadClick?.(lead)}
             className="bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 p-2 rounded-lg transition-colors"
             title="Editar"
            >
             <Pencil size={14} />
            </button>
            <button
             onClick={e => {
              e.stopPropagation()
              onDeleteClick(lead)
             }}
             className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 p-2 rounded-lg transition-colors"
             title="Apagar"
            >
             <Trash size={14} />
            </button>
           </div>
          </td>
         </tr>
        )
       })}
      </tbody>
     </table>
    </div>
    {/* Versão Mobile */}
    <div className="lg:hidden divide-y divide-border">
     {leads.map(lead => (
      <div
       key={lead.license || lead.id}
       className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
       onClick={() => onLeadClick?.(lead)}
      >
       <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
         <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{lead.company}</h3>
          <p className="text-sm text-muted-foreground truncate">
           {lead.contact}
          </p>
          {/* {lead.categoria && (
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
           <span>📍</span>
           <span>{lead.categoria.replace(/_/g, ' ')}</span>
          </p>
         )} */}
         </div>
        </div>
        <div className="flex gap-2 ml-2">
         <span className={`status-badge ${getStatusColor(lead.status)}`}>
          {lead.status}
         </span>
        </div>
       </div>
       <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
         <Phone size={14} className="flex-shrink-0" />
         <span className="truncate">{lead.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
         <Mail size={14} className="flex-shrink-0" />
         <span className="truncate">{lead.email}</span>
        </div>
        {lead.website && (
         <div className="flex items-center gap-2 text-primary">
          <span className="flex-shrink-0">🌐</span>
          <a
           href={lead.website}
           target="_blank"
           rel="noopener noreferrer"
           className="truncate text-xs hover:underline"
          >
           {lead.website}
          </a>
         </div>
        )}
        <div className="flex items-start gap-2 text-muted-foreground">
         <MapPin size={14} className="flex-shrink-0 mt-0.5" />
         <span className="text-xs line-clamp-2">
          {getCompleteAddress(lead)}
         </span>
        </div>
       </div>
       <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center mt-3 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
         Vencimento:{' '}
         {new Date(lead.expiration_date).toLocaleDateString('pt-BR')}
         {isVencimentoProximo(lead.expiration_date) && (
          <span className="text-destructive ml-1">⚠️</span>
         )}
        </div>
        <div className="flex gap-1">
         <button
          onClick={e => {
           e.stopPropagation()
           window.open(
            `https://wa.me/55${lead.phone?.replace(/\D/g, '')}`,
            '_blank'
           )
          }}
          title={`${lead.phone ? `Enviar mensagem para ${lead.phone}` : ''}`}
          type="button"
          className="bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 p-2 rounded-lg transition-colors"
         >
          <Phone size={12} />
         </button>
         <button
          onClick={e => {
           e.stopPropagation()
           window.open(`mailto:${lead.email}`, '_blank')
          }}
          title={`${lead.email ? `Enviar email para ${lead.email}` : ''}`}
          type="button"
          className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 p-2 rounded-lg transition-colors"
         >
          <Mail size={12} />
         </button>
         <button
          onClick={() => onLeadClick?.(lead)}
          className="bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 p-2 rounded-lg transition-colors"
          title="Editar"
         >
          <Pencil size={14} />
         </button>
         <button
          onClick={e => {
           e.stopPropagation()
           onDeleteClick(lead)
          }}
          className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 p-2 rounded-lg transition-colors"
          title="Apagar"
         >
          <Trash size={14} />
         </button>
        </div>
       </div>
      </div>
     ))}
    </div>
   </div>
  </>
 )
}
