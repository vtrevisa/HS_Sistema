import { Upload } from 'lucide-react'

interface AlvarasImportProps {
 onImportClick: () => void
}

export function AlvarasImport({ onImportClick }: AlvarasImportProps) {
 return (
  <button
   onClick={onImportClick}
   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
  >
   <Upload size={20} />
   Importar Planilha
  </button>
 )
}
