import { formatBRL } from '@/lib/currency'
import {
 Users,
 DollarSign,
 Target,
 Trello,
 Search,
 Megaphone
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
   color: totalLeads === 0 ? 'bg-gray-300 dark:bg-gray-400' : 'bg-blue-400',
   zeroMessage: 'Ainda não há leads cadastrados neste mês'
  },
  {
   title: 'Alvarás a Vencer',
   value: totalAlvaras,
   change: `${isPositiveAlvarasVencer ? '+' : ''}${changeAlvarasVencerValue}%`,
   icon: Target,
   color: totalAlvaras === 0 ? 'bg-gray-300 dark:bg-gray-500' : 'bg-blue-500',
   zeroMessage: 'Nenhum alvará a vencer'
  },
  {
   title: 'Pipeline Ativo',
   value: totalPipeline,
   change: `${isPositivePipeline ? '+' : ''}${changePipelineValue}%`,
   icon: Trello,
   color: totalPipeline === 0 ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-600',
   zeroMessage: 'Pipeline vazio'
  },
  {
   title: 'Aprimoramentos Pendentes',
   value: totalAprimoramentos,
   change: `${isPositiveAprimoramentos ? '+' : ''}${changeAprimoramentosValue}%`,
   icon: Search,
   color:
    totalAprimoramentos === 0 ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-700',
   zeroMessage: 'Nenhum aprimoramento pendente'
  },
  {
   title: 'Propostas Enviadas',
   value: totalPropostas,
   change: `${isPositivePropostas ? '+' : ''}${changePropostasValue}%`,
   icon: DollarSign,
   color: totalPropostas === 0 ? 'bg-gray-300 dark:bg-gray-800' : 'bg-blue-800',
   zeroMessage: 'Nenhuma proposta enviada'
  },
  {
   title: 'Taxa de Conversão',
   value: totalTaxaConversao,
   change: `${isPositiveTaxaConversao ? '+' : ''}${changeTaxaConversaoValue}%`,
   icon: Megaphone,
   color:
    totalTaxaConversao === 0 ? 'bg-gray-300 dark:bg-gray-900' : 'bg-blue-900',
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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300"
     >
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
         {stat.title}
        </p>

        {isZero ? (
         <p className="text-sm mt-2 text-gray-500 dark:text-gray-400 italic">
          {stat.zeroMessage}
         </p>
        ) : (
         <>
          <p className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mt-2">
           {stat.value === totalPipeline
            ? `${formatBRL.format(stat.value)}`
            : stat.value === totalTaxaConversao
              ? `${stat.value}%`
              : stat.value}
          </p>

          <p
           className={`text-sm mt-1 ${
            stat.change.includes('!') ? 'text-red-600' : 'text-green-600'
           }`}
          >
           {stat.change.includes('!') ? 'Atenção!' : stat.change + ' este mês'}
          </p>
         </>
        )}
       </div>
       <div className={`${stat.color} p-3 rounded-full text-white`}>
        <Icon size={20} className="lg:w-6 lg:h-6" />
       </div>
      </div>
     </div>
    )
   })}
  </div>
 )
}
