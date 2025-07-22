import { AlertTriangle, TrendingUp, Users, CheckCircle } from 'lucide-react'

export function StatsCards() {
 const stats = [
  {
   title: 'Total de Leads',
   value: '127',
   change: '+12%',
   icon: Users,
   color: 'bg-blue-500'
  },
  {
   title: 'Leads Ativos',
   value: '89',
   change: '+8%',
   icon: TrendingUp,
   color: 'bg-green-500'
  },
  {
   title: 'Contratos Fechados',
   value: '23',
   change: '+15%',
   icon: CheckCircle,
   color: 'bg-orange-500'
  },
  {
   title: 'Vencimentos (30 dias)',
   value: '15',
   change: '!',
   icon: AlertTriangle,
   color: 'bg-red-500'
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
