import { Plus } from 'lucide-react'
import { Button } from '../ui/button'

interface CalendarSidebarActionsProps {
 selectedDate: Date
 onSchedule: (day: Date) => void
}

export function CalendarSidebarActions({
 selectedDate,
 onSchedule
}: CalendarSidebarActionsProps) {
 return (
  <Button
   variant="ghost"
   size="sm"
   onClick={() => onSchedule(selectedDate)}
   className="h-7 text-primary hover:text-primary/80"
  >
   <Plus className="h-3 w-3 mr-1" />
   Agendar
  </Button>
 )
}
