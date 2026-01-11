import { ClipboardList, Target } from 'lucide-react'
import { StatsCards } from './stats-cards'
import { ChecklistNotifications } from './checklist-notifications'
import { RecentLeads } from './recent-leads'
import { UpcomingTasks } from './upcoming-tasks'
import { useDashboard } from '@/http/use-dashboard'

interface DashboardProps {
 sectionType?: 'comercial' | 'processos'
}

export function Dashboard({ sectionType = 'comercial' }: DashboardProps) {
 const { cards, recentLeads, isLoading } = useDashboard()

 if (isLoading) return null

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
    <div className="flex items-center gap-3">
     {sectionType === 'comercial' ? (
      <div className="flex items-center gap-2 text-blue-600 dark:text-white">
       <Target className="h-6 w-6" />
       <h1 className="text-2xl lg:text-3xl font-bold">Dashboard Comercial</h1>
      </div>
     ) : (
      <div className="flex items-center gap-2 text-green-600">
       <ClipboardList className="h-6 w-6" />
       <h1 className="text-2xl lg:text-3xl font-bold">Dashboard Técnico</h1>
      </div>
     )}
    </div>

    <div className="text-sm text-gray-600 dark:text-gray-400">
     Última atualização: {new Date().toLocaleDateString('pt-BR')}
    </div>
   </div>

   {/* Stats Cards */}
   <StatsCards
    totalLeads={cards?.leads.totalLeads ?? 0}
    leadsQuantity={cards?.leads.growthPercentage ?? 0}
    totalPipeline={cards?.pipeline.totalPipeline ?? 0}
    pipelineQuantity={cards?.pipeline.growthPercentage ?? 0}
    totalPropostas={cards?.propostas_enviadas.totalPropostas ?? 0}
    propostasQuantity={cards?.propostas_enviadas.growthPercentage ?? 0}
    totalTaxaConversao={cards?.taxa_conversao.totalTaxaConversao ?? 0}
    taxaConversaoQuantity={cards?.taxa_conversao.growthPercentage ?? 0}
   />

   <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    {/* Checklist Notifications */}
    <div className="xl:col-span-1">
     <ChecklistNotifications />
    </div>

    {/* Recent Leads */}
    <RecentLeads leads={recentLeads ?? []} />

    {/* Upcoming Tasks */}
    <UpcomingTasks />
   </div>
  </div>
 )
}
