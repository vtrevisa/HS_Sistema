import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import type { UserRequest } from "@/http/types/user"

interface BaseModalProps {
    isOpen: boolean
    onClose: () => void
    user: UserRequest | null
}

export function WhatsAppConfigModal({ isOpen, onClose }: BaseModalProps) {
    return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Configurar WhatsApp</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-muted-foreground">Configure a integração com WhatsApp (número, gateway e templates).</div>
              <div className="mt-6 flex justify-end">
                <Button variant="ghost" onClick={onClose}>Fechar</Button>
              </div>
            </DialogContent>
        </Dialog>
    )
}
