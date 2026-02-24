import { Plus, RefreshCw, Upload } from 'lucide-react'
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
   <Button onClick={onImportClick}>
    <Upload className="h-4 w-4 mr-2" />
    Importar Planilha
   </Button>

   <Button
    onClick={generateAllLeads}
    className="bg-brand-success/10 text-brand-success hover:text-brand-success border-brand-success/30 hover:bg-brand-success/20"
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
