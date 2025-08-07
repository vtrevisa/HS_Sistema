import { Download, Plus, Upload } from 'lucide-react'

interface LeadsActionsProps {
 onImportClick: () => void
 //onEnrichmentConfigClick: () => void;
 onNewLeadClick: () => void
}

export function LeadsActions({
 onImportClick,
 onNewLeadClick
}: LeadsActionsProps) {
 return (
  <div className="flex gap-3">
   <button
    onClick={onImportClick}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
   >
    <Upload size={20} />
    Importar Planilhas
   </button>
   <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
    <Download size={20} />
    Exportar
   </button>
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
