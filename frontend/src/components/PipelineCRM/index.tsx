import { useState } from 'react'
import { Plus } from 'lucide-react'

import { useCRM } from '@/http/use-crm'
import { useLead } from '@/http/use-lead'

import { PipelineActions } from './pipeline-actions'
import { NewLeadModal } from '../Modals/new-leads'
import { LeadDetailsModal } from '../Modals/lead-details'
import { PipelineLeadCard } from './pipeline-lead-card'

import type { LeadRequest } from '@/http/types/leads'
import { useCompany } from '@/http/use-company'
import { NewTaskModal } from '../Modals/new-task'
import { useTasks } from '@/http/use-tasks'

export function Pipeline() {
 const {
  getLeadsByStatus,
  getColumnSummary,
  handleDragStart,
  handleDragOver,
  handleDrop,
  getColumnColor
 } = useCRM()

 const { saveLeads } = useLead()

 const { searchByCnpj } = useCompany()

 const { saveTasks } = useTasks()

 const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
 const [selectedLead, setSelectedLead] = useState<LeadRequest | null>(null)
 const [isLeadDetailsModalOpen, setIsLeadDetailsModalOpen] = useState(false)
 const [isAgendarTarefaOpen, setIsAgendarTarefaOpen] = useState(false)

 const CRM_STATUSES = [
  { id: 'lead', title: 'Lead / Contato', deadline: 7 },
  { id: 'contato-automatico', title: 'Contato Automático', deadline: null },
  { id: 'contato-manual', title: 'Contato Manual', deadline: 30 },
  { id: 'proposta-followup', title: 'Proposta / Follow-UP', deadline: 60 },
  { id: 'cliente-fechado', title: 'Cliente Fechado', deadline: null }
 ] as const

 function handleNewLead(leadData: Omit<LeadRequest, 'id'>) {
  saveLeads.mutate([leadData])
 }

 function handleLeadClick(lead: LeadRequest) {
  setSelectedLead(lead)
  setIsLeadDetailsModalOpen(true)
 }

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex flex-col sm:flex-row  justify-between items-start sm:items-center gap-2">
    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
     CRM - Funil de Vendas
    </h1>
    <PipelineActions onNewLeadClick={() => setIsNewLeadModalOpen(true)} />
   </div>

   {/* Mobile: Scrollable horizontal layout */}
   <div className="lg:hidden">
    <div className="grid sm-max:grid-cols-1 md-min:grid-cols-2 gap-4 overflow-x-auto pb-4">
     {CRM_STATUSES.map(column => {
      const columnLeads = getLeadsByStatus(column.id)
      const summary = getColumnSummary(column.id)

      return (
       <div
        key={column.id}
        className={`${getColumnColor(
         column.id
        )} rounded-lg p-4 min-h-[400px] min-w-[280px] flex-shrink-0 border`}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(column.id)}
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
           onDragStart={() => handleDragStart(lead)}
          >
           <PipelineLeadCard lead={lead} onLeadClick={handleLeadClick} />
          </div>
         ))}
        </div>

        <button
         onClick={() => setIsNewLeadModalOpen(true)}
         className="w-full mt-3 border-2 border-dashed border-border rounded-lg p-3 text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 text-sm"
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
    {CRM_STATUSES.map(column => {
     const columnLeads = getLeadsByStatus(column.id)
     const summary = getColumnSummary(column.id)

     return (
      <div
       key={column.id}
       className={`${getColumnColor(column.id)} rounded-lg p-4 min-h-[600px] border`}
       onDragOver={handleDragOver}
       onDrop={() => handleDrop(column.id)}
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
         <div key={lead.id} draggable onDragStart={() => handleDragStart(lead)}>
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
    onSearchCnpj={searchByCnpj}
   />

   <LeadDetailsModal
    isOpen={isLeadDetailsModalOpen}
    onClose={() => setIsLeadDetailsModalOpen(false)}
    onOpenTask={() => setIsAgendarTarefaOpen(true)}
    lead={selectedLead}
   />

   <NewTaskModal
    isOpen={isAgendarTarefaOpen}
    onOpenChange={() => setIsAgendarTarefaOpen(false)}
    onSave={task => saveTasks.mutate(task)}
    leadId={selectedLead?.id}
   />
  </div>
 )
}
