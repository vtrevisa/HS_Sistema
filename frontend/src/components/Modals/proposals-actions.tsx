import { useState } from 'react'
import { UserCheck, UserX } from 'lucide-react'
import { Button } from '../ui/button'
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger
} from '../ui/dialog'
import { Textarea } from '../ui/textarea'

interface ProposalsActionsProps {
 isEditing: boolean
 currentLead: { company: string; status: string }
 handleGanho: () => void
 handlePerdido: (reason: string) => void
}

export function ProposalsActions({
 isEditing,
 currentLead,
 handleGanho,
 handlePerdido
}: ProposalsActionsProps) {
 const [lossReason, setLossReason] = useState('')
 const [open, setOpen] = useState(false)

 if (
  isEditing ||
  currentLead.status === 'Cliente Fechado' ||
  currentLead.status === 'Arquivado'
 )
  return null

 return (
  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
   <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
    <UserCheck size={18} />
    Finalizar Proposta
   </h3>

   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Button
     variant="default"
     className="bg-green-600 hover:bg-green-700 text-white"
     onClick={handleGanho}
    >
     <UserCheck size={16} className="mr-2" />
     Marcar como Ganho
    </Button>

    <Dialog open={open} onOpenChange={setOpen}>
     <DialogTrigger asChild>
      <Button variant="destructive">
       <UserX size={16} className="mr-2" />
       Marcar como Perdido
      </Button>
     </DialogTrigger>
     <DialogContent>
      <DialogHeader>
       <DialogTitle>Marcar como Perdido</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
       <p className="text-sm text-muted-foreground">
        Por favor, informe o motivo da perda para{' '}
        <strong>{currentLead.company}</strong>:
       </p>
       <Textarea
        value={lossReason}
        onChange={e => setLossReason(e.target.value)}
        placeholder="Ex: Preço muito alto, escolheu concorrente, cancelou projeto..."
        className="min-h-[100px]"
       />
       <div className="flex gap-2 justify-end">
        <DialogTrigger asChild>
         <Button variant="outline">Cancelar</Button>
        </DialogTrigger>
        <Button
         variant="destructive"
         onClick={() => {
          handlePerdido(lossReason)
          setOpen(false)
          setLossReason('')
         }}
        >
         Confirmar Perda
        </Button>
       </div>
      </div>
     </DialogContent>
    </Dialog>
   </div>
  </div>
 )
}
