import { useState } from 'react'
import { useLeads } from '@/contexts/LeadsContext'
import { LeadsActions } from './lead-actions'
import { LeadsFilters } from './lead-filters'
import { LeadsTable } from './leads-table'
import { NewLeadModal } from '../Modals/new-leads'
import { LeadDetailsModal } from '../Modals/lead-details'
import { ImportLeadsModal } from '../Modals/import-leads'
import type { LeadRequest } from '@/http/types/leads'
import { DeleteLeadsModal } from '../Modals/delete-leads'
import { exportLeadsToExcel } from '@/services/leads'

export function Leads() {
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedFilter, setSelectedFilter] = useState('todos')
 const [selectedType, setSelectedType] = useState('todos')
 const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [isLeadDetailsModalOpen, setIsLeadDetailsModalOpen] = useState(false)
 const [isDeleteLeadModalOpen, setIsDeleteLeadModalOpen] = useState(false)
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const [selectedLead, setSelectedLead] = useState<any>(null)

 const { leads, addLead, addLeads } = useLeads()

 // Filter leads from context
 const filteredLeads = leads.filter(lead => {
  const company = lead.empresa?.toLowerCase() ?? ''
  const contact = lead.contato?.toLowerCase() ?? ''
  const search = searchTerm.toLowerCase()

  const matchesSearch = company.includes(search) || contact.includes(search)

  const matchesStatus =
   selectedFilter === 'todos' ? true : lead.status === selectedFilter
  const matchesType =
   selectedType === 'todos' ? true : lead.tipo === selectedType

  return matchesSearch && matchesStatus && matchesType
 })

 function handleImportComplete(importedLeads: LeadRequest[]) {
  const processedLeads: LeadRequest[] = importedLeads.map(lead => {
   const completeAddress = [
    lead.endereco || lead['address' as keyof LeadRequest],
    lead.numero,
    lead.complemento,
    lead.bairro,
    lead.municipio || lead['cidade' as keyof LeadRequest]
   ]
    .filter(Boolean)
    .join(', ')

   return {
    ...lead,
    address: completeAddress,
    // Manter os campos originais para referência
    numero: lead.numero,
    complemento: lead.complemento,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    municipio: lead.municipio || (lead as any).cidade,
    bairro: lead.bairro
   }
  })

  addLeads(processedLeads)
 }

 function handleNewLead(leadData: Omit<LeadRequest, 'id'>) {
  const completeAddress = [
   leadData.endereco,
   leadData.numero,
   leadData.complemento,
   leadData.bairro,
   leadData.municipio
  ]
   .filter(Boolean)
   .join(', ')

  const processedLead = {
   ...leadData,
   address: completeAddress
  }

  addLead(processedLead)
 }

 return (
  <div className="p-4 sm:p-6">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
     Gerenciar Leads
    </h1>
    <div className="flex gap-2 flex-wrap">
     <LeadsActions
      onImportClick={() => setIsImportModalOpen(true)}
      onNewLeadClick={() => setIsNewLeadModalOpen(true)}
      onExportClick={() => exportLeadsToExcel(leads)}
     />
    </div>
   </div>

   <div className="mb-6">
    <LeadsFilters
     searchTerm={searchTerm}
     setSearchTerm={setSearchTerm}
     selectedStatus={selectedFilter}
     setSelectedStatus={setSelectedFilter}
     selectedType={selectedType}
     setSelectedType={setSelectedType}
    />
   </div>

   <LeadsTable
    leads={filteredLeads}
    onLeadClick={lead => {
     setSelectedLead(lead)
     setIsLeadDetailsModalOpen(true)
    }}
    onDeleteClick={lead => {
     setSelectedLead(lead)
     setIsDeleteLeadModalOpen(true)
    }}
   />

   <ImportLeadsModal
    isOpen={isImportModalOpen}
    onClose={() => setIsImportModalOpen(false)}
    onImportComplete={handleImportComplete}
   />

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

   <DeleteLeadsModal
    isOpen={isDeleteLeadModalOpen}
    onClose={() => setIsDeleteLeadModalOpen(false)}
    lead={selectedLead}
   />
  </div>
 )
}
