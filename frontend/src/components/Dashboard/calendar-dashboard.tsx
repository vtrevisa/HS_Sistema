import { useState, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import type { DayContentProps } from 'react-day-picker'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AlertTriangle, CalendarIcon, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useDashboard } from '@/http/use-dashboard'

export function CalendarDashboard() {
 const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

 const { alvaras, tasks, isLoading } = useDashboard()

 const tasksDates = useMemo(() => {
  if (!tasks) return []
  return tasks.map(task => task.date)
 }, [tasks])

 const alvarasDates = useMemo(() => {
  if (!alvaras) return []
  return alvaras.map(alvara => alvara.validity)
 }, [alvaras])

 if (isLoading) return null

 const hasTarefas = (day: Date) => {
  const formattedDay = format(day, 'yyyy-MM-dd')
  return tasksDates.includes(formattedDay)
 }

 const hasAlvaras = (day: Date) => {
  const formattedDay = format(day, 'yyyy-MM-dd')
  return alvarasDates.includes(formattedDay)
 }

 const CustomDayContent = ({ date }: DayContentProps) => {
  const tarefa = hasTarefas(date)
  const alvara = hasAlvaras(date)

  const hasEvent = tarefa || alvara

  return (
   <div className="relative w-full h-full flex items-center justify-center">
    <span>{date.getDate()}</span>

    {hasEvent && (
     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
      {tarefa && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      {alvara && <span className="w-1.5 h-1.5 rounded-full bg-destructive" />}
     </div>
    )}
   </div>
  )
 }

 return (
  <Card className="border-l-4 border-primary max-h-[440px]">
   <CardHeader className="pb-2">
    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
     <CalendarIcon className="h-5 w-5" />
     Calendário
    </CardTitle>
   </CardHeader>
   <CardContent className="pt-0">
    <Calendar
     mode="single"
     selected={selectedDate}
     onSelect={setSelectedDate}
     locale={ptBR}
     formatters={{
      formatCaption: date =>
       format(date, 'MMMM yyyy', { locale: ptBR }).replace(/^./, char =>
        char.toUpperCase()
       ),

      formatWeekdayName: date =>
       format(date, 'EEEEEE', { locale: ptBR }).replace(/^./, char =>
        char.toUpperCase()
       )
     }}
     components={{ DayContent: CustomDayContent }}
     className="w-full p-0"
     classNames={{
      months: 'w-full',
      month: 'space-y-2 w-full',
      caption: 'flex justify-center py-4 relative items-center text-sm',
      caption_label: 'text-sm font-medium',
      nav: 'space-x-1 flex items-center',
      nav_button: 'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100',
      nav_button_previous: 'absolute left-1',
      nav_button_next: 'absolute right-1',
      table: 'w-full border-collapse',
      head_row: 'flex w-full',
      head_cell:
       'flex-1 text-center text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]',
      row: 'flex w-full mt-1',
      cell: 'flex-1 relative p-0 text-center h-9',
      day: 'w-full h-9 flex items-center justify-center text-xs rounded-md hover:bg-accent',
      day_selected:
       'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
      day_today: 'bg-accent text-accent-foreground font-semibold',
      day_outside: 'text-muted-foreground opacity-50',
      day_disabled: 'text-muted-foreground opacity-50',
      day_hidden: 'invisible'
     }}
    />

    {/* Resumo do dia */}

    <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4 text-xs">
     <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-primary" />
      <ClipboardList className="h-3 w-3 text-muted-foreground" />
      <span className="text-muted-foreground">Tarefas</span>
     </div>

     <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-destructive" />
      <AlertTriangle className="h-3 w-3 text-muted-foreground" />
      <span className="text-muted-foreground">Alvarás</span>
     </div>
    </div>
   </CardContent>
  </Card>
 )
}