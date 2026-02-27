import { CalendarIcon } from 'lucide-react'
import { CalendarActions } from './calendar-actions'
import { CalendarGrid } from './calendar-grid'
import { useCalendar } from '@/http/use-calendar'
import { NewTaskModal } from '../Modals/new-task'
import { useTasks } from '@/http/use-tasks'
import type { CreateTask } from '@/http/types/calendar'

export function Calendario() {
 const calendar = useCalendar()

 const { saveTasks, updateTask, deleteTask } = useTasks()

 function handleSaveTask(task: CreateTask) {
    console.log('calendar.taskToEdit', calendar.taskToEdit)
  if (calendar.taskToEdit) {
   updateTask.mutate({
    id: calendar.taskToEdit.id,
    ...task
   })
  } else {
   saveTasks.mutate(task)
  }
 }

 function handleDeleteTask(taskId: any) {
    if (!calendar.taskToEdit) return
    deleteTask.mutate(calendar.taskToEdit.id)
 }

 return (
  <div className="p-4 lg:p-6 space-y-4">
   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
     <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
      <CalendarIcon className="h-7 w-7 text-primary" />
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
    onToggleCompleted={calendar.handleToggleCompleted}
    onEditTask={calendar.handleEditTask}
   />

   {/* Modal */}
   <NewTaskModal
    isOpen={calendar.modalOpen}
    onOpenChange={open => {
     calendar.setModalOpen(open)

     if (!open) {
      calendar.setTaskToEdit(null)
     }
    }}
    defaultDate={calendar.modalDefaultDate}
    task={calendar.taskToEdit}
    onSave={handleSaveTask}
    onDelete={handleDeleteTask}
   />
  </div>
 )
}
