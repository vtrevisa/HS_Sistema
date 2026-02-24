import { Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { useGoogleCalendar } from '../../http/use-google-calendar'

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
    
  const { syncEvents } = useGoogleCalendar()
 return (
  <div className="flex items-center gap-2">
    <Button
     variant="default"
     onClick={async () => {await syncEvents()}}
 >
     Atualizar
 </Button>
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
  </div>
 )
}
