import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LeadsActions } from './lead-actions'
import { LeadsFilters } from './lead-filters'
import { LeadsTable } from './leads-table'
import { NewLeadModal } from '../Modals/new-leads'
import { LeadDetailsModal } from '../Modals/lead-details'
import type { LeadRequest } from '@/http/types/leads'
import { DeleteLeadsModal } from '../Modals/delete-leads'
import { exportLeadsToExcel } from '@/services/leads'
import { useLead } from '@/http/use-lead'

import { useQueryClient } from '@tanstack/react-query'

export function Leads() {
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedFilter, setSelectedFilter] = useState('todos')
 const [selectedType, setSelectedType] = useState('todos')
 const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
 const [isLeadDetailsModalOpen, setIsLeadDetailsModalOpen] = useState(false)
 const [isDeleteLeadModalOpen, setIsDeleteLeadModalOpen] = useState(false)
 const [selectedLead, setSelectedLead] = useState<LeadRequest | null>(null)

 const queryClient = useQueryClient()

 const { leadsDB, saveLeads } = useLead()

 const leads = useMemo(() => leadsDB.data ?? [], [leadsDB.data])

 const location = useLocation()

 const navigate = useNavigate()

 // Filter leads from context
 const filteredLeads = useMemo(() => {
  return leads.filter(lead => {
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
 }, [leads, searchTerm, selectedFilter, selectedType])

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

  saveLeads.mutate([{ ...leadData, address: completeAddress }])
 }

 function closeLeadDetails() {
  setSelectedLead(null)
  setIsLeadDetailsModalOpen(false)

  queryClient.invalidateQueries({ queryKey: ['leads'] })

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
