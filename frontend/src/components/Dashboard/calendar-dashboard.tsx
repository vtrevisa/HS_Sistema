import { useState, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { DayContentProps } from 'react-day-picker'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AlertTriangle, CalendarIcon, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useDashboard } from '@/http/use-dashboard'

interface CalendarDashboardProps {
 sectionType: 'comercial' | 'processos'
}

// Dados mock de eventos
const mockTarefas = [
 new Date().toDateString(),
 new Date(Date.now() + 2 * 86400000).toDateString()
]

// const mockAlvaras = [new Date(Date.now() + 5 * 86400000).toDateString()]

export function CalendarDashboard({ sectionType }: CalendarDashboardProps) {
 const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

 const { alvaras, isLoading } = useDashboard()

 const alvarasDates = useMemo(() => {
  if (!alvaras) return []

  return alvaras.map(a => format(new Date(a.validity), 'yyyy-MM-dd'))
 }, [alvaras])

 if (isLoading) return null

 const hasTarefas = (day: Date) => mockTarefas.includes(day.toDateString())

 const hasAlvaras = (day: Date) => {
  const formattedDay = format(day, 'yyyy-MM-dd')
  return alvarasDates.includes(formattedDay)
 }

 const CustomDayContent = ({ date }: DayContentProps) => {
  const tarefa = hasTarefas(date)
  const alvara = hasAlvaras(date)

  const hasEvent = tarefa || alvara

  return (
   <div
    className={cn(
     'relative flex items-center justify-center w-full h-full rounded-md',
     hasEvent && 'cursor-pointer font-semibold'
    )}
   >
    <span>{date.getDate()}</span>

    {hasEvent && (
     <div className="absolute bottom-1 flex gap-0.5">
      {tarefa && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
      {alvara && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
     </div>
    )}
   </div>
  )
 }

 return (
  <Card
   className={cn(
    'border-l-4 shadow-lg rounded-xl bg-white dark:bg-gray-800 self-start border-y-0 border-r-0',
    sectionType === 'comercial' ? 'border-blue-500' : 'border-green-500'
   )}
  >
   <CardHeader className="pb-2">
    <CardTitle
     className={cn(
      'text-lg lg:text-xl font-bold  mb-4 flex items-center gap-2',
      sectionType === 'comercial' ? 'text-blue-600' : 'text-green-600'
     )}
    >
     <CalendarIcon className="h-5 w-5" />
     Calendário
    </CardTitle>

    {/* <p className="text-xs text-muted-foreground">
     Selecione um dia para visualizar eventos
    </p> */}
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
       'flex-1 text-center text-[0.7rem] text-muted-foreground font-normal',
      row: 'flex w-full mt-1',
      cell: 'flex-1 relative p-0 text-center h-9',
      day: 'w-full h-9 flex items-center justify-center text-xs rounded-md hover:bg-accent',
      day_selected:
       'bg-primary dark:bg-gray-700 dark:text-white text-primary-foreground hover:bg-primary hover:text-primary-foreground',
      day_today:
       'bg-accent dark:bg-gray-700 dark:text-white text-accent-foreground font-semibold',
      day_outside: 'text-muted-foreground opacity-50',
      day_disabled: 'text-muted-foreground opacity-50',
      day_hidden: 'invisible'
     }}
    />

    {/* Resumo do dia */}

    <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4 text-xs">
     <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-blue-500" />
      <ClipboardList className="h-3 w-3 text-muted-foreground" />
      <span className="text-muted-foreground">Tarefas Agendadas</span>
     </div>

     <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <AlertTriangle className="h-3 w-3 text-muted-foreground" />
      <span className="text-muted-foreground">Alvarás a Vencer</span>
     </div>
    </div>
   </CardContent>
  </Card>
 )
}
