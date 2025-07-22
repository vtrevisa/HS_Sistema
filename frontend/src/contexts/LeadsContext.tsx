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
 const [leads, setLeads] = useState<Lead[]>([
  {
   id: 1,
   company: 'Edifício Residencial Solar',
   type: 'AVCB',
   license: 'AVCB-2023-001',
   contact: 'João Silva',
   phone: '(11) 99999-1111',
   email: 'joao@edificiosolar.com.br',
   address: 'Rua das Flores, 123, Apto 45, Centro, São Paulo/SP',
   numero: '123',
   complemento: 'Apto 45',
   municipio: 'São Paulo',
   bairro: 'Centro',
   cep: '01234-567',
   occupation: 'Residencial Multifamiliar',
   status: 'Lead',
   vencimento: '2024-08-15',
   nextAction: '2024-05-28',
   website: 'www.edificiosolar.com.br',
   cnpj: '12.345.678/0001-90',
   vigencia: '2024-08-15',
   valorServico: '5000'
  },
  {
   id: 2,
   company: 'Shopping Center Plaza',
   type: 'CLCB',
   license: 'CLCB-2023-045',
   contact: 'Carlos Oliveira',
   phone: '(11) 99999-3333',
   email: 'carlos@shoppingplaza.com.br',
   address: 'Av. Principal, 456, Shopping Plaza, Jardins, São Paulo/SP',
   numero: '456',
   complemento: 'Shopping Plaza',
   municipio: 'São Paulo',
   bairro: 'Jardins',
   cep: '01234-890',
   occupation: 'Shopping Center',
   status: 'Primeiro contato',
   vencimento: '2024-07-20',
   nextAction: '2024-05-29',
   website: 'www.shoppingplaza.com.br',
   cnpj: '98.765.432/0001-10',
   vigencia: '2024-07-20',
   valorServico: '15000'
  },
  {
   id: 3,
   company: 'Hotel Business Inn',
   type: 'AVCB',
   license: 'AVCB-2023-078',
   contact: 'Ana Costa',
   phone: '(11) 99999-4444',
   email: 'ana@businessinn.com.br',
   address: 'Rua Comercial, 789, Hotel Business, Vila Olímpia, São Paulo/SP',
   numero: '789',
   complemento: 'Hotel Business',
   municipio: 'São Paulo',
   bairro: 'Vila Olímpia',
   cep: '04567-123',
   occupation: 'Hotel',
   status: 'Follow-up',
   vencimento: '2024-09-10',
   nextAction: '2024-05-30',
   website: 'www.businessinn.com.br',
   cnpj: '11.222.333/0001-44',
   vigencia: '2024-09-10',
   valorServico: '8000'
  }
 ])

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
