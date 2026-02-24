import { Download, Search } from 'lucide-react'
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
   <h2 className="text-xl font-semibold text-foreground">Meus Alvarás</h2>

   <div className="flex gap-2">
    <Button onClick={onExport} variant="outline">
     <Download className="mr-2 h-4 w-4" />
     Exportar alvarás para busca de dados
    </Button>
    <Button onClick={onNewQuery}>
     <Search className="mr-2 h-4 w-4" />
     Nova Consulta
    </Button>
   </div>
  </div>
 )
}
