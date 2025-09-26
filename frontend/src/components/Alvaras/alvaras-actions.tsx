import { Button } from '@/components/ui/button'

import { Download, Search } from 'lucide-react'

interface AlvarasActionsProps {
 applyFilter: () => void
 exportList: () => void
 selectedAlvaras: string[]
}

export function AlvarasActions({
 applyFilter,
 exportList,
 selectedAlvaras
}: AlvarasActionsProps) {
 return (
  <div className="flex gap-2 flex-col sm:flex-row">
   <Button
    onClick={applyFilter}
    className="bg-primary hover:bg-primary/90 text-primary-foreground"
   >
    <Search className="h-4 w-4 mr-2" />
    Buscar Alvarás
   </Button>
   <Button
    onClick={exportList}
    variant="outline"
    disabled={selectedAlvaras.length === 0}
   >
    <Download className="h-4 w-4 mr-2" />
    Exportar Lista ({selectedAlvaras.length})
   </Button>
  </div>
 )
}
