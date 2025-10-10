import { createContext, useContext, type ReactNode, useMemo } from 'react'
import { useLeads } from './LeadsContext'
import type { LeadRequest } from '@/http/types/leads'

interface CRMContextType {
 pipelineLeads: (LeadRequest & { daysInStage: number; isOverdue: boolean })[]
 getLeadsByStatus: (
  status: string
 ) => (LeadRequest & { daysInStage: number; isOverdue: boolean })[]
 getColumnSummary: (status: string) => { count: number; totalValue: number }
 updateLeadStatus: (leadId: number, newStatus: string) => Promise<void>
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useCRM = () => {
 const context = useContext(CRMContext)
 if (!context) throw new Error('useCRM must be used within a CRMProvider')
 return context
}

interface CRMProviderProps {
 children: ReactNode
}

export const CRMProvider = ({ children }: CRMProviderProps) => {
 const { leads, updateLead } = useLeads()

 const statusToColumnId: Record<string, string> = {
  Lead: 'lead',
  'Primeiro contato': 'contato-automatico',
  'Follow-up': 'contato-manual',
  'Proposta enviada': 'proposta-followup',
  'Cliente fechado': 'cliente-fechado',
  Arquivado: 'arquivado'
 }

 const pipelineLeads = useMemo(() => {
  return leads.map(lead => {
   const updatedAt = new Date(lead.updated_at || lead.created_at || Date.now())
   const now = new Date()
   const daysInStage = Math.floor(
    (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
   )

   const statusDeadlines: Record<string, number | null> = {
    Lead: 7,
    'Primeiro contato': 7,
    'Follow-up': 30,
    'Proposta enviada': 60,
    'Cliente fechado': null,
    Arquivado: null
   }
   const deadline = statusDeadlines[lead.status] || null
   const isOverdue = deadline !== null ? daysInStage > deadline : false

   return { ...lead, daysInStage, isOverdue }
  })
 }, [leads])

 const getLeadsByStatus = (columnId: string) =>
  pipelineLeads.filter(lead => statusToColumnId[lead.status] === columnId)

 const getColumnSummary = (status: string) => {
  const columnLeads = getLeadsByStatus(status)
  return {
   count: columnLeads.length,
   totalValue: columnLeads.reduce(
    (sum, lead) => sum + parseFloat(lead.service_value || '0'),
    0
   )
  }
 }

 async function updateLeadStatus(leadId: number, newStatus: string) {
  const lead = leads.find(lead => lead.id === leadId)
  if (!lead) return

  const leadToUpdate = { ...lead, status: newStatus }

  try {
   // Atualiza no backend
   await updateLead(leadToUpdate)

   console.log(`✅ Lead #${leadId} movido para: ${newStatus}`)
  } catch (error) {
   console.error('Erro ao atualizar status do lead:', error)
  }
 }

 return (
  <CRMContext.Provider
   value={{
    pipelineLeads,
    getLeadsByStatus,
    getColumnSummary,
    updateLeadStatus
   }}
  >
   {children}
  </CRMContext.Provider>
 )
}
