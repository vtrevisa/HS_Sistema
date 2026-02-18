import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

import type { CalendarDay, ViewMode } from '@/http/use-calendar'
import { CalendarDaysGrid } from './calendar-days-grid'
import { CalendarSidebar } from './calendar-sidebar'
import type { CalendarEvent } from '@/http/use-calendar'

interface CalendarGridProps {
 viewMode: ViewMode
 setViewMode: (mode: ViewMode) => void
 titleLabel: string

 calendarDays: CalendarDay[]
 weekDays: string[]

 selectedDate: Date | null
 selectedDayEvents: CalendarEvent[]
 allEvents: CalendarEvent[]

 prioridadeCores: Record<string, string>
 onSchedule: (day: Date) => void

 goNext: () => void
 goPrev: () => void
 goToday: () => void

 onDayClick: (day: Date) => void
 onToggleCompleted: (id: string, e?: React.MouseEvent) => void
}

export function CalendarGrid({
 viewMode,
 setViewMode,
 titleLabel,
 calendarDays,
 weekDays,
 selectedDate,
 selectedDayEvents,
 allEvents,
 prioridadeCores,
 onSchedule,
 goNext,
 goPrev,
 goToday,
 onDayClick,
 onToggleCompleted
}: CalendarGridProps) {
 return (
  <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
   <Card className="xl:col-span-3 border-l-4 border-l-primary">
    <CardHeader className="pb-3">
     <div className="flex items-center justify-between">
      {/* Navegação */}
      <div className="flex items-center gap-2">
       <Button
        variant="outline"
        size="icon"
        onClick={goPrev}
        className="h-8 w-8"
       >
        <ChevronLeft className="h-4 w-4" />
       </Button>
       <Button variant="outline" size="sm" onClick={goToday}>
        Hoje
       </Button>
       <Button
        variant="outline"
        size="icon"
        onClick={goNext}
        className="h-8 w-8"
       >
        <ChevronRight className="h-4 w-4" />
       </Button>
       <CardTitle className="text-lg ml-2">{titleLabel}</CardTitle>
      </div>
      {/* Modo de visualização */}
      <Tabs
       value={viewMode}
       onValueChange={value => setViewMode(value as ViewMode)}
      >
       <TabsList>
        <TabsTrigger value="mensal">Mensal</TabsTrigger>
        <TabsTrigger value="semanal">Semanal</TabsTrigger>
       </TabsList>
      </Tabs>
     </div>
    </CardHeader>
    <CalendarDaysGrid
     viewMode={viewMode}
     weekDays={weekDays}
     calendarDays={calendarDays}
     onDayClick={onDayClick}
     onToggleCompleted={onToggleCompleted}
    />
   </Card>
   <CalendarSidebar
    selectedDate={selectedDate}
    dayEvents={selectedDayEvents}
    allEvents={allEvents}
    prioridadeCores={prioridadeCores}
    onSchedule={onSchedule}
    onToggleCompleted={onToggleCompleted}
   />
  </div>
 )
}
