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

interface RejectPlanProps {
 request: PlanRequest
 isOpen: boolean
 onClose: () => void
}

export function RejectPlan({ request, isOpen, onClose }: RejectPlanProps) {
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent>
    <DialogHeader>
     <DialogTitle>Confirmar Rejeição</DialogTitle>
     <DialogDescription>
      Tem certeza que deseja rejeitar a solicitação de alteração de plano?
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
     <Button variant="destructive" onClick={() => {}}>
      Rejeitar
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}
