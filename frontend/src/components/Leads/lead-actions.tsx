import { Download, Plus } from 'lucide-react'

interface LeadsActionsProps {
 //onEnrichmentConfigClick: () => void;
 onNewLeadClick: () => void
 onExportClick: () => void
}

export function LeadsActions({
 onNewLeadClick,
 onExportClick
}: LeadsActionsProps) {
 return (
  <div className="flex flex-col sm:flex-row gap-2">
   <button
    onClick={onExportClick}
    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
   >
    <Download size={20} />
    Exportar
   </button>
   <button
    onClick={onNewLeadClick}
    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
   >
    <Plus size={20} />
    Novo Lead
   </button>
  </div>
 )
}
