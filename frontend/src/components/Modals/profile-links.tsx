import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { useState } from 'react'
import {
 handleGmailConnect,
 handleMicrosoftConnect
} from '../Profile/google-connect'
import { LocawebModal } from './locaweb-modal'


interface BaseModalProps {
 isOpen: boolean
 onClose: () => void
}

export function WhatsAppModal({ isOpen, onClose }: BaseModalProps) {
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-lg">
    <DialogHeader>
     <DialogTitle>Configurar WhatsApp</DialogTitle>
    </DialogHeader>
    <div className="text-sm text-muted-foreground">
     Configure a integração com WhatsApp (número, gateway e templates).
    </div>
    <div className="mt-6 flex justify-end">
     <Button variant="ghost" onClick={onClose}>
      Fechar
     </Button>
    </div>
   </DialogContent>
  </Dialog>
 )
}

export function EmailModal({ isOpen, onClose }: BaseModalProps) {
 const [provider, setProvider] = useState<'gmail' | 'microsoft' | 'smtp' | '' >('')
 const [openLocaweb, setOpenLocaweb] = useState(false)

 const handleConnect = (prov: 'gmail' | 'microsoft' | 'smtp' | '') => {
   console.log('Provedor selecionado para conexão:', prov)
   if (!prov) {
     alert('Selecione um provedor')
     return
   }

   if (prov === 'gmail') {
     handleGmailConnect()
     onClose()
     return
   }

   if (prov === 'microsoft') {
     handleMicrosoftConnect()
     onClose()
     return
   }

   if (prov === 'smtp') {
     onClose()
     setOpenLocaweb(true)
     return
   }
 }

 return (
  <>
   <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-lg">
     <DialogHeader>
      <DialogTitle>Configurar E-mail</DialogTitle>
     </DialogHeader>
     <select
      value={provider}
      onChange={e => setProvider(e.target.value as 'gmail' | 'microsoft' | 'smtp' | '')}
      className="w-flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50"
     >
      <option value="">Provedor</option>
      <option value="gmail">Gmail</option>
      <option value="microsoft">microsoft/Hotmail</option>
      <option value="smtp">Locaweb/Yahoo</option>
     </select>
     <div className="mt-6 flex justify-end">
      <Button variant="default" onClick={() => handleConnect(provider)}>
       Conectar
      </Button>
     </div>
    </DialogContent>
   </Dialog>

   <LocawebModal isOpen={openLocaweb} onClose={() => setOpenLocaweb(false)} />
  </>
 )
}

export function ViaFacilModal({ isOpen, onClose }: BaseModalProps) {
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-lg">
    <DialogHeader>
     <DialogTitle>Configurar ViaFácil SP</DialogTitle>
    </DialogHeader>
    <div className="text-sm text-muted-foreground">
     Configurações específicas para integração com ViaFácil São Paulo.
    </div>
    <div className="mt-6 flex justify-end">
     <Button variant="ghost" onClick={onClose}>
      Fechar
     </Button>
    </div>
   </DialogContent>
  </Dialog>
 )
}

export default {
 WhatsAppModal,
 EmailModal,
 ViaFacilModal
}