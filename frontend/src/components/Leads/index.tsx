import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { DateRange } from 'react-day-picker'
import { useQueryClient } from '@tanstack/react-query'

import { LeadsActions } from './lead-actions'
import { LeadsFilters } from './lead-filters'
import { LeadsTable } from './leads-table'

import { NewLeadModal } from '../Modals/new-leads'
import { LeadDetailsModal } from '../Modals/lead-details'
import { DeleteLeadsModal } from '../Modals/delete-leads'

import type { LeadRequest } from '@/http/types/leads'
import { exportLeadsToExcel } from '@/services/leads'
import { useLead } from '@/http/use-lead'
import { useCompany } from '@/http/use-company'

export function Leads() {
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedFilter, setSelectedFilter] = useState('todos')
 const [selectedType, setSelectedType] = useState('todos')
 const [dateRange, setDateRange] = useState<DateRange | undefined>()

 const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
 const [isLeadDetailsModalOpen, setIsLeadDetailsModalOpen] = useState(false)
 const [isDeleteLeadModalOpen, setIsDeleteLeadModalOpen] = useState(false)
 const [selectedLead, setSelectedLead] = useState<LeadRequest | null>(null)

 const queryClient = useQueryClient()

 const { leadsDB, saveLeads } = useLead()

 const { searchByCnpj } = useCompany()

 const leads = useMemo(() => leadsDB.data ?? [], [leadsDB.data])

 const location = useLocation()

 const navigate = useNavigate()

 // Filter leads from context
 const filteredLeads = useMemo(() => {
  return leads.filter(lead => {
   const company = lead.company?.toLowerCase() ?? ''
   const contact = lead.contact?.toLowerCase() ?? ''
   const search = searchTerm.toLowerCase()

   // Busca
   const matchesSearch = company.includes(search) || contact.includes(search)

   // Status
   const matchesStatus = () => {
    if (selectedFilter === 'todos') return true

    // Ganho ou Perdido
    if (selectedFilter === 'Ganho' || selectedFilter === 'Perdido') {
     return lead.archived_proposal?.status === selectedFilter
    }

    return lead.status === selectedFilter
   }

   // Tipo
   const matchesType =
    selectedType === 'todos' ? true : lead.service === selectedType

   // Data
   const matchesDate = () => {
    if (!dateRange?.from || !dateRange?.to) return true

    const from = new Date(dateRange.from)
    from.setHours(0, 0, 0, 0)

    const to = new Date(dateRange.to)
    to.setHours(23, 59, 59, 999)

    let matchesCreatedAt = false
    let matchesExpirationDate = false

    if (lead.created_at) {
     const createdAt = new Date(lead.created_at)
     matchesCreatedAt = createdAt >= from && createdAt <= to
    }

    if (lead.expiration_date) {
     const expirationDate = new Date(lead.expiration_date)
     matchesExpirationDate = expirationDate >= from && expirationDate <= to
    }

    return matchesCreatedAt || matchesExpirationDate
   }

   return matchesSearch && matchesType && matchesStatus() && matchesDate()
  })
 }, [leads, searchTerm, selectedType, selectedFilter, dateRange])

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
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
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
     selectedType={selectedType}
     setSelectedType={setSelectedType}
     selectedStatus={selectedFilter}
     setSelectedStatus={setSelectedFilter}
     dateRange={dateRange}
     setDateRange={setDateRange}
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
    onSearchCnpj={searchByCnpj}
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
