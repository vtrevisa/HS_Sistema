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
import type { TarefaAgendada } from './types/calendar'

export type ViewMode = 'mensal' | 'semanal'

export interface CalendarDay {
 date: Date
 events: CalendarEvent[]
 isToday: boolean
 isCurrentMonth: boolean
 isSelected: boolean
}


export type CalendarEvent = | (TarefaAgendada & { eventType: 'tarefa' }) | 
{
  id: string
  company: string
  type: string
  validity: Date
  address: string
  eventType: 'alvara'
}

export function useCalendar() {

  // Mock data - alvarás a vencer
  const mockAlvarasVencer: CalendarEvent[] = [
    { id: 'alv-1', company: 'Loja Centro SP', type: 'AVCB', validity: new Date(Date.now() + 2 * 86400000), address: 'Rua Augusta, 100',  eventType: 'alvara' },
    { id: 'alv-2', company: 'Restaurante Bela Vista', type: 'CLCB', validity: new Date(Date.now() + 5 * 86400000), address: 'Av. Paulista, 500',  eventType: 'alvara'  },
    { id: 'alv-3', company: 'Escritório Pinheiros', type: 'AVCB', validity: new Date(Date.now() + 10 * 86400000), address: 'Rua dos Pinheiros, 300',  eventType: 'alvara'  },
    { id: 'alv-4', company: 'Galpão Industrial', type: 'CLCB', validity: new Date(Date.now() + 15 * 86400000), address: 'Av. Industrial, 1500',  eventType: 'alvara'  },
    { id: 'alv-5', company: 'Escola Moema', type: 'AVCB', validity: new Date(Date.now() + 22 * 86400000), address: 'Rua Canário, 200',  eventType: 'alvara' },
  ];

  const mockTarefasIniciais: CalendarEvent[] = [
    { id: 'tar-1', title: 'Follow-up cliente Loja Centro', description: '', date: new Date(Date.now() + 1 * 86400000), hour: '10:00', priority: 'alta', eventType: 'tarefa' },
    { id: 'tar-2', title: 'Enviar proposta Restaurante', description: '', date: new Date(Date.now() + 3 * 86400000), hour: '14:00', priority: 'media', eventType: 'tarefa' },
    { id: 'tar-3', title: 'Reunião equipe comercial', description: '', date: new Date(Date.now() + 7 * 86400000), hour: '09:00', priority: 'baixa', eventType: 'tarefa' },
    { id: 'tar-4', title: 'Ligar para lead Moema', description: '', date: new Date(), hour: '11:00', priority: 'alta', eventType: 'tarefa' },
  ];

  const prioridadeCores = {
    baixa: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    alta: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };


  const [viewMode, setViewMode] = useState<ViewMode>('mensal')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  
  const [events, setEvents] = useState<CalendarEvent[]>([...mockTarefasIniciais, ...mockAlvarasVencer])

  const [modalOpen, setModalOpen] = useState(false)
  const [modalDefaultDate, setModalDefaultDate] = useState<Date | undefined>()


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
      const dailyEvents = events.filter(event => event.eventType === 'tarefa' ? isSameDay(event.date, day): isSameDay(event.validity, day))

      return {
        date: day,
        events: dailyEvents,
        isToday: isToday(day),
        isCurrentMonth: isSameMonth(day, currentDate),
        isSelected: selectedDate ? isSameDay(day, selectedDate) : false
      }
    })
  }, [rawDays, events, selectedDate, currentDate])


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

  function handleDayClick (day: Date) {
    setSelectedDate(day)
  }

  function handleScheduleFromDay (day: Date) {
    setModalDefaultDate(day)
    setModalOpen(true)
  }

  function handleAddTask(tarefa: TarefaAgendada) {
    setEvents(prev => [
      ...prev,
      { ...tarefa, eventType: 'tarefa' }
    ])
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
    events,

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
    handleDayClick,
    handleScheduleFromDay,
    handleAddTask,
    prioridadeCores
  }

}