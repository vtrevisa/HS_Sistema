import { useTasks } from '@/http/use-tasks'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarPlus, CheckCircle2, Clock } from 'lucide-react'

interface TasksProps {
 leadId?: number
}

export function Tasks({ leadId }: TasksProps) {
 const { tasks, taskCompleted, isLoading } = useTasks()

 const filteredTasks = leadId
  ? tasks.filter(task => task.lead_id === leadId)
  : tasks

 function handleToggleCompleted(id: string) {
  taskCompleted({ id })
 }

 if (isLoading) {
  return (
   <div className="bg-card border border-border rounded-lg p-4">
    <p className="text-sm text-muted-foreground">Carregando tarefas…</p>
   </div>
  )
 }

 return (
  <div className="bg-card border border-border rounded-lg p-4">
   <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
    <CalendarPlus size={18} />
    Tarefas Agendadas ({filteredTasks.length})
   </h3>
   {filteredTasks.length === 0 ? (
    <p className="text-xs text-muted-foreground">
     Nenhuma tarefa vinculada a este lead
    </p>
   ) : (
    <div className="space-y-2 max-h-48 overflow-y-auto">
     {filteredTasks
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(task => (
       <div
        key={task.id}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
         task.completed
          ? 'bg-brand-success/10 border border-brand-success/30'
          : 'bg-muted/50 border border-border hover:border-primary/30'
        }`}
        onClick={() => handleToggleCompleted(task.id)}
       >
        <div
         className={`flex-shrink-0 ${task.completed ? 'text-brand-success' : 'text-muted-foreground'}`}
        >
         {task.completed ? <CheckCircle2 size={18} /> : <Clock size={18} />}
        </div>
        <div className="flex-1 min-w-0">
         <p
          className={`text-sm font-medium ${task.completed ? 'line-through text-brand-success' : 'text-foreground'}`}
         >
          {task.title}
         </p>
         {task.description && (
          <p className="text-xs text-muted-foreground truncate">
           {task.description}
          </p>
         )}
         <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(task.date), 'dd/MM/yyyy', { locale: ptBR })} às{' '}
          {task.hour}
          {' · '}
          <span
           className={
            task.priority === 'alta'
             ? 'text-destructive'
             : task.priority === 'media'
               ? 'text-yellow-600 dark:text-yellow-400'
               : 'text-brand-success'
           }
          >
           {task.priority === 'alta'
            ? '🔴 Alta'
            : task.priority === 'media'
              ? '🟡 Média'
              : '🟢 Baixa'}
          </span>
         </p>
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0">
         {task.completed ? 'Concluída' : 'Clique p/ concluir'}
        </span>
       </div>
      ))}
    </div>
   )}
  </div>
 )
}
