import { Plus } from 'lucide-react'
import { Button } from '../ui/button'

interface CalendarActionsProps {
 setModalOpen: (open: boolean) => void
 setModalDefaultDate: (date: Date | undefined) => void
 selectedDate?: Date
}

export function CalendarActions({
 setModalOpen,
 setModalDefaultDate,
 selectedDate
}: CalendarActionsProps) {
 return (
  <Button
   onClick={() => {
    setModalDefaultDate(selectedDate || new Date())
    setModalOpen(true)
   }}
   className="bg-primary hover:bg-primary/90 text-primary-foreground"
  >
   <Plus className="h-4 w-4 mr-2" />
   Agendar Tarefa
  </Button>
 )
}
