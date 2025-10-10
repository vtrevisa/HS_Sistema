import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
 const [selectedLead, setSelectedLead] = useState<LeadRequest | null>(null)

 const { leads, addLead, addLeads } = useLeads()

 const location = useLocation()

 const navigate = useNavigate()

 // Filter leads from context
 const filteredLeads = leads.filter(lead => {
  const company = lead.company?.toLowerCase() ?? ''
  const contact = lead.contact?.toLowerCase() ?? ''
  const search = searchTerm.toLowerCase()

  const matchesSearch = company.includes(search) || contact.includes(search)

  const matchesStatus =
   selectedFilter === 'todos' ? true : lead.status === selectedFilter
  const matchesType =
   selectedType === 'todos' ? true : lead.service === selectedType

  return matchesSearch && matchesStatus && matchesType
 })

 function handleImportComplete(importedLeads: LeadRequest[]) {
  const processedLeads: LeadRequest[] = importedLeads.map(lead => {
   const completeAddress = [
    lead.address || lead['address' as keyof LeadRequest],
    lead.number,
    lead.complement,
    lead.district,
    lead.city || lead['cidade' as keyof LeadRequest]
   ]
    .filter(Boolean)
    .join(', ')

   return {
    ...lead,
    address: completeAddress,
    // Manter os campos originais para referência
    numero: lead.number,
    complemento: lead.complement,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    municipio: lead.city || (lead as any).cidade,
    bairro: lead.district
   }
  })

  addLeads(processedLeads)
 }

 function handleNewLead(leadData: Omit<LeadRequest, 'id'>) {
  const completeAddress = [
   leadData.address,
   leadData.number,
   leadData.complement,
   leadData.district,
   leadData.city
  ]
   .filter(Boolean)
   .join(', ')

  const processedLead = {
   ...leadData,
   address: completeAddress
  }

  addLead(processedLead)
 }

 function closeLeadDetails() {
  setSelectedLead(null)
  setIsLeadDetailsModalOpen(false)

  navigate('/dashboard/gestao-leads', { replace: true })
 }

 useEffect(() => {
  const params = new URLSearchParams(location.search)
  const leadIdParam = params.get('lead')
  if (leadIdParam) {
   const leadId = Number(leadIdParam)
   const lead = leads.find(lead => lead.id === leadId)
   if (lead) {
    setSelectedLead(lead)
    setIsLeadDetailsModalOpen(true)
   }
  }
 }, [location.search, leads])

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     Gerenciar Leads
    </h1>

    <LeadsActions
     onImportClick={() => setIsImportModalOpen(true)}
     onNewLeadClick={() => setIsNewLeadModalOpen(true)}
     onExportClick={() => exportLeadsToExcel(leads)}
    />
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
    onClose={closeLeadDetails}
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
