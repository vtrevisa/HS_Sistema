import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useEffect, useState } from 'react'
import type { UserRequest } from '@/http/types/user'
import { useEmail } from '@/http/use-email'
import { useTemplates } from '@/http/use-templates'
import { Plus } from 'lucide-react'

interface BaseModalProps {
 isOpen: boolean
 onClose: () => void
 user: UserRequest | null
}

export function EmailConfigModal({ isOpen, onClose, user }: BaseModalProps) {
 const [subject, setSubject] = useState(user?.email_subject ?? '')
 const [body, setBody] = useState(user?.email_body ?? '')
 const { updateEmailConfig } = useEmail()
 const [position, setPosition] = useState<string>('1')
 const [active, setActive] = useState<boolean>(false)
 const [extraPositions, setExtraPositions] = useState<number[]>([])
 const { getTemplates } = useTemplates()

 // When modal opens, refetch templates from server; when closed, discard unsaved local state
 useEffect(() => {
  if (isOpen) {
   getTemplates.refetch()
  } else {
   // clear temporary positions and local edits when closing
   setExtraPositions([])
   setSubject('')
   setBody('')
   setPosition('1')
   setActive(false)
  }
 }, [isOpen])

 useEffect(() => {
  // When modal/user/templates change, initialize fields from user or active template
  if (!user) {
   setSubject('')
   setBody('')
   setPosition('1')
   setActive(false)
   return
  }

  // prefer user's saved subject/body if present
  let initSubject = user.email_subject ?? ''
  let initBody = user.email_body ?? ''
  let initPosition = '1'
  let initActive = false

  // if templates are loaded, prefer the active template
  const activeTemplate = getTemplates.data?.find(t => t.active)
  if (activeTemplate) {
   initSubject = activeTemplate.subject ?? initSubject
   initBody = activeTemplate.body ?? initBody
   initPosition = String(activeTemplate.position ?? initPosition)
   initActive = true
  }

  setSubject(initSubject)
  setBody(initBody)
  setPosition(initPosition)
  setActive(initActive)
 }, [user, getTemplates.data])

 function handleSaveConfig(
  subject: string,
  body: string,
  position: string = '1',
  active: boolean = true
 ) {
  console.log(
   'Saving email config: ',
   { subject, body, position, active },
   ' para: ',
   { user }
  )
  if (!user?.id) return

  const payload: any = {
   id: user.id,
   email_subject: subject,
   email_body: body,
   position: position,
   active: active
  }

  updateEmailConfig.mutate(payload as any, {
   onSuccess: () => {
    // remove this position from temporary extras if present
    setExtraPositions(prev => prev.filter(p => String(p) !== String(position)))
    onClose()
    console.log('Email config updated successfully')
   }
  })
 }

 const inputClass =
  'w-full rounded-md border border-input dark:border-white bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-lg overflow-y-auto mx-4 sm:mx-auto">
    <DialogHeader>
     <DialogTitle>Configurar Email</DialogTitle>
    </DialogHeader>
    <div className="flex flex-col lg:flex-row gap-4">
     <div className="w-full lg:w-40 lg:pr-4 lg:border-r">
      <div className="mb-2 text-sm text-muted-foreground">Templates</div>
      <div className="space-y-2">
       {getTemplates.data?.map(n => (
        <button
         key={n.position}
         type="button"
         className={`w-full h-10 flex items-center justify-center px-3 py-2 rounded border-2 ${n.active ? 'border-green-500' : 'border-border'} ${position === String(n.position) ? 'bg-primary text-white hover:bg-primary/90' : 'bg-background hover:bg-muted'}`}
         onClick={() => {
          setSubject(n.subject ?? '')
          setBody(n.body ?? '')
          setPosition(String(n.position))
          setActive(true)
         }}
        >
         {n.subject || 'Template ' + n.position}
        </button>
       ))}
       {(() => {
        const serverCount = getTemplates.data?.length ?? 0
        const totalCount = serverCount + extraPositions.length
        const used = new Set(
         (getTemplates.data?.map(t => Number(t.position)) || []).concat(
          extraPositions
         )
        )

        return (
         <>
          {extraPositions.map(pos => (
           <button
            key={`new-${pos}`}
            type="button"
            className={`w-full h-10 flex items-center justify-center px-3 py-2 rounded border bg-background text-muted`}
            onClick={() => {
             setPosition(String(pos))
             setSubject('')
             setBody('')
             setActive(false)
            }}
           >
            Novo template {pos}
           </button>
          ))}

          {totalCount < 5 && (
           <button
            key="new"
            type="button"
            className="w-full h-10 flex items-center justify-center px-3 py-2 rounded border bg-background hover:bg-muted"
            onClick={() => {
             // compute next available position 1..5
             let next = 1
             for (let i = 1; i <= 5; i++) {
              if (!used.has(i)) {
               next = i
               break
              }
             }
             setExtraPositions(prev => [...prev, next])
             setSubject('')
             setBody('')
             setPosition(String(next))
             setActive(false)
            }}
           >
            <Plus />
           </button>
          )}
         </>
        )
       })()}
      </div>
     </div>

     <div className="flex-1 lg:pl-4">
      <Input
       type="text"
       value={subject}
       onChange={e => setSubject(e.target.value)}
       className={inputClass + ' h-10 mb-3'}
       placeholder="Assunto do Email"
      />

      <label className="sr-only">Corpo do email</label>
      <Input
       type="text"
       value={body}
       className={inputClass + ' min-h-[160px] resize-y mb-3'}
       placeholder="Corpo do Email"
       onChange={e => setBody(e.target.value)}
      />
     </div>
    </div>
    <div className="mt-6 flex">
     <Button onClick={() => handleSaveConfig(subject, body, position, active)}>
      {' '}
      Salvar
     </Button>
     <Button variant="ghost" className="ml-auto" onClick={onClose}>
      Fechar
     </Button>
    </div>
   </DialogContent>
  </Dialog>
 )
}
