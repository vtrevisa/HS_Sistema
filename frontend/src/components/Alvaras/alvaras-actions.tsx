import { Loader2, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface AlvarasActionsProps {
 applyFilter: () => void
 isLoading: boolean
 //exportList: () => void
 //selectedAlvaras: string[]
}

export function AlvarasActions({
 applyFilter,
 isLoading
}: //selectedAlvaras
AlvarasActionsProps) {
 return (
  <div className="flex gap-2 flex-col sm:flex-row">
   <Button
    onClick={applyFilter}
    className="bg-primary hover:bg-primary/90 text-primary-foreground"
    disabled={isLoading}
   >
    {isLoading ? (
     <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Buscando alvarás...
     </>
    ) : (
     <>
      <Search className="h-4 w-4 mr-2" />
      Buscar Alvarás
     </>
    )}
   </Button>
  </div>
 )
}
