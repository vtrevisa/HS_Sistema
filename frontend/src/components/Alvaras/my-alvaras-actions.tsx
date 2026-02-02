import { CardTitle } from '../ui/card'
import { Download, FileText, Search } from 'lucide-react'
import { Button } from '../ui/button'

interface MyAlvarasActionsProps {
 onNewQuery: () => void
 onExport?: () => void
}

export function MyAlvarasActions({
 onNewQuery,
 onExport
}: MyAlvarasActionsProps) {
 return (
  <div className="flex items-center justify-between mb-4">
   <CardTitle className="flex items-center gap-2">
    <FileText className="h-5 w-5" />
    Meus Alvarás
   </CardTitle>

   <div className="flex gap-2">
    <Button onClick={onExport} variant="outline">
     <Download className="mr-2 h-4 w-4" />
     Exportar
    </Button>
    <Button onClick={onNewQuery}>
     <Search className="mr-2 h-4 w-4" />
     Nova Consulta
    </Button>
   </div>
  </div>
 )
}
