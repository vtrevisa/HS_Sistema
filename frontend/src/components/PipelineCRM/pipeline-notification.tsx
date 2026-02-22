import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
 AlertTriangle,
 Bell,
 Calendar,
 CheckCheck,
 CheckCircle,
 Settings
} from 'lucide-react'
import { Button } from '../ui/button'
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { ScrollArea } from '../ui/scroll-area'
import {
 useNotifications,
 type NotificationType
} from '@/hooks/useNotifications'

export function PipelineNotification() {
 const {
  markAllAsRead,
  markAsRead,
  unreadCount,
  notifications,
  settings,
  updateSettings
 } = useNotifications()

 const navigate = useNavigate()

 const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'high'>(
  'all'
 )

 function getNotificationIcon(type: NotificationType) {
  switch (type) {
   case 'task_overdue':
    return <AlertTriangle className="h-4 w-4 text-red-600" />
   case 'task_due':
    return <Calendar className="h-4 w-4 text-yellow-600" />
   case 'avcb_clcb_expiring':
    return <AlertTriangle className="h-4 w-4 text-orange-600" />
   case 'admin_notice':
    return <Bell className="h-4 w-4 text-blue-600" />
   default:
    return <Bell className="h-4 w-4" />
  }
 }

 function getPriorityColor(priority: 'high' | 'medium' | 'low') {
  switch (priority) {
   case 'high':
    return 'bg-red-50 border-l-red-500 dark:bg-red-950'
   case 'medium':
    return 'bg-yellow-50 border-l-yellow-500 dark:bg-yellow-950'
   case 'low':
    return 'bg-blue-50 border-l-blue-500 dark:bg-blue-950'
   default:
    return 'bg-gray-50 border-l-gray-500 dark:bg-gray-950'
  }
 }

 function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diff < 1) return 'Agora'
  if (diff < 60) return `${diff}m atrás`

  const hours = Math.floor(diff / 60)
  if (hours < 24) return `${hours}h atrás`

  return `${Math.floor(hours / 24)}d atrás`
 }

 function getFilteredNotifications() {
  let list = notifications

  if (activeFilter === 'unread') {
   list = list.filter(n => !n.isRead)
  }

  if (activeFilter === 'high') {
   list = list.filter(n => n.priority === 'high')
  }

  return list.sort(
   (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
 }

 return (
  <Dialog>
   <DialogTrigger asChild>
    <Button variant="outline" size="sm" className="relative">
     <Bell className="h-4 w-4" />
     {unreadCount > 0 && (
      <Badge
       variant="destructive"
       className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
      >
       {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
     )}
    </Button>
   </DialogTrigger>
   <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
    <DialogHeader>
     <DialogTitle className="flex items-center justify-between">
      <div className="flex items-center gap-2">
       <Bell className="h-5 w-5" />
       Central de Notificações
       {unreadCount > 0 && (
        <Badge variant="secondary">{unreadCount} não lidas</Badge>
       )}
      </div>
      <div className="flex gap-2">
       <Button
        variant="outline"
        size="sm"
        onClick={markAllAsRead}
        disabled={unreadCount === 0}
       >
        <CheckCheck className="h-4 w-4 mr-1" />
        Marcar todas como lidas
       </Button>
      </div>
     </DialogTitle>
    </DialogHeader>

    <Tabs defaultValue="notifications" className="w-full">
     <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="notifications">Notificações</TabsTrigger>
      <TabsTrigger value="settings">Configurações</TabsTrigger>
     </TabsList>

     <TabsContent value="notifications">
      <Tabs
       defaultValue="all"
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       onValueChange={v => setActiveFilter(v as any)}
      >
       <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="all">Todas</TabsTrigger>
        <TabsTrigger value="unread">Não lidas</TabsTrigger>
        <TabsTrigger value="high">Alta prioridade</TabsTrigger>
       </TabsList>

       <ScrollArea className="max-h-[55vh] pr-2 overflow-auto">
        <div className="space-y-3">
         {getFilteredNotifications().length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
           <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
           Nenhuma notificação encontrada
          </div>
         ) : (
          getFilteredNotifications().map(notification => (
           <Card
            key={notification.id}
            className={`border-l-4 ${getPriorityColor(
             notification.priority
            )} ${!notification.isRead ? 'ring-1 ring-primary/20' : ''}`}
           >
            <CardHeader className="pb-2">
             <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
               {getNotificationIcon(notification.type)}
               <CardTitle className="text-sm">{notification.title}</CardTitle>
               {!notification.isRead && (
                <Badge variant="secondary" className="text-xs">
                 Nova
                </Badge>
               )}
              </div>

              {!notification.isRead && (
               <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(notification.id)}
                className="h-6 w-6 p-0"
                title="Marcar como lida"
               >
                <CheckCircle className="h-4 w-4" />
               </Button>
              )}
             </div>
            </CardHeader>

            <CardContent className="pt-0">
             <p className="text-sm text-muted-foreground mb-2">
              {notification.message}
             </p>

             <div className="flex items-center justify-between text-xs text-muted-foreground">
              {notification.actionUrl ? (
               <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs"
                onClick={() => navigate(notification.actionUrl!)}
               >
                Ver detalhes →
               </Button>
              ) : (
               <span />
              )}
              <span>{formatTimeAgo(notification.createdAt)}</span>
             </div>
            </CardContent>
           </Card>
          ))
         )}
        </div>
       </ScrollArea>
      </Tabs>
     </TabsContent>
     <TabsContent value="settings" className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
       <Settings className="h-5 w-5" />
       Preferências de Notificação
      </h3>

      <div className="space-y-4">
       <div className="flex items-center justify-between">
        <div>
         <Label htmlFor="push-notifications">Notificações Push</Label>
         <p className="text-sm text-muted-foreground">
          Mostrar toasts para notificações importantes
         </p>
        </div>
        <Switch
         id="push-notifications"
         checked={settings.pushNotifications}
         onCheckedChange={checked =>
          updateSettings({ pushNotifications: checked })
         }
        />
       </div>
       <div className="flex items-center justify-between">
        <div>
         <Label>Notificações de tarefas</Label>
         <p className="text-sm text-muted-foreground">
          Alertas de tarefas vencidas ou do dia
         </p>
        </div>
        <Switch
         checked={settings.tasks}
         onCheckedChange={checked => updateSettings({ tasks: checked })}
        />
       </div>

       <div className="flex items-center justify-between">
        <div>
         <Label>Notificações de AVCB / CLCB</Label>
         <p className="text-sm text-muted-foreground">
          Alertas de licenças próximas do vencimento
         </p>
        </div>
        <Switch
         checked={settings.alvaras}
         onCheckedChange={checked => updateSettings({ alvaras: checked })}
        />
       </div>
      </div>
     </TabsContent>
    </Tabs>
   </DialogContent>
  </Dialog>
 )
}
