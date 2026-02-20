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
  const syncRefresh = async () => {
    try {
         await syncEvents();
     } catch (e) {
         console.error('Erro ao obter logs do calendário', e);
     }
     window.location.reload();
  }
  const { syncEvents } = useGoogleCalendar()
 return (
  <div className="flex items-center gap-2">
    <Button
     variant="default"
     onClick={async () => {syncRefresh()}}
 >
     Atualizar
 </Button>
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
  </div>
 )
}
