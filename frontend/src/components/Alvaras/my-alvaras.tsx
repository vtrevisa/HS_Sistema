import { Card } from '../ui/card'
import { MyAlvarasActions } from './my-alvaras-actions'
import { MyAlvarasTable } from './my-alvaras-table'
import type { Alvaras } from '@/http/types/alvaras'

interface MyAlvarasProps {
 alvaras: Alvaras[]
 onNewQuery: () => void
 onExport: () => void
}

export function MyAlvaras({ alvaras, onNewQuery, onExport }: MyAlvarasProps) {
 return (
  <Card className="p-6">
   <MyAlvarasActions onNewQuery={onNewQuery} onExport={onExport} />

   {alvaras.length === 0 ? (
    <div className="text-center py-12 text-muted-foreground">
     <p>Você ainda não possui alvarás consumidos.</p>
     <p className="text-sm mt-2">
      Clique em "Nova Consulta" para buscar alvarás.
     </p>
    </div>
   ) : (
    <MyAlvarasTable alvaras={alvaras} />
   )}
  </Card>
 )
}
