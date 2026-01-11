export interface LeadsCard {
  totalLeads: number
  leadsThisMonth: number
  growthPercentage: number
}

export interface PipelineCard {
  totalPipeline: number
  pipelineThisMonth: number
  growthPercentage: number
}

export interface PropostasCard {
  totalPropostas: number
  propostasThisMonth: number
  growthPercentage: number
}

export interface TaxaConversaoCard {
  totalTaxaConversao: number
  growthPercentage: number
}

export interface RecentLead {
  id: number
  company: string
  service: string
  expiration_date: string
  status: string
}

export interface DashboardCards {
  leads: LeadsCard
  pipeline: PipelineCard
  propostas_enviadas: PropostasCard
  taxa_conversao: TaxaConversaoCard
}


export interface DashboardResponse {
  status: boolean
  data: {
    cards: DashboardCards,
    recentLeads: RecentLead[]
  }
}


