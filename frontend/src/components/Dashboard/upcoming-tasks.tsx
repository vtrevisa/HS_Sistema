import type { RecentTask } from '@/http/types/dashboard'
import { formatUpcomingTasksDate } from '@/lib/date'
import { Calendar, Clock } from 'lucide-react'

interface UpcomingTasksProps {
 tasks: RecentTask[]
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
 //  const upcomingTasks = [
 //   {
 //    task: 'Ligar para Shopping Center Plaza',
 //    date: 'Hoje, 14:00',
 //    priority: 'alta'
 //   },
 //   {
 //    task: 'Enviar proposta - Hotel Business Inn',
 //    date: 'Amanhã, 09:00',
 //    priority: 'média'
 //   },
 //   { task: 'Follow-up Edifício Solar', date: '28/05, 10:00', priority: 'baixa' },
 //   {
 //    task: 'Renovação AVCB - Condomínio Norte',
 //    date: '30/05, 15:00',
 //    priority: 'alta'
 //   }
 //  ]

 const upcomingTasks = tasks.map(task => ({
  title: task.title,
  date: formatUpcomingTasksDate(task.date, task.hour),
  priority: task.priority
 }))

 return (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6 border-l-4 border-blue-500">
   <h2 className="text-lg lg:text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
    <Calendar size={20} />
    Ações Comerciais
   </h2>
   <div className="space-y-4">
    {upcomingTasks.map((task, index) => (
     <div
      key={index}
      className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
     >
      <div
       className={`w-3 h-3 rounded-full flex-shrink-0 ${
        task.priority === 'alta'
         ? 'bg-red-500'
         : task.priority === 'média'
           ? 'bg-yellow-500'
           : 'bg-green-500'
       }`}
      ></div>
      <div className="flex-1 min-w-0">
       <p className="font-medium text-gray-800 dark:text-white text-sm lg:text-base truncate capitalize">
        {task.title}
       </p>
       <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
        <Clock size={12} />
        {task.date}
       </p>
      </div>
     </div>
    ))}
   </div>
  </div>
 )
}
