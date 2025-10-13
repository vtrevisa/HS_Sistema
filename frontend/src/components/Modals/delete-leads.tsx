import type { LeadRequest } from '@/http/types/leads'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useLead } from '@/http/use-lead'

interface DeleteLeadsModalProps {
 isOpen: boolean
 onClose: () => void
 lead: LeadRequest | null
}

export function DeleteLeadsModal({
 isOpen,
 onClose,
 lead
}: DeleteLeadsModalProps) {
 const { deleteLead } = useLead()

 function handleDelete() {
  if (!lead?.id) return
  deleteLead.mutate(lead.id, {
   onSuccess: () => {
    onClose()
   }
  })
 }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="sm:max-w-md">
    <DialogHeader>
     <DialogTitle>Excluir Lead</DialogTitle>
    </DialogHeader>
    <p className="text-sm text-muted-foreground">
     Tem certeza que deseja excluir o lead{' '}
     <span className="font-semibold">{lead?.company}</span>? <br />
     Essa ação não pode ser desfeita.
    </p>
    <div className="flex justify-end gap-2 mt-4">
     <Button
      variant="outline"
      onClick={() => onClose()}
      disabled={deleteLead.isPending}
     >
      Cancelar
     </Button>
     <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={deleteLead.isPending}
     >
      {deleteLead.isPending ? 'Excluindo...' : 'Confirmar'}
     </Button>
    </div>
   </DialogContent>
  </Dialog>
 )
}
