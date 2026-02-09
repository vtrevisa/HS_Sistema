import { CalendarIcon } from 'lucide-react'
import { CalendarActions } from './calendar-actions'
import { CalendarGrid } from './calendar-grid'
import { useCalendar } from '@/http/use-calendar'
import { NewTaskModal } from '../Modals/new-task'
import { useTasks } from '@/http/use-tasks'

export function Calendario() {
 const calendar = useCalendar()

 const { saveTasks } = useTasks()

 return (
  <div className="p-4 lg:p-6 space-y-4">
   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
     <h1 className="flex items-center gap-2 text-blue-600 dark:text-white text-2xl lg:text-3xl font-bold">
      <CalendarIcon className="h-7 w-7 text-blue-600 dark:text-white" />
      Calendário Comercial
     </h1>
     <p className="text-muted-foreground text-sm mt-1">
      Gerencie tarefas e acompanhe alvarás a vencer
     </p>
    </div>
    <CalendarActions
     selectedDate={calendar.selectedDate ?? undefined}
     setModalDefaultDate={calendar.setModalDefaultDate}
     setModalOpen={calendar.setModalOpen}
    />
   </div>

   <CalendarGrid
    viewMode={calendar.viewMode}
    setViewMode={calendar.setViewMode}
    titleLabel={calendar.titleLabel}
    calendarDays={calendar.calendarDays}
    allEvents={calendar.events}
    weekDays={calendar.weekDays}
    selectedDate={calendar.selectedDate}
    selectedDayEvents={calendar.selectedDayEvents}
    prioridadeCores={calendar.prioridadeCores}
    onSchedule={calendar.handleScheduleFromDay}
    goPrev={calendar.goPrev}
    goNext={calendar.goNext}
    goToday={calendar.goToday}
    onDayClick={calendar.handleDayClick}
   />

   {/* Modal */}
   <NewTaskModal
    open={calendar.modalOpen}
    onOpenChange={calendar.setModalOpen}
    defaultDate={calendar.modalDefaultDate}
    onSave={task => saveTasks.mutate(task)}
   />
  </div>
 )
}
