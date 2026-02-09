import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import type { CompanyRequest } from '@/http/types/companies'
import { useCompany } from '@/http/use-company'

interface DeleteCompanyModalProps {
 isOpen: boolean
 onClose: () => void
 company: CompanyRequest | null
}

export function DeleteCompanyModal({
 isOpen,
 onClose,
 company
}: DeleteCompanyModalProps) {
 const { deleteCompany } = useCompany()

 function handleDelete() {
  if (!company?.id) return
  deleteCompany.mutate(company.id, {
   onSuccess: () => {
    onClose()
   }
  })
 }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="sm:max-w-md">
    <DialogHeader>
     <DialogTitle>Excluir Empresa</DialogTitle>
    </DialogHeader>
    <p className="text-sm text-muted-foreground">
     Tem certeza que deseja excluir a empresa{' '}
     <span className="font-semibold">{company?.company}</span>? <br />
     Essa ação não pode ser desfeita.
    </p>
    <div className="flex justify-end gap-2 mt-4">
     <Button
      variant="outline"
      onClick={() => onClose()}
      disabled={deleteCompany.isPending}
     >
      Cancelar
     </Button>
     <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={deleteCompany.isPending}
     >
      {deleteCompany.isPending ? 'Excluindo...' : 'Confirmar'}
     </Button>
    </div>
   </DialogContent>
  </Dialog>
 )
}
