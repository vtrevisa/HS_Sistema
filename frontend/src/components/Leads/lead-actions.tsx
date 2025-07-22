import { Plus } from 'lucide-react'

interface LeadsActionsProps {
 //onImportClick: () => void;
 //onEnrichmentConfigClick: () => void;
 onNewLeadClick: () => void
}

export function LeadsActions({ onNewLeadClick }: LeadsActionsProps) {
 return (
  <div className="flex gap-3">
   <button
    onClick={onNewLeadClick}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
   >
    <Plus size={20} />
    Novo Lead
   </button>
  </div>
 )
}
