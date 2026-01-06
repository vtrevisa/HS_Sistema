import { Trash2 } from 'lucide-react'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle
} from '../ui/dialog'
import type { UserRequest } from '@/http/types/user'
import { Button } from '../ui/button'

interface DeleteUserModalProps {
 user: UserRequest
 isOpen: boolean
 onClose: () => void
 onConfirm: (user: UserRequest) => void
 onDeleting: boolean
}

export function DeleteUserModal({
 user,
 isOpen,
 onClose,
 onConfirm,
 onDeleting
}: DeleteUserModalProps) {
 if (!user) return null

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
     <DialogTitle className="flex items-center gap-2 text-destructive">
      <Trash2 className="h-5 w-5" />
      Confirmar Exclusão
     </DialogTitle>
     <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
    </DialogHeader>

    {user && (
     <div className="py-4">
      <p className="text-sm text-muted-foreground">
       Tem certeza que deseja excluir o usuário{' '}
       <strong className="text-foreground">{user.name}</strong> ?
      </p>
      <p className="text-sm text-muted-foreground mt-2">Email: {user.email}</p>
      <p className="text-sm text-muted-foreground">Empresa: {user.company}</p>
     </div>
    )}

    <DialogFooter>
     <Button variant="outline" onClick={onClose}>
      Cancelar
     </Button>
     <Button
      variant="destructive"
      disabled={onDeleting}
      onClick={() => onConfirm(user!)}
     >
      {onDeleting ? 'Excluindo...' : 'Excluir Usuário'}
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}
