import { TrendingUp, Users, DollarSign, Target } from 'lucide-react'

interface StatsCardsProps {
 totalLeads: number
 leadsQuantity: number
 totalPipeline: number
 pipelineQuantity: number
 totalPropostas: number
 propostasQuantity: number
}

export function StatsCards({
 totalLeads,
 leadsQuantity,
 totalPipeline,
 pipelineQuantity,
 totalPropostas,
 propostasQuantity
}: StatsCardsProps) {
 const changeLeadValue = leadsQuantity ?? 0
 const isPositiveLead = changeLeadValue >= 0

 const changePipelineValue = pipelineQuantity ?? 0
 const isPositivePipeline = changePipelineValue >= 0

 const changePropostasValue = propostasQuantity ?? 0
 const isPositivePropostas = changePropostasValue >= 0

 const stats = [
  {
   title: 'Total de Leads',
   value: totalLeads.toString(),
   change: `${isPositiveLead ? '+' : ''}${changeLeadValue}%`,
   icon: Users,
   color: 'bg-blue-500'
  },
  {
   title: 'Pipeline Ativo',
   value: `R$ ${totalPipeline.toString()}`,
   change: `${isPositivePipeline ? '+' : ''}${changePipelineValue}%`,
   icon: TrendingUp,
   color: 'bg-blue-600'
  },
  {
   title: 'Propostas Enviadas',
   value: totalPropostas.toString(),
   change: `${isPositivePropostas ? '+' : ''}${changePropostasValue}%`,
   icon: DollarSign,
   color: 'bg-blue-700'
  },
  {
   title: 'Taxa de Conversão',
   value: '18%',
   change: '+3%',
   icon: Target,
   color: 'bg-blue-800'
  }
 ]

 return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
   {stats.map(stat => {
    const Icon = stat.icon
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
        <p className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mt-2">
         {stat.value}
        </p>
        <p
         className={`text-sm mt-1 ${
          stat.change.includes('!') ? 'text-red-600' : 'text-green-600'
         }`}
        >
         {stat.change.includes('!') ? 'Atenção!' : stat.change + ' este mês'}
        </p>
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
