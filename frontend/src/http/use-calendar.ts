import { useMemo, useState } from 'react'
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  format
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Alvara, Task } from './types/calendar'
import { useTasks } from './use-tasks'


export type ViewMode = 'mensal' | 'semanal'

export interface CalendarDay {
 date: Date
 events: CalendarEvent[]
 isToday: boolean
 isCurrentMonth: boolean
 isSelected: boolean
}


export type CalendarEvent =
  | (Task & { eventType: 'tarefa' })
  | (Alvara & { eventType: 'alvara' })

function isTask(event: CalendarEvent): event is Task & { eventType: 'tarefa' } {
  return event.eventType === 'tarefa'
}

function isAlvara(event: CalendarEvent): event is Alvara & { eventType: 'alvara' } {
  return event.eventType === 'alvara'
}

export function useCalendar() {

  const { tasks, alvaras, taskCompleted } = useTasks()

  
  const [viewMode, setViewMode] = useState<ViewMode>('mensal')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const [modalOpen, setModalOpen] = useState(false)
  const [modalDefaultDate, setModalDefaultDate] = useState<Date | undefined>()

  const prioridadeCores = {
    baixa: 'bg-brand-success/20 text-brand-success',
    media: 'bg-accent text-accent-foreground',
    alta: 'bg-destructive/10 text-destructive',
  };


  const taskEvents: CalendarEvent[] = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      eventType: 'tarefa' as const,
    }))
  }, [tasks])

  const alvaraEvents: CalendarEvent[] = useMemo(() => {
    return alvaras.map(alvara => ({
      ...alvara,
      eventType: 'alvara' as const,
    }))
  }, [alvaras])

  const allEvents: CalendarEvent[] = useMemo(() => {
    return [...taskEvents, ...alvaraEvents]
  }, [taskEvents, alvaraEvents])


  // Navigation

  function goNext() {
    setCurrentDate(viewMode === 'mensal' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))
  }

  function goPrev() {
    setCurrentDate(viewMode === 'mensal' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))
  }

  function goToday() {
    setCurrentDate(new Date())
  }

  // Base Days (Raw)

   const rawDays = useMemo(() => {
    if (viewMode === 'mensal') {
      const start = startOfWeek(startOfMonth(currentDate), { locale: ptBR })
      const end = endOfWeek(endOfMonth(currentDate), { locale: ptBR })
      return eachDayOfInterval({ start, end })
    }

    return eachDayOfInterval({
      start: startOfWeek(currentDate, { locale: ptBR }),
      end: endOfWeek(currentDate, { locale: ptBR })
    })
  }, [currentDate, viewMode])


  // Calendar Days (View Model)
   const calendarDays = useMemo<CalendarDay[]>(() => {
    return rawDays.map(day => {
      const dailyEvents = allEvents.filter(event => {
        if (isTask(event)) {
          return isSameDay(event.date, day)
        }

        if (isAlvara(event)) {
          return isSameDay(event.validity, day)
        }

        return false
      })

      return {
        date: day,
        events: dailyEvents,
        isToday: isToday(day),
        isCurrentMonth: isSameMonth(day, currentDate),
        isSelected: selectedDate ? isSameDay(day, selectedDate) : false,
      }
    })
  }, [rawDays, allEvents, selectedDate, currentDate])


  // Helpers
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const selectedDayEvents = selectedDate ? calendarDays.find(day => isSameDay(day.date, selectedDate))?.events ?? [] : []


  const titleLabel = viewMode === 'mensal' ? (() => {
      const label = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
      return label.charAt(0).toUpperCase() + label.slice(1)
    }) () : `Semana de ${format(
        startOfWeek(currentDate, { locale: ptBR }),
        'dd/MM'
    )} a ${format(
        endOfWeek(currentDate, { locale: ptBR }),
        'dd/MM/yyyy'
    )}`


  // Actions

  function handleToggleCompleted(id: string, e?: React.MouseEvent) {
    e?.stopPropagation()
    taskCompleted({ id })
  }

  function handleDayClick (day: Date) {
    setSelectedDate(day)
  }

  function handleScheduleFromDay (day: Date) {
    setModalDefaultDate(day)
    setModalOpen(true)
  }


  return {
    // view
    viewMode,
    setViewMode,
    titleLabel,
    weekDays,

    // calendar
    calendarDays,
    selectedDate,
    selectedDayEvents,
    events: allEvents,

    // navigation
    goNext,
    goPrev,
    goToday,

    // modal
    modalOpen,
    modalDefaultDate,
    setModalOpen,
    setModalDefaultDate,

    // actions
    handleToggleCompleted,
    handleDayClick,
    handleScheduleFromDay,
    prioridadeCores
  }

}