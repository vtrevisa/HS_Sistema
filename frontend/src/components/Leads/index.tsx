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
import { daysUntil } from '@/lib/days'
import { useCompany } from '@/http/use-company'

export function Leads() {
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedFilter, setSelectedFilter] = useState('todos')
 const [selectedType, setSelectedType] = useState('todos')

 const [expirationFilter, setExpirationFilter] = useState('todos')
 const [createdAtFilter, setCreatedAtFilter] = useState('todos')

 const [selectedResult, setSelectedResult] = useState<
  'todos' | 'Ganho' | 'Perdido'
 >('todos')

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
   const matchesStatus =
    selectedFilter === 'todos' ? true : lead.status === selectedFilter

   // Tipo
   const matchesType =
    selectedType === 'todos' ? true : lead.service === selectedType

   // Validade do alvará
   let matchesExpiration = true

   if (expirationFilter !== 'todos' && lead.validity) {
    const days = daysUntil(lead.validity)

    if (expirationFilter === 'vencido') {
     matchesExpiration = days < 0
    }

    if (expirationFilter === '30') {
     matchesExpiration = days >= 0 && days <= 30
    }

    if (expirationFilter === '60') {
     matchesExpiration = days >= 0 && days <= 60
    }
   }

   // Data de cadastro
   let matchesCreatedAt = true
   if (createdAtFilter !== 'todos') {
    if (!lead.created_at) return false

    const createdAt = new Date(lead.created_at)
    const now = new Date()

    const diffDays = (now.getTime() - createdAt.getTime()) / 86400000

    if (createdAtFilter === '7') {
     matchesCreatedAt = diffDays <= 7
    }

    if (createdAtFilter === '30') {
     matchesCreatedAt = diffDays <= 30
    }
   }

   // Propostas

   const matchesResult =
    selectedResult === 'todos'
     ? true
     : lead.archived_proposal?.status === selectedResult

   return (
    matchesSearch &&
    matchesType &&
    matchesStatus &&
    matchesExpiration &&
    matchesCreatedAt &&
    matchesResult
   )
  })
 }, [
  leads,
  searchTerm,
  selectedType,
  selectedFilter,
  expirationFilter,
  createdAtFilter,
  selectedResult
 ])

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
     selectedType={selectedType}
     setSelectedType={setSelectedType}
     selectedStatus={selectedFilter}
     setSelectedStatus={setSelectedFilter}
     expirationFilter={expirationFilter}
     setExpirationFilter={setExpirationFilter}
     createdAtFilter={createdAtFilter}
     setCreatedAtFilter={setCreatedAtFilter}
     selectedResult={selectedResult}
     setSelectedResult={setSelectedResult}
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
