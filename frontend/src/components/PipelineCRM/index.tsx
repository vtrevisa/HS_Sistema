import { useCRM } from '@/contexts/CRMContext'
import { useLeads } from '@/contexts/LeadsContext'
import { PipelineActions } from './pipeline-actions'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { NewLeadModal } from '../Modals/new-leads'
import { LeadDetailsModal } from '../Modals/lead-details'

import { PipelineLeadCard } from './pipeline-lead-card'
import type { LeadRequest } from '@/http/types/leads'

export function Pipeline() {
 const { getLeadsByStatus, getColumnSummary, updateLeadStatus } = useCRM()
 const { addLead } = useLeads()
 const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
 const [selectedLead, setSelectedLead] = useState<LeadRequest | null>(null)
 const [isLeadDetailsModalOpen, setIsLeadDetailsModalOpen] = useState(false)
 const [draggedLead, setDraggedLead] = useState<LeadRequest | null>(null)

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

 function handleNewLead(leadData: Omit<LeadRequest, 'id'>) {
  addLead(leadData)
  console.log('Novo lead criado:', leadData)
 }

 function handleLeadClick(lead: LeadRequest) {
  setSelectedLead(lead)
  setIsLeadDetailsModalOpen(true)
 }

 // Inicia o arraste de um lead
 function handleDragStart(e: React.DragEvent, lead: LeadRequest) {
  setDraggedLead(lead)
  e.dataTransfer.effectAllowed = 'move'
 }

 // Permite que o drop aconteça
 function handleDragOver(e: React.DragEvent) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
 }

 // Solta o lead em uma nova coluna
 function handleDrop(e: React.DragEvent, columnId: string) {
  e.preventDefault()
  if (!draggedLead) return

  if (draggedLead) {
   const statusMap: Record<string, string> = {
    lead: 'Lead',
    'contato-automatico': 'Primeiro contato',
    'contato-manual': 'Follow-up',
    'proposta-followup': 'Proposta enviada',
    'cliente-fechado': 'Cliente fechado',
    arquivado: 'Arquivado'
   }

   const newStatus = statusMap[columnId]

   if (newStatus && draggedLead.status !== newStatus) {
    // Atualiza o status via LeadsContext
    updateLeadStatus(draggedLead.id!, newStatus)
    console.log(`Lead movido para ${newStatus}: ${draggedLead.company}`)
   }
  }

  setDraggedLead(null)
 }

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     CRM - Funil de Vendas
    </h1>
    <PipelineActions onNewLeadClick={() => setIsNewLeadModalOpen(true)} />
   </div>

   {/* Mobile: Scrollable horizontal layout */}
   <div className="lg:hidden">
    <div className="grid sm-max:grid-cols-1 md-min:grid-cols-2 gap-4 overflow-x-auto pb-4">
     {columns.map(column => {
      const columnLeads = getLeadsByStatus(column.id)
      const summary = getColumnSummary(column.id)

      return (
       <div
        key={column.id}
        className={`${column.color} rounded-lg p-4 min-h-[400px] min-w-[280px] flex-shrink-0`}
        onDragOver={handleDragOver}
        onDrop={e => handleDrop(e, column.id)}
       >
        <div className="mb-4">
         <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-foreground text-sm">{column.title}</h2>
          {column.deadline && (
           <span className="text-xs text-muted-foreground">
            {column.deadline}d
           </span>
          )}
         </div>
         <div className="flex justify-between items-center text-xs">
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
          <div
           key={lead.id}
           draggable
           onDragStart={e => handleDragStart(e, lead)}
          >
           <PipelineLeadCard lead={lead} onLeadClick={handleLeadClick} />
          </div>
         ))}
        </div>

        <button
         onClick={() => setIsNewLeadModalOpen(true)}
         className="w-full mt-3 border-2 border-dashed border-border dark:border-white dark:text-white rounded-lg p-3 text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 text-sm"
        >
         <Plus size={14} />
         Adicionar lead
        </button>
       </div>
      )
     })}
    </div>
   </div>

   {/* Desktop: Grid layout */}
   <div className="hidden lg:grid lg:grid-cols-3 xl-max:grid-cols-4 2xl:grid-cols-5 gap-4">
    {columns.map(column => {
     const columnLeads = getLeadsByStatus(column.id)
     const summary = getColumnSummary(column.id)

     return (
      <div
       key={column.id}
       className={`${column.color} rounded-lg p-4 min-h-[600px]`}
       onDragOver={handleDragOver}
       onDrop={e => handleDrop(e, column.id)}
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
         <div
          key={lead.id}
          draggable
          onDragStart={e => handleDragStart(e, lead)}
         >
          <PipelineLeadCard lead={lead} onLeadClick={handleLeadClick} />
         </div>
        ))}
       </div>

       <button
        onClick={() => setIsNewLeadModalOpen(true)}
        className="w-full mt-4 border-2 border-dashed border-border dark:border-white dark:text-white rounded-lg p-4 text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
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
