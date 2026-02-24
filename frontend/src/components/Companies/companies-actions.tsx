import { Plus, RefreshCw, Upload } from 'lucide-react'
import { Button } from '../ui/button'

interface CompaniesActionsProps {
 onNewCompanyClick: () => void
 onImportClick: () => void
 generateAllLeads?: () => Promise<void>
}

export function CompaniesActions({
 generateAllLeads,
 onImportClick,
 generateAllLeads,
 onNewCompanyClick
}: CompaniesActionsProps) {
 return (
  <div className="flex gap-2 flex-col sm:flex-row">
   <Button onClick={onImportClick}>
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
    variant="outline"
    className="bg-secondary text-secondary-foreground"
   >
    <Plus size={20} />
    Cadastro Manual
   </Button>
  </div>
 )
}
