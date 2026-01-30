export interface LeadsCard {
  totalLeads: number
  leadsThisMonth: number
  growthPercentage: number
}

export interface AlvarasAVencerCard {
  totalAlvaras: number
  growthPercentage: number
}

export interface PipelineCard {
  totalPipeline: number
  pipelineThisMonth: number
  growthPercentage: number
}

export interface AprimoramentosCard {
  totalAprimoramentos: number
  aprimoramentosThisMonth: number
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

export interface Alvaras {
 id: string
 company: string
 validity: string
 status: 'Vencido' | 'A vencer'
}

export interface DashboardCards {
  leads: LeadsCard
  alvaras_a_vencer: AlvarasAVencerCard
  pipeline: PipelineCard
  aprimoramentos_pendentes: AprimoramentosCard
  propostas_enviadas: PropostasCard
  taxa_conversao: TaxaConversaoCard
}


export interface DashboardResponse {
  status: boolean
  data: {
    cards: DashboardCards,
    recentLeads: RecentLead[]
    alvaras: Alvaras[]
  }
}


