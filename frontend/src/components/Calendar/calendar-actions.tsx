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
   className="bg-blue-600 hover:bg-blue-700 text-white"
  >
   <Plus className="h-4 w-4 mr-2" />
   Agendar Tarefa
  </Button>
 )
}
