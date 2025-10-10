import { useCRM } from '@/contexts/CRMContext'
import { PipelineActions } from './PipelineActions'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { NewLeadModal } from '../Modals/new-leads'
import { LeadDetailsModal } from '../Modals/lead-details'

import { PipelineLeadCard } from './PipelineLeadCard'
import type { Lead } from '@/http/types/crm'

export function Pipeline() {
 const { getLeadsByStatus, getColumnSummary, addLead } = useCRM()

 const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
 const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
 const [isLeadDetailsModalOpen, setIsLeadDetailsModalOpen] = useState(false)

 const CRM_STATUSES = [
  { id: 'lead', title: 'Lead / Contato', deadline: 7 },
  { id: 'contato-automatico', title: 'Contato Automático', deadline: null },
  { id: 'contato-manual', title: 'Contato Manual', deadline: 30 },
  { id: 'proposta-followup', title: 'Proposta / Follow-UP', deadline: 60 },
  { id: 'cliente-fechado', title: 'Cliente Fechado', deadline: null }
 ] as const

 const columns = CRM_STATUSES.map(status => ({
  id: status.id,
  title: status.title,
  deadline: status.deadline,
  color: getColumnColor(status.id)
 }))

 function getColumnColor(statusId: string) {
  switch (statusId) {
   case 'lead':
    return 'bg-muted border-border'
   case 'contato-automatico':
    return 'bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/20'
   case 'contato-manual':
    return 'bg-yellow-500/10 border-yellow-500/20 dark:bg-yellow-500/20'
   case 'proposta-followup':
    return 'bg-orange-500/10 border-orange-500/20 dark:bg-orange-500/20'
   case 'cliente-fechado':
    return 'bg-green-500/10 border-green-500/20 dark:bg-green-500/20'
   default:
    return 'bg-muted border-border'
  }
 }

 function handleNewLead(leadData: Omit<Lead, 'id'>) {
  addLead(leadData)
  console.log('Novo lead criado:', leadData)
 }

 function handleLeadClick(lead: Lead) {
  setSelectedLead(lead)
  setIsLeadDetailsModalOpen(true)
 }

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     CRM - Funil de Vendas
    </h1>
    <PipelineActions />
   </div>

   {/* Mobile: Scrollable horizontal layout */}
   <div className="lg:hidden">
    <div className="flex gap-4 overflow-x-auto pb-4"></div>
   </div>

   {/* Desktop: Grid layout */}
   <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-6 gap-4">
    {columns.map(column => {
     const columnLeads = getLeadsByStatus(column.id)
     const summary = getColumnSummary(column.id)

     return (
      <div
       key={column.id}
       className={`${column.color} rounded-lg p-4 min-h-[600px]`}
      >
       <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
         <h2 className="font-bold text-foreground">{column.title}</h2>
         {column.deadline && (
          <span className="text-xs text-muted-foreground">
           {column.deadline} dias
          </span>
         )}
        </div>
        <div className="flex justify-between items-center text-sm">
         <span className="bg-background/80 rounded-full px-2 py-1 font-medium text-muted-foreground border border-border">
          {summary.count} cards
         </span>
         <span className="font-semibold text-foreground">
          {new Intl.NumberFormat('pt-BR', {
           style: 'currency',
           currency: 'BRL',
           notation: 'compact'
          }).format(summary.totalValue)}
         </span>
        </div>
       </div>

       <div className="space-y-3">
        {columnLeads.map(lead => (
         <div key={lead.id} draggable>
          <PipelineLeadCard lead={lead} onLeadClick={handleLeadClick} />
         </div>
        ))}
       </div>

       <button
        onClick={() => setIsNewLeadModalOpen(true)}
        className="w-full mt-4 border-2 border-dashed border-border rounded-lg p-4 text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
       >
        <Plus size={16} />
        Adicionar lead
       </button>
      </div>
     )
    })}
   </div>

   <NewLeadModal
    isOpen={isNewLeadModalOpen}
    onClose={() => setIsNewLeadModalOpen(false)}
    onLeadCreate={handleNewLead}
   />

   <LeadDetailsModal
    isOpen={isLeadDetailsModalOpen}
    onClose={() => setIsLeadDetailsModalOpen(false)}
    lead={selectedLead}
   />
  </div>
 )
}
