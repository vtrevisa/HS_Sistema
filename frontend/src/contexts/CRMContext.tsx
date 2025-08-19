import {
 createContext,
 useContext,
 useState,
 type ReactNode,
 useEffect
} from 'react'
import {
 type Lead,
 type ArchivedProposal,
 type Activity,
 type FileAttachment,
 type ColumnSummary,
 CRM_STATUSES
} from '@/http/types/crm'

interface CRMContextType {
 leads: Lead[]
 archivedProposals: ArchivedProposal[]
 addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void
 updateLead: (leadId: number, updatedLead: Partial<Lead>) => void
 updateLeadStatus: (leadId: number, newStatus: string) => void
 getLeadsByStatus: (status: string) => Lead[]
 getColumnSummary: (status: string) => ColumnSummary
 archiveProposal: (
  leadId: number,
  status: 'Ganho' | 'Perdido',
  reason?: string
 ) => void
 getArchivedProposals: (filter?: 'Ganho' | 'Perdido') => ArchivedProposal[]
 addActivity: (leadId: number, activity: Omit<Activity, 'id' | 'date'>) => void
 addAttachment: (
  leadId: number,
  attachment: Omit<FileAttachment, 'id' | 'uploadedAt'>
 ) => void
 deleteLead: (leadId: number) => void
 calculateDaysInStage: (lead: Lead) => number
 isLeadOverdue: (lead: Lead) => boolean
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useCRM = () => {
 const context = useContext(CRMContext)
 if (!context) {
  throw new Error('useCRM must be used within a CRMProvider')
 }
 return context
}

interface CRMProviderProps {
 children: ReactNode
}

export const CRMProvider = ({ children }: CRMProviderProps) => {
 const [leads, setLeads] = useState<Lead[]>()

 const [archivedProposals, setArchivedProposals] = useState<ArchivedProposal[]>(
  []
 )

 // Calculate days in stage and overdue status for each lead
 useEffect(() => {
  setLeads(prevLeads =>
   prevLeads?.map(lead => ({
    ...lead,
    daysInStage: calculateDaysInStage(lead),
    isOverdue: isLeadOverdue(lead)
   }))
  )
 }, [])

 const calculateDaysInStage = (lead: Lead): number => {
  const lastUpdate = new Date(lead.updatedAt || lead.createdAt || Date.now())
  const now = new Date()
  return Math.floor(
   (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
  )
 }

 const isLeadOverdue = (lead: Lead): boolean => {
  const statusConfig = CRM_STATUSES.find(s => s.title === lead.status)
  if (!statusConfig?.deadline) return false

  const daysInStage = calculateDaysInStage(lead)
  return daysInStage >= statusConfig.deadline
 }

 const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString()
  const newLead: Lead = {
   ...leadData,
   id: Date.now(),
   createdAt: now,
   updatedAt: now,
   activities: [],
   attachments: []
  }
  setLeads(prev => [...prev, newLead])
 }

 const updateLead = (leadId: number, updatedLead: Partial<Lead>) => {
  setLeads(prev =>
   prev?.map(lead =>
    lead.id === leadId
     ? { ...lead, ...updatedLead, updatedAt: new Date().toISOString() }
     : lead
   )
  )
 }

 const updateLeadStatus = (leadId: number, newStatus: string) => {
  const now = new Date().toISOString()
  setLeads(prev =>
   prev?.map(lead =>
    lead.id === leadId
     ? {
        ...lead,
        status: newStatus,
        updatedAt: now,
        activities: [
         ...(lead.activities || []),
         {
          id: Date.now().toString(),
          type: 'status_change',
          description: `Status alterado para: ${newStatus}`,
          date: now
         }
        ]
       }
     : lead
   )
  )
 }

 const getLeadsByStatus = (status: string): Lead[] => {
  const statusMap: { [key: string]: string } = {
   lead: 'Lead / Contato',
   'contato-automatico': 'Contato Automático',
   'contato-manual': 'Contato Manual',
   'proposta-followup': 'Proposta / Follow-UP',
   'cliente-fechado': 'Cliente Fechado'
  }

  const mappedStatus = statusMap[status] || status
  const lead = leads?.filter(lead => lead.status === mappedStatus)
  if (!lead) return
 }

 const getColumnSummary = (status: string): ColumnSummary => {
  const columnLeads = getLeadsByStatus(status)
  return {
   count: columnLeads.length,
   totalValue: columnLeads.reduce(
    (sum, lead) => sum + parseFloat(lead.valorServico || '0'),
    0
   )
  }
 }

 const archiveProposal = (
  leadId: number,
  status: 'Ganho' | 'Perdido',
  reason?: string
 ) => {
  const lead = leads?.find(l => l.id === leadId)
  if (!lead) return

  const archivedProposal: ArchivedProposal = {
   id: Date.now(),
   leadId,
   company: lead.company,
   type: lead.type,
   valor: parseFloat(lead.valorServico || '0'),
   status,
   archivedAt: new Date().toISOString(),
   reason
  }

  setArchivedProposals(prev => [...prev, archivedProposal])

  if (status === 'Ganho') {
   updateLeadStatus(leadId, 'Cliente Fechado')
  } else {
   // Remove lead from active list
   setLeads(prev => prev.filter(l => l.id !== leadId))
  }
 }

 const getArchivedProposals = (
  filter?: 'Ganho' | 'Perdido'
 ): ArchivedProposal[] => {
  if (!filter) return archivedProposals
  return archivedProposals.filter(p => p.status === filter)
 }

 const addActivity = (
  leadId: number,
  activity: Omit<Activity, 'id' | 'date'>
 ) => {
  const newActivity: Activity = {
   ...activity,
   id: Date.now().toString(),
   date: new Date().toISOString()
  }

  setLeads(prev =>
   prev?.map(lead =>
    lead.id === leadId
     ? {
        ...lead,
        activities: [...(lead.activities || []), newActivity],
        updatedAt: new Date().toISOString()
       }
     : lead
   )
  )
 }

 const addAttachment = (
  leadId: number,
  attachment: Omit<FileAttachment, 'id' | 'uploadedAt'>
 ) => {
  const newAttachment: FileAttachment = {
   ...attachment,
   id: Date.now().toString(),
   uploadedAt: new Date().toISOString()
  }

  setLeads(prev =>
   prev?.map(lead =>
    lead.id === leadId
     ? {
        ...lead,
        attachments: [...(lead.attachments || []), newAttachment],
        updatedAt: new Date().toISOString()
       }
     : lead
   )
  )
 }

 const deleteLead = (leadId: number) => {
  setLeads(prev => prev?.filter(lead => lead.id !== leadId))
 }

 return (
  <CRMContext.Provider
   value={{
    leads,
    archivedProposals,
    addLead,
    updateLead,
    updateLeadStatus,
    getLeadsByStatus,
    getColumnSummary,
    archiveProposal,
    getArchivedProposals,
    addActivity,
    addAttachment,
    deleteLead,
    calculateDaysInStage,
    isLeadOverdue
   }}
  >
   {children}
  </CRMContext.Provider>
 )
}
