import type { CalendarDay, ViewMode } from '@/http/use-calendar'
import { CardContent } from '../ui/card'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react'

interface CalendarDaysGridProps {
 weekDays: string[]
 calendarDays: CalendarDay[]
 viewMode: ViewMode
 onDayClick: (day: Date) => void
 onToggleCompleted: (id: string, e?: React.MouseEvent) => void
}

export function CalendarDaysGrid({
 weekDays,
 calendarDays,
 viewMode,
 onDayClick,
 onToggleCompleted
}: CalendarDaysGridProps) {
 const hasCompletedTasks = calendarDays
  .flatMap(day => day.events)
  .some(event => event.eventType === 'tarefa' && event.completed)

 return (
  <CardContent className="pt-0">
   {/* Week day headers */}
   <div className="grid grid-cols-7 mb-1">
    {weekDays.map(weekday => (
     <div
      key={weekday}
      className="text-center text-xs font-medium text-muted-foreground py-2"
     >
      {weekday}
     </div>
    ))}
   </div>

   {/* Days grid */}
   <div
    className={cn(
     'grid grid-cols-7',
     viewMode === 'semanal' && 'min-h-[300px]'
    )}
   >
    {calendarDays.map(day => {
     const hasEvents = day.events.length > 0
     const hasTarefa = day.events.some(event => event.eventType === 'tarefa')
     const hasAlvara = day.events.some(event => event.eventType === 'alvara')

     return (
      <div
       key={day.date.toISOString()}
       onClick={() => onDayClick(day.date)}
       className={cn(
        'border border-border/50 p-1 cursor-pointer transition-colors min-h-[80px]',
        viewMode === 'semanal' && 'min-h-[250px]',
        !day.isCurrentMonth && viewMode === 'mensal' && 'opacity-40',
        day.isSelected && 'bg-primary/5 ring-2 ring-primary',
        !day.isSelected && 'hover:bg-accent/50'
       )}
      >
       <div className="flex items-center justify-between mb-1">
        <span
         className={cn(
          'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
          day.isToday && 'bg-primary text-primary-foreground',
          !day.isToday && 'text-foreground'
         )}
        >
         {format(day.date, 'd')}
        </span>

        {hasEvents && (
         <span
          className={cn(
           'w-2 h-2 rounded-full',
           hasTarefa ? 'bg-primary' : hasAlvara ? 'bg-destructive' : 'bg-muted'
          )}
         />
        )}
       </div>

       <div className="space-y-0.5">
        {day.events.slice(0, viewMode === 'semanal' ? 5 : 2).map(event => (
         <div
          key={event.id}
          onClick={e => {
           if (event.eventType !== 'tarefa') return
           e.stopPropagation()
           onToggleCompleted(event.id)
          }}
          className={cn(
           'text-[10px] truncate px-1 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-0.5',
           event.eventType === 'tarefa'
            ? event.completed
              ? 'bg-brand-success/15 text-brand-success line-through'
              : 'bg-primary/10 text-primary'
            : 'bg-destructive/10 text-primary'
          )}
         >
          {event.eventType === 'tarefa' ? (
           <>
            {event.completed && (
             <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
            )}
            {event.title}
           </>
          ) : (
           `⚠ ${event.company}`
          )}
         </div>
        ))}

        {viewMode === 'mensal' && day.events.length > 2 && (
         <span className="text-[10px] text-muted-foreground">
          +{day.events.length - 2} mais
         </span>
        )}
       </div>
      </div>
     )
    })}
   </div>

   {/* Legend */}
   <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-6 text-xs">
    <div className="flex items-center gap-1.5">
     <span className="w-2.5 h-2.5 rounded-full bg-primary" />
     <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
     <span className="text-muted-foreground">Tarefas Agendadas</span>
    </div>

    {hasCompletedTasks && (
     <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-brand-success" />
      <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">Tarefas Concluídas</span>
     </div>
    )}

    <div className="flex items-center gap-1.5">
     <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
     <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
     <span className="text-muted-foreground">Alvarás a Vencer</span>
    </div>
   </div>
  </CardContent>
 )
}
