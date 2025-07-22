import { StatsCards } from './stats-cards'
import { ChecklistNotifications } from './checklist-notifications'
import { RecentLeads } from './recent-leads'
import { UpcomingTasks } from './upcoming-tasks'

export function Dashboard() {
 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
     Dashboard
    </h1>
    <div className="text-sm text-gray-600 dark:text-gray-400">
     Última atualização: {new Date().toLocaleDateString('pt-BR')}
    </div>
   </div>

   {/* Stats Cards */}
   <StatsCards />

   <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    {/* Checklist Notifications */}
    <div className="xl:col-span-1">
     <ChecklistNotifications />
    </div>

    {/* Recent Leads */}
    <RecentLeads />

    {/* Upcoming Tasks */}
    <UpcomingTasks />
   </div>
  </div>
 )
}
