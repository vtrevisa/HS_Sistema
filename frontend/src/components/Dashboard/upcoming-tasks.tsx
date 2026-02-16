import type { RecentTask } from '@/http/types/dashboard'
import { formatUpcomingTasksDate } from '@/lib/date'
import { Calendar, Clock } from 'lucide-react'

interface UpcomingTasksProps {
 tasks: RecentTask[]
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
 const upcomingTasks = tasks.map(task => ({
  title: task.title,
  date: formatUpcomingTasksDate(task.date, task.hour),
  priority: task.priority
 }))

 return (
  <div className="bg-card rounded-xl shadow-lg p-4 lg:p-6 border-l-4 border border-primary">
   <h2 className="text-lg lg:text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
    <Calendar size={20} />
    Ações Comerciais
   </h2>
   <div className="space-y-4">
    {upcomingTasks.map((task, index) => (
     <div
      key={index}
      className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
     >
      <div
       className={`w-3 h-3 rounded-full flex-shrink-0 ${
        task.priority === 'alta'
         ? 'bg-destructive'
         : task.priority === 'media'
           ? 'bg-yellow-500'
           : 'bg-brand-success'
       }`}
      ></div>
      <div className="flex-1 min-w-0">
       <p className="font-medium text-card-foreground text-sm lg:text-base truncate">
        {task.title}
       </p>
       <p className="text-xs lg:text-sm text-muted-foreground flex items-center gap-1">
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
