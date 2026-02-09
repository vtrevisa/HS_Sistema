import { ClipboardList, Clock, AlertTriangle } from 'lucide-react'
import { format, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { CalendarSidebarActions } from './calendar-sidebar-actions'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/http/use-calendar'

interface CalendarSidebarProps {
 selectedDate: Date | null
 allEvents: CalendarEvent[]
 dayEvents: CalendarEvent[]
 prioridadeCores: Record<string, string>
 onSchedule: (day: Date) => void
}

export function CalendarSidebar({
 selectedDate,
 allEvents,
 dayEvents,
 prioridadeCores,
 onSchedule
}: CalendarSidebarProps) {
 const today = startOfDay(new Date())

 const upcomingEvents = allEvents
  .filter(event =>
   event.eventType === 'tarefa' ? event.date >= today : event.validity >= today
  )
  .sort((a, b) => {
   if (a.eventType !== b.eventType) {
    return a.eventType === 'tarefa' ? -1 : 1
   }

   const dateA =
    a.eventType === 'tarefa' ? a.date.getTime() : a.validity.getTime()
   const dateB =
    b.eventType === 'tarefa' ? b.date.getTime() : b.validity.getTime()

   return dateA - dateB
  })

 return (
  <div className="space-y-4">
   <Card>
    <CardHeader className="pb-2">
     <CardTitle className="text-sm flex items-center justify-between">
      <span>
       {selectedDate
        ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
        : 'Selecione um dia'}
      </span>
      {selectedDate && (
       <CalendarSidebarActions
        selectedDate={selectedDate}
        onSchedule={onSchedule}
       />
      )}
     </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
     {dayEvents.length === 0 ? (
      <p className="text-xs text-muted-foreground text-center py-4">
       Nenhum evento neste dia
      </p>
     ) : (
      dayEvents.map(event => {
       if (event.eventType === 'tarefa') {
        return (
         <div
          key={event.id}
          className="p-2 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20 space-y-1"
         >
          <div className="flex items-center gap-2">
           <ClipboardList className="h-3.5 w-3.5 text-blue-600" />
           <span className="text-xs font-medium text-foreground capitalize">
            {event.title}
           </span>
          </div>

          <div className="flex items-center gap-2">
           <Clock className="h-3 w-3 text-muted-foreground" />
           <span className="text-[11px] text-muted-foreground">
            {event.hour}
           </span>

           <Badge
            variant="outline"
            className={cn(
             'text-[10px] px-1.5 py-0',
             prioridadeCores[event.priority]
            )}
           >
            {event.priority}
           </Badge>
          </div>

          {event.description && (
           <p className="text-[11px] text-muted-foreground">
            {event.description}
           </p>
          )}
         </div>
        )
       }

       return (
        <div
         key={event.id}
         className="p-2 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20 space-y-1"
        >
         <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          <span className="text-xs font-medium text-foreground">
           {event.company}
          </span>
         </div>

         <div className="text-[11px] text-muted-foreground space-y-0.5">
          <p>
           Tipo: <span className="font-medium">{event.type}</span>
          </p>
          <p>
           Vence:{' '}
           <span className="font-medium">
            {format(event.validity, 'dd/MM/yyyy')}
           </span>
          </p>
          <p>{event.address}</p>
         </div>
        </div>
       )
      })
     )}
    </CardContent>
   </Card>

   {/* Próximos eventos */}
   <Card>
    <CardHeader className="pb-2">
     <CardTitle className="text-sm">Próximos Eventos</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
     {upcomingEvents.map(event => (
      <div key={event.id} className="flex items-center gap-2 text-xs">
       <span
        className={cn(
         'w-2 h-2 rounded-full shrink-0',
         event.eventType === 'tarefa' ? 'bg-blue-500' : 'bg-red-500'
        )}
       />

       <span className="truncate text-foreground capitalize">
        {event.eventType === 'tarefa' ? event.title : `⚠ ${event.company}`}
       </span>

       <span className="text-muted-foreground ml-auto whitespace-nowrap">
        {format(
         event.eventType === 'tarefa' ? event.date : event.validity,
         'dd/MM'
        )}
       </span>
      </div>
     ))}
    </CardContent>
   </Card>
  </div>
 )
}
