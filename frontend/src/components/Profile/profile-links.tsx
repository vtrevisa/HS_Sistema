import { useState, useEffect } from 'react'
import { Link as LinkIcon, Calendar, MessageSquare, Mail, MapPin } from 'lucide-react'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from '../ui/card'
import { Button } from '../ui/button'
import { api } from '../../lib/api'
import type { UserRequest } from '@/http/types/user'
import { GoogleCalendarModal, WhatsAppModal, EmailModal, ViaFacilModal } from '../Modals/profile-links'
interface ProfileLinksProps {
 user: UserRequest
}

export function ProfileLinks({ user }: ProfileLinksProps) {
 const [activeModal, setActiveModal] = useState<string | null>(null)
 const [emailProvider, setEmailProvider] = useState<'gmail' | 'outlook' | null>(null)
 useEffect(() => {
  let mounted = true
  api
    .get('/email/status')
    .then((res) => {
      const data = res.data || {}
      const gmail = data.gmail?.connected
      const outlook = data.outlook?.connected
      if (!mounted) return
      if (gmail) setEmailProvider('gmail')
      else if (outlook) setEmailProvider('outlook')
      else setEmailProvider(null)
    })
    .catch(() => {
      if (mounted) setEmailProvider(null)
    })

  return () => {
    mounted = false
  }
 }, [])

 useEffect(() => {
  // placeholder effect in case we need to init anything when user changes
 }, [user])

 return (
  <Card>
   <CardHeader>
    <div className="flex items-center gap-3">
     <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
      <LinkIcon className="h-5 w-5 text-primary" />
     </div>
     <div>
      <CardTitle>Vinculações de API</CardTitle>
      <CardDescription>Conecte suas integrações externas</CardDescription>
     </div>
    </div>
   </CardHeader>
    <CardContent>
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
         <Calendar className="h-5 w-5 text-primary" />
         <div>
          <div className="font-medium">Google Calendar</div>
          <div className="text-sm text-muted-foreground">Sincronize seu calendário</div>
         </div>
        </div>
        <Button onClick={() => setActiveModal('google-calendar')}>Configurar</Button>
      </div>

      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
         <MessageSquare className="h-5 w-5 text-primary" />
         <div>
          <div className="font-medium">WhatsApp</div>
          <div className="text-sm text-muted-foreground">Envio via WhatsApp</div>
         </div>
        </div>
        <Button onClick={() => setActiveModal('whatsapp')}>Configurar</Button>
      </div>

      {emailProvider ? (
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
         <Mail className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">E-mail</div>
          </div>
          <div className="text-sm text-muted-foreground">
            {emailProvider === 'gmail' ? 
              <img src="/public/gmail-icon.png" alt="Gmail" className="h-10 w-10 inline mr-1" /> : 
              emailProvider === 'outlook' ? 
              <img src="/public/outlook-icon.png" alt="Outlook" className="h-4 w-4 inline mr-1" /> :
              ''}
          </div>
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" aria-hidden />
        </div>
        <Button
            variant="destructive"
            onClick={async () => {
              if (!confirm('Deseja desconectar a integração de e-mail?')) return
              try {
                await api.delete(`/email/disconnect/${emailProvider}`)
                setEmailProvider(null)
                // optional: show toast
              } catch (e) {
                // optional: show error
              }
            }}
          >
            Desconectar
          </Button>
      </div>
      ) : (
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
         <Mail className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">E-mail</div>
            <div className="text-sm text-muted-foreground">Integração via e-mail</div>
          </div>
        </div>
          <Button onClick={() => setActiveModal('email')}>Configurar</Button>
      </div>
      )}

      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
         <MapPin className="h-5 w-5 text-primary" />
         <div>
          <div className="font-medium">ViaFácil SP</div>
          <div className="text-sm text-muted-foreground">Integração ViaFácil São Paulo</div>
         </div>
        </div>
        <Button onClick={() => setActiveModal('viafacil')}>Configurar</Button>
      </div>
     </div>

     <GoogleCalendarModal isOpen={activeModal === 'google-calendar'} onClose={() => setActiveModal(null)} />
     <WhatsAppModal isOpen={activeModal === 'whatsapp'} onClose={() => setActiveModal(null)} />
     <EmailModal isOpen={activeModal === 'email'} onClose={() => setActiveModal(null)} />
     <ViaFacilModal isOpen={activeModal === 'viafacil'} onClose={() => setActiveModal(null)} />
   </CardContent>
  </Card>
 )
}

export default ProfileLinks
