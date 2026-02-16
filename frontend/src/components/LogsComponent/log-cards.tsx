import { FileText, Search, Users } from 'lucide-react'
import { Card } from '../ui/card'
import type { AlvaraLog } from '@/http/types/logs'

interface LogCardProps {
 filteredLogs: AlvaraLog[]
 totalConsumed: number
 uniqueUsers: number
}

export function LogCards({
 filteredLogs,
 totalConsumed,
 uniqueUsers
}: LogCardProps) {
 return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
   <Card className="p-4">
    <div className="flex items-center gap-3">
     <div className="p-2 rounded-lg bg-primary/10">
      <FileText className="h-5 w-5 text-primary" />
     </div>
     <div>
      <p className="text-sm text-muted-foreground">Total Consumido</p>
      <p className="text-2xl font-bold">{totalConsumed}</p>
     </div>
    </div>
   </Card>
   <Card className="p-4">
    <div className="flex items-center gap-3">
     <div className="p-2 rounded-lg bg-blue-500/10">
      <Users className="h-5 w-5 text-blue-500" />
     </div>
     <div>
      <p className="text-sm text-muted-foreground">Usuários Ativos</p>
      <p className="text-2xl font-bold">{uniqueUsers}</p>
     </div>
    </div>
   </Card>
   <Card className="p-4">
    <div className="flex items-center gap-3">
     <div className="p-2 rounded-lg bg-green-500/10">
      <Search className="h-5 w-5 text-green-500" />
     </div>
     <div>
      <p className="text-sm text-muted-foreground">Consultas Realizadas</p>
      <p className="text-2xl font-bold">{filteredLogs.length}</p>
     </div>
    </div>
   </Card>
  </div>
 )
}
