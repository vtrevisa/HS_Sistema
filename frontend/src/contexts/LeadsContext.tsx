import { createContext, useContext, type ReactNode } from 'react'
import type { LeadRequest } from '@/http/types/leads'
import { useLead } from '@/http/use-lead'

interface LeadsContextType {
 leads: LeadRequest[]
 isLoading: boolean
 addLead: (lead: LeadRequest) => void
 addLeads: (leads: LeadRequest[]) => void
 updateLead: (leadId: number, updatedLead: Partial<LeadRequest>) => void
 updateLeadStatus: (leadId: number, newStatus: string) => void
 //getLeadsByStatus: (status: string) => LeadResponse[]
}

interface LeadsProviderProps {
 children: ReactNode
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useLeads = () => {
 const context = useContext(LeadsContext)
 if (!context) {
  throw new Error('useLeads must be used within a LeadsProvider')
 }
 return context
}

export const LeadsProvider = ({ children }: LeadsProviderProps) => {
 const { leadsDB, saveLeads } = useLead()

 function addLead(lead: LeadRequest) {
  saveLeads.mutate([lead])
 }

 function addLeads(leads: LeadRequest[]) {
  saveLeads.mutate(leads)
 }

 function updateLead(leadId: number, updatedLead: Partial<LeadRequest>) {
  console.log('TODO: implementar updateLead mutation', leadId, updatedLead)
  // updateLeadMutation.mutate({ leadId, updatedLead })
 }

 function updateLeadStatus(leadId: number, newStatus: string) {
  console.log('TODO: implementar updateLeadStatus mutation', leadId, newStatus)
  // updateLeadStatusMutation.mutate({ leadId, status: newStatus })
 }

 //  function getLeadsByStatus(status: string) {
 //   if (!leadsDB.data) return []
 //   return leadsDB.data.filter(lead => lead.status === status)
 //  }

 return (
  <LeadsContext.Provider
   value={{
    leads: leadsDB.data || [],
    isLoading: leadsDB.isLoading,
    addLead,
    addLeads,
    updateLead,
    updateLeadStatus
   }}
  >
   {children}
  </LeadsContext.Provider>
 )
}
