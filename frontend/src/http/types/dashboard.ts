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



export interface DashboardCards {
  leads: LeadsCard
  pipeline: PipelineCard
  propostas_enviadas: PropostasCard
}


export interface DashboardResponse {
  status: boolean
  data: {
    cards: DashboardCards
  }
}


