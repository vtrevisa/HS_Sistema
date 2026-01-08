import type { PlanRequest } from '@/http/types/plan'
import { Button } from '../ui/button'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle
} from '../ui/dialog'
import { Badge } from '../ui/badge'

interface AprovePlanProps {
 request: PlanRequest
 isOpen: boolean
 onClose: () => void
 onConfirm: (plan: PlanRequest) => void
}

export function AprovePlan({
 request,
 isOpen,
 onClose,
 onConfirm
}: AprovePlanProps) {
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent>
    <DialogHeader>
     <DialogTitle>Confirmar Aprovação</DialogTitle>
     <DialogDescription>
      Tem certeza que deseja aprovar a solicitação de alteração de plano?
     </DialogDescription>
    </DialogHeader>
    {request && (
     <div className="py-4">
      <strong className="text-sm">{request.user.name}</strong> deseja alterar do
      plano <Badge variant="outline">{request.current_plan.name}</Badge> para{' '}
      <Badge variant="secondary">{request.requested_plan.name}</Badge>
     </div>
    )}
    <DialogFooter>
     <Button variant="outline" onClick={onClose}>
      Cancelar
     </Button>
     <Button
      onClick={() => onConfirm(request)}
      className="bg-green-600 hover:bg-green-700"
     >
      Aprovar
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}
