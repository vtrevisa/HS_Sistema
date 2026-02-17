import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from '../ui/input'
import { useEffect, useState } from "react"
import type { UserRequest } from "@/http/types/user"
import { useEmail } from "@/http/use-email"

interface BaseModalProps {
    isOpen: boolean
    onClose: () => void
    user: UserRequest | null
}

export function EmailConfigModal({ isOpen, onClose, user }: BaseModalProps) {
    const [subject, setSubject] = useState(user?.email_subject ?? '');
    const [body, setBody] = useState(user?.email_body ?? '');
    const { updateEmailConfig } = useEmail();

    useEffect(() => {
      setSubject(user?.email_subject ?? '');
      setBody(user?.email_body ?? '');
    }, [user]);
    
    function handleSaveConfig (subject: string, body: string) {
      console.log("Saving email config: ", { subject, body }, " para: ", {user});
      if (!subject || !body) return ;
      if (!user?.id) return ;


      const payload = {
        ...user,
        email_subject: subject,
        email_body: body,
      }

      updateEmailConfig.mutate(payload, {
        onSuccess: () => {
          onClose()
          console.log("Email config updated successfully");
        }
      })
    }

    const inputClass = "w-full rounded-md border border-input dark:border-white bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
   return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar Email</DialogTitle>
        </DialogHeader>
        <Input
            type="text" 
            value={user?.email_subject ?? subject}
            onChange={e => 
              setSubject(e.target.value )}
            className={inputClass + " h-10 mb-3"}
            placeholder="Assunto do Email"
        />

        <label className="sr-only">Corpo do email</label>
        <Input
            type="text"
            value={user?.email_body ?? body}
            className={inputClass + " min-h-[160px] resize-y mb-3"}
            placeholder="Corpo do Email"
            onChange={e => setBody(e.target.value)}
        />
        <div className="mt-6 flex">
          <Button onClick={() => handleSaveConfig(subject, body)}> Salvar</Button>
          <Button variant="ghost" className="ml-auto" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
    )
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
