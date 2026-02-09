import { Plus, Upload } from 'lucide-react'
import { Button } from '../ui/button'

interface CompaniesActionsProps {
 onNewCompanyClick: () => void
 onImportClick: () => void
 generateAllLeads?: () => Promise<void>
}

export function CompaniesActions({
 onImportClick,
 generateAllLeads,
 onNewCompanyClick
}: CompaniesActionsProps) {
 return (
  <div className="flex gap-2 flex-col sm:flex-row">
   <Button
    onClick={onImportClick}
    className="bg-green-600 hover:bg-green-700 dark:text-white"
   >
    <Upload className="h-4 w-4 mr-2" />
    Importar Planilha
   </Button>

   <Button
    onClick={generateAllLeads}
    className="bg-blue-600 hover:bg-blue-700 dark:text-white"
    >
    <RefreshCw className="h-4 w-4 mr-2" /> 
    Gerar Todos Leads 
   </Button>

   <Button
    onClick={onNewCompanyClick}
    className="bg-background hover:bg-accent hover:text-accent-foreground dark:hover:bg-red-600 text-primary border border-input px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
   >
    <Plus size={20} />
    Cadastro Manual
   </Button>
  </div>
 )
}
