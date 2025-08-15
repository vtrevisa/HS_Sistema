import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Lead } from '@/http/types/leads'

interface LeadsContextType {
 leads: Lead[]
 addLead: (lead: Omit<Lead, 'id'>) => void
 updateLead: (leadId: number, updatedLead: Partial<Lead>) => void
 updateLeadStatus: (leadId: number, newStatus: string) => void
 getLeadsByStatus: (status: string) => Lead[]
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
 const [leads, setLeads] = useState<Lead[]>([])

 function addLead(leadData: Omit<Lead, 'id'>) {
  const newLead: Lead = {
   ...leadData,
   id: Date.now()
  }
  setLeads(prev => [...prev, newLead])
  console.log('Novo lead adicionado:', newLead)
 }

 function updateLead(leadId: number, updatedLead: Partial<Lead>) {
  setLeads(prev =>
   prev.map(lead => (lead.id === leadId ? { ...lead, ...updatedLead } : lead))
  )
  console.log('Lead atualizado:', leadId, updatedLead)
 }

 function updateLeadStatus(leadId: number, newStatus: string) {
  setLeads(prev =>
   prev.map(lead =>
    lead.id === leadId ? { ...lead, status: newStatus } : lead
   )
  )
  console.log('Status do lead atualizado:', leadId, newStatus)
 }

 function getLeadsByStatus(status: string) {
  const statusMap: { [key: string]: string } = {
   lead: 'Lead',
   'primeiro-contato': 'Primeiro Contato',
   'follow-up': 'Follow-up',
   'proposta-enviada': 'Proposta Enviada',
   'cliente-fechado': 'Cliente Fechado',
   arquivado: 'Arquivado'
  }

  const mappedStatus = statusMap[status] || status
  return leads.filter(lead => lead.status === mappedStatus)
 }

 return (
  <LeadsContext.Provider
   value={{
    leads,
    addLead,
    updateLead,
    updateLeadStatus,
    getLeadsByStatus
   }}
  >
   {children}
  </LeadsContext.Provider>
 )
}
