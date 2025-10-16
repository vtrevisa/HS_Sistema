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
  <div className="flex gap-2 flex-col sm:flex-row">
   <button
    onClick={onExportClick}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
   >
    <Download size={20} />
    Exportar
   </button>
   <button
    onClick={onNewLeadClick}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
   >
    <Plus size={20} />
    Novo Lead
   </button>
  </div>
 )
}
