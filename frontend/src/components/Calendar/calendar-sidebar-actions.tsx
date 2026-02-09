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
   className="h-7 text-blue-600 hover:text-blue-700"
  >
   <Plus className="h-3 w-3 mr-1" />
   Agendar
  </Button>
 )
}
