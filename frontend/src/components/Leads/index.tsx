import { useState } from 'react'
import { useLeads } from '@/contexts/LeadsContext'
import { LeadsActions } from './lead-actions'
import { LeadsFilters } from './lead-filters'
import { LeadsTable } from './leads-table'
import { NewLeadModal } from '../Modals/new-leads'
import { LeadDetailsModal } from '../Modals/lead-details'
import { ImportLeadsModal } from '../Modals/import-leads'

export function Leads() {
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedFilter, setSelectedFilter] = useState('todos')
 const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [isLeadDetailsModalOpen, setIsLeadDetailsModalOpen] = useState(false)
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const [selectedLead, setSelectedLead] = useState<any>(null)

 const { leads, addLead } = useLeads()

 const filteredLeads = leads.filter(lead => {
  const matchesSearch =
   lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
   lead.contact.toLowerCase().includes(searchTerm.toLowerCase())

  if (selectedFilter === 'todos') return matchesSearch

  return matchesSearch && lead.status === selectedFilter
 })

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 function handleImportComplete(importedLeads: any[]) {
  const processedLeads = importedLeads.map(lead => {
   const completeAddress = [
    lead.address || lead.endereco,
    lead.numero,
    lead.complemento,
    lead.bairro,
    lead.municipio || lead.cidade
   ]
    .filter(Boolean)
    .join(', ')

   return {
    ...lead,
    address: completeAddress,
    // Manter os campos originais para referência
    numero: lead.numero,
    complemento: lead.complemento,
    municipio: lead.municipio || lead.cidade,
    bairro: lead.bairro
   }
  })

  processedLeads.forEach(lead => addLead(lead))
  console.log('Leads importados e processados:', processedLeads)
 }

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 function handleNewLead(leadData: any) {
  const completeAddress = [
   leadData.address,
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
  console.log('Novo lead criado:', processedLead)
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
     />
    </div>
   </div>

   <div className="mb-6">
    <LeadsFilters
     searchTerm={searchTerm}
     setSearchTerm={setSearchTerm}
     selectedFilter={selectedFilter}
     setSelectedFilter={setSelectedFilter}
    />
   </div>

   <LeadsTable
    leads={filteredLeads}
    onLeadClick={lead => {
     setSelectedLead(lead)
     setIsLeadDetailsModalOpen(true)
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
  </div>
 )
}
