import { Download } from 'lucide-react'
import { Button } from '../ui/button'

interface LogActionsProps {
 onExportClick: () => void
}

export function LogActions({ onExportClick }: LogActionsProps) {
 return (
  <Button onClick={onExportClick} variant="outline" className="w-full md:w-fit">
   <Download className="mr-2 h-4 w-4" />
   Exportar
  </Button>
 )
}
