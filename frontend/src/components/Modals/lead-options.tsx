import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from '../ui/input'
import { useEffect, useState } from "react"
import type { UserRequest } from "@/http/types/user"
import { useEmail } from "@/http/use-email"
import { useTemplates } from "@/http/use-templates"
import { Plus } from "lucide-react"

interface BaseModalProps {
    isOpen: boolean
    onClose: () => void
    user: UserRequest | null
}

export function EmailConfigModal({ isOpen, onClose, user }: BaseModalProps) {
  const [subject, setSubject] = useState(user?.email_subject ?? '');
  const [body, setBody] = useState(user?.email_body ?? '');
  const { updateEmailConfig } = useEmail();
  const [position, setPosition] = useState<string>('1');
  const [active, setActive] = useState<boolean>(false);
  const { getTemplates } = useTemplates();



  console.log("Available templates: ", getTemplates.data);

    useEffect(() => {
      setSubject('');
      setBody('');
      setPosition('1');
      setActive(false);
    }, [user]);
    
    function handleSaveConfig (subject: string, body: string, position: string = '1', active: boolean = true) {
      console.log("Saving email config: ", { subject, body, position, active }, " para: ", {user});
      if (!subject || !body) return ;
      if (!user?.id) return ;


      const payload: any = {
        id: user.id,
        email_subject: subject,
        email_body: body,
        position,
        active,
      }

      updateEmailConfig.mutate(payload as any, {
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
        <div className="flex">
          <div className="w-40 pr-4 border-r">
            <div className="mb-2 text-sm text-muted-foreground">Templates</div>
            <div className="space-y-2">
              {getTemplates.data?.map(n => (
                <button key={n.position} type="button" className={`w-full flex items-center justify-center px-3 py-2 rounded border ${position === String(n.position) ? 'bg-primary text-white hover:bg-primary/90' : 'bg-background hover:bg-muted'}`}
                onClick={() => {setSubject(n.subject); setBody(n.body); setPosition(String(n.position))}} >
                  {n.subject}
                </button>
              ))}
              {(getTemplates.data?.length ?? 0) < 5 && (
                <button key="new" type="button" className="w-full flex items-center justify-center px-3 py-2 rounded border bg-background hover:bg-muted" onClick={() => {
                  // compute next available position 1..5
                  const used = new Set(getTemplates.data?.map(t => Number(t.position)) || []);
                  let next = 1;
                  for (let i = 1; i <= 5; i++) {
                    if (!used.has(i)) { next = i; break; }
                  }
                  setSubject(''); setBody(''); setPosition(String(next)); setActive(false);
                }}>
                  <Plus />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 pl-4">
            <Input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className={inputClass + " h-10 mb-3"}
              placeholder="Assunto do Email"
            />

            <label className="sr-only">Corpo do email</label>
            <Input
              type="text"
              value={body}
              className={inputClass + " min-h-[160px] resize-y mb-3"}
              placeholder="Corpo do Email"
              onChange={e => setBody(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex">
          <Button onClick={() => handleSaveConfig(subject, body, position, active)}> Salvar</Button>
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
