import { Crown } from 'lucide-react'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle
} from '../ui/dialog'
import type { UserRequest, UserRole } from '@/http/types/user'
import { Button } from '../ui/button'

interface UpdateUserRoleModalProps {
 user: UserRequest
 isOpen: boolean
 onClose: () => void
 onConfirm: (newRole: UserRole) => void
}

export function UpdateUserRoleModal({
 user,
 isOpen,
 onClose,
 onConfirm
}: UpdateUserRoleModalProps) {
 const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin'

 function handleConfirmRoleChange() {
  onConfirm(newRole)
 }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="sm:max-w-[400px]">
    <DialogHeader>
     <DialogTitle className="flex items-center gap-2">
      <Crown className="h-5 w-5 text-primary" />
      Alterar Permissão
     </DialogTitle>
     <DialogDescription>
      Confirme a alteração de permissão do usuário.
     </DialogDescription>
    </DialogHeader>

    {user && (
     <div className="py-4">
      <p className="text-sm text-muted-foreground">
       {user.role === 'admin' ? (
        <>
         Deseja remover as permissões de administrador de{' '}
         <strong className="text-foreground">{user.name}</strong> ?
        </>
       ) : (
        <>
         Deseja tornar <strong className="text-foreground">{user.name}</strong>{' '}
         um administrador?
        </>
       )}
      </p>
      {user.role !== 'admin' && (
       <p className="text-sm text-muted-foreground mt-2 text-amber-600">
        ⚠️ Administradores têm acesso total ao sistema, incluindo gerenciamento
        de usuários.
       </p>
      )}
     </div>
    )}

    <DialogFooter className="flex gap-2">
     <Button variant="outline" onClick={onClose}>
      Cancelar
     </Button>
     <Button onClick={handleConfirmRoleChange}>
      {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}
