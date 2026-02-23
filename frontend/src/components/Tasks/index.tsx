import { useTasks } from '@/http/use-tasks'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
 CalendarPlus,
 CheckCircle2,
 Clock,
 Pencil,
 RotateCcw
} from 'lucide-react'
import { useState } from 'react'
import { NewTaskModal } from '../Modals/new-task'

interface TasksProps {
 leadId?: number
}

export function Tasks({ leadId }: TasksProps) {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const [modalTask, setModalTask] = useState<any | null>(null)

 const { tasks, taskCompleted, updateTask, isLoading } = useTasks()

 const filteredTasks = leadId
  ? tasks.filter(task => task.lead_id === leadId)
  : tasks

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
        className={`flex justify-between gap-4 p-3 rounded-lg cursor-pointer transition-all ${
         task.completed
          ? 'bg-brand-success/10 border border-brand-success/30'
          : 'bg-muted/50 border border-border hover:border-primary/30'
        }`}
       >
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
         <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
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

        <div className="flex items-start gap-2 shrink-0">
         {/* Concluir */}
         <button
          type="button"
          onClick={e => {
           e.stopPropagation()
           taskCompleted({ id: task.id })
          }}
          className="cursor-pointer hover:opacity-70 transition-opacity"
          title={
           task.completed ? 'Desmarcar como concluída' : 'Marcar como concluída'
          }
         >
          {task.completed ? (
           <RotateCcw className="h-3 w-3 text-brand-success" />
          ) : (
           <CheckCircle2 className="h-4 w-4 text-primary" />
          )}
         </button>

         {/* Editar */}
         <button
          type="button"
          onClick={e => {
           e.stopPropagation()
           setModalTask(task)
          }}
          className="cursor-pointer hover:opacity-70 transition-opacity"
          title="Editar tarefa"
         >
          <Pencil className="h-4 w-4 text-primary" />
         </button>
        </div>
       </div>
      ))}
    </div>
   )}

   <NewTaskModal
    isOpen={!!modalTask}
    onOpenChange={open => !open && setModalTask(null)}
    task={modalTask}
    onSave={updated => {
     if (!modalTask) return
     updateTask.mutate({ ...modalTask, ...updated })
     setModalTask(null)
    }}
   />
  </div>
 )
}
