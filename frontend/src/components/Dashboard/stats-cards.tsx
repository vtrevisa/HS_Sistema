import { formatBRL } from '@/lib/currency'
import {
 Users,
 DollarSign,
 Target,
 Search,
 TrendingUp,
 Filter
} from 'lucide-react'

interface StatsCardsProps {
 totalLeads: number
 leadsQuantity: number
 totalAlvaras: number
 alvarasQuantity: number
 totalPipeline: number
 pipelineQuantity: number
 totalAprimoramentos: number
 aprimoramentosQuantity: number
 totalPropostas: number
 propostasQuantity: number
 totalTaxaConversao: number
 taxaConversaoQuantity: number
}

export function StatsCards({
 totalLeads,
 leadsQuantity,
 totalAlvaras,
 alvarasQuantity,
 totalPipeline,
 pipelineQuantity,
 totalAprimoramentos,
 aprimoramentosQuantity,
 totalPropostas,
 propostasQuantity,
 totalTaxaConversao,
 taxaConversaoQuantity
}: StatsCardsProps) {
 const changeLeadValue = leadsQuantity ?? 0
 const isPositiveLead = changeLeadValue >= 0

 const changeAlvarasVencerValue = alvarasQuantity ?? 0
 const isPositiveAlvarasVencer = changeAlvarasVencerValue >= 0

 const changePipelineValue = pipelineQuantity ?? 0
 const isPositivePipeline = changePipelineValue >= 0

 const changeAprimoramentosValue = aprimoramentosQuantity ?? 0
 const isPositiveAprimoramentos = changeAprimoramentosValue >= 0

 const changePropostasValue = propostasQuantity ?? 0
 const isPositivePropostas = changePropostasValue >= 0

 const changeTaxaConversaoValue = taxaConversaoQuantity ?? 0
 const isPositiveTaxaConversao = changeTaxaConversaoValue >= 0

 const stats = [
  {
   title: 'Total de Leads',
   value: totalLeads,
   change: `${isPositiveLead ? '+' : ''}${changeLeadValue}%`,
   icon: Users,
   color: 'bg-primary',
   zeroMessage: 'Ainda não há leads cadastrados neste mês'
  },
  {
   title: 'Alvarás a Vencer',
   value: totalAlvaras,
   change: `${isPositiveAlvarasVencer ? '+' : ''}${changeAlvarasVencerValue}%`,
   icon: Target,
   color: 'bg-primary',
   zeroMessage: 'Nenhum alvará a vencer'
  },
  {
   title: 'Pipeline Ativo',
   value: totalPipeline,
   change: `${isPositivePipeline ? '+' : ''}${changePipelineValue}%`,
   icon: DollarSign,
   color: 'bg-primary',
   zeroMessage: 'Pipeline vazio'
  },
  {
   title: 'Aprimoramentos Pendentes',
   value: totalAprimoramentos,
   change: `${isPositiveAprimoramentos ? '+' : ''}${changeAprimoramentosValue}%`,
   icon: Search,
   color: 'bg-primary',
   zeroMessage: 'Nenhum aprimoramento pendente'
  },
  {
   title: 'Propostas Enviadas',
   value: totalPropostas,
   change: `${isPositivePropostas ? '+' : ''}${changePropostasValue}%`,
   icon: TrendingUp,
   color: 'bg-primary',
   zeroMessage: 'Nenhuma proposta enviada'
  },
  {
   title: 'Taxa de Conversão',
   value: totalTaxaConversao,
   change: `${isPositiveTaxaConversao ? '+' : ''}${changeTaxaConversaoValue}%`,
   icon: Filter,
   color: 'bg-primary',
   zeroMessage: 'Ainda não foi possível calcular a taxa de conversão'
  }
 ]

 return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
   {stats.map(stat => {
    const Icon = stat.icon
    const isZero = stat.value === 0
    return (
     <div
      key={stat.title}
      className="bg-card rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300 border border-border"
     >
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm font-medium text-muted-foreground">
         {stat.title}
        </p>

        {isZero ? (
         <p className="text-sm mt-2 text-muted-foreground italic">
          {stat.zeroMessage}
         </p>
        ) : (
         <>
          <p className="text-2xl lg:text-3xl font-bold text-card-foreground mt-2">
           {stat.value === totalPipeline
            ? `${formatBRL.format(stat.value)}`
            : stat.value === totalTaxaConversao
              ? `${stat.value}%`
              : stat.value}
          </p>

          <p
           className={`text-sm mt-1 ${
            stat.change.includes('!')
             ? 'text-destructive'
             : 'text-brand-success'
           }`}
          >
           {stat.change.includes('!') ? 'Atenção!' : stat.change + ' este mês'}
          </p>
         </>
        )}
       </div>
       <div
        className={`${stat.color} p-3 rounded-full text-primary-foreground`}
       >
        <Icon size={20} className="lg:w-6 lg:h-6" />
       </div>
      </div>
     </div>
    )
   })}
  </div>
 )
}
