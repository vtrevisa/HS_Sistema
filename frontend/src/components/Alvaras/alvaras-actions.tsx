import { Button } from '@/components/ui/button'

import { Search } from 'lucide-react'

interface AlvarasActionsProps {
 applyFilter: () => void
 //exportList: () => void
 //selectedAlvaras: string[]
}

export function AlvarasActions({
 applyFilter
}: //selectedAlvaras
AlvarasActionsProps) {
 return (
  <div className="flex gap-2 flex-col sm:flex-row">
   <Button
    onClick={applyFilter}
    className="bg-primary hover:bg-primary/90 text-primary-foreground"
   >
    <Search className="h-4 w-4 mr-2" />
    Buscar Alvarás
   </Button>
  </div>
 )
}
