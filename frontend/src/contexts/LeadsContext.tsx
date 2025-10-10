import { createContext, useContext, type ReactNode } from 'react'
import type { LeadRequest } from '@/http/types/leads'
import { useLead } from '@/http/use-lead'

interface LeadsContextType {
 leads: LeadRequest[]
 isLoading: boolean
 addLead: (lead: LeadRequest) => void
 addLeads: (leads: LeadRequest[]) => void
 updateLead: (lead: LeadRequest) => void
 deleteLead: (leadId: number) => void
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
 const { leadsDB, saveLeads, updateLead, deleteLead } = useLead()

 function addLead(lead: LeadRequest) {
  saveLeads.mutate([lead])
 }

 function addLeads(leads: LeadRequest[]) {
  saveLeads.mutate(leads)
 }

 return (
  <LeadsContext.Provider
   value={{
    leads: leadsDB.data || [],
    isLoading: leadsDB.isLoading,
    addLead,
    addLeads,
    updateLead: (lead: LeadRequest) => updateLead.mutate(lead),
    deleteLead: (leadId: number) => deleteLead.mutate(leadId)
   }}
  >
   {children}
  </LeadsContext.Provider>
 )
}
