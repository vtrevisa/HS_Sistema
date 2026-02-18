import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
 AlertTriangle,
 Bell,
 Calendar,
 CheckCheck,
 CheckCircle,
 Clock,
 DollarSign,
 FileText,
 Filter,
 Settings,
 X
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
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Switch } from '../ui/switch'
import { useNotifications } from '@/hooks/useNotifications'

export function PipelineNotification() {
 const {
  markAllAsRead,
  markAsRead,
  unreadCount,
  notifications,
  dismissNotification,
  settings,
  updateSettings
 } = useNotifications()

 const navigate = useNavigate()

 const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'high'>(
  'all'
 )

 const [selectedCategory, setSelectedCategory] = useState<string>('all')

 const getNotificationIcon = (type: string) => {
  switch (type) {
   case 'document_expiring':
    return <FileText className="h-4 w-4 text-destructive" />
   case 'budget_status':
    return <DollarSign className="h-4 w-4 text-green-600" />
   case 'automatic_reminder':
    return <Clock className="h-4 w-4 text-blue-600" />
   case 'process_due':
    return <AlertTriangle className="h-4 w-4 text-red-600" />
   case 'license_expiring':
    return <AlertTriangle className="h-4 w-4 text-destructive" />
   case 'follow_up_due':
    return <Calendar className="h-4 w-4 text-red-600" />
   case 'checklist_pending':
    return <Clock className="h-4 w-4 text-yellow-600" />
   default:
    return <Bell className="h-4 w-4" />
  }
 }

 const getPriorityColor = (priority: string) => {
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

 const getCategoryLabel = (category: string) => {
  switch (category) {
   case 'document':
    return 'Documento'
   case 'budget':
    return 'Orçamento'
   case 'follow_up':
    return 'Follow-up'
   case 'process':
    return 'Processo'
   case 'reminder':
    return 'Lembrete'
   default:
    return 'Geral'
  }
 }

 const getFilteredNotifications = () => {
  let filtered = notifications

  // Filter by read status
  if (activeFilter === 'unread') {
   filtered = filtered.filter(n => !n.isRead)
  } else if (activeFilter === 'high') {
   filtered = filtered.filter(n => n.priority === 'high')
  }

  // Filter by category
  if (selectedCategory !== 'all') {
   filtered = filtered.filter(n => n.category === selectedCategory)
  }

  return filtered.sort(
   (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
 }

 const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor(
   (now.getTime() - date.getTime()) / (1000 * 60)
  )

  if (diffInMinutes < 1) return 'Agora'
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h atrás`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d atrás`
 }

 const categories = [
  { value: 'all', label: 'Todas' },
  { value: 'document', label: 'Documentos' },
  { value: 'budget', label: 'Orçamentos' },
  { value: 'process', label: 'Processos' },
  { value: 'reminder', label: 'Lembretes' }
 ]

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

     <TabsContent value="notifications" className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
       <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros:</span>
       </div>

       <div className="flex gap-1">
        {['all', 'unread', 'high'].map(filter => (
         <Button
          key={filter}
          variant={activeFilter === filter ? 'default' : 'outline'}
          size="sm"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={() => setActiveFilter(filter as any)}
         >
          {filter === 'all'
           ? 'Todas'
           : filter === 'unread'
             ? 'Não lidas'
             : 'Alta prioridade'}
         </Button>
        ))}
       </div>

       <select
        value={selectedCategory}
        onChange={e => setSelectedCategory(e.target.value)}
        className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
       >
        {categories.map(cat => (
         <option key={cat.value} value={cat.value}>
          {cat.label}
         </option>
        ))}
       </select>
      </div>

      <ScrollArea className="max-h-[50vh]">
       <div className="space-y-3">
        {getFilteredNotifications().length === 0 ? (
         <div className="text-center py-8 text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma notificação encontrada</p>
          <p className="text-sm mt-2">
           {activeFilter === 'unread'
            ? 'Todas as notificações foram lidas'
            : 'Ajuste os filtros para ver mais notificações'}
          </p>
         </div>
        ) : (
         getFilteredNotifications().map(notification => (
          <Card
           key={notification.id}
           className={`border-l-4 transition-all ${getPriorityColor(
            notification.priority
           )} ${
            !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/50' : ''
           }`}
          >
           <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
             <div className="flex items-center gap-2">
              {getNotificationIcon(notification.type)}
              <CardTitle className="text-sm">{notification.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
               {getCategoryLabel(notification.category)}
              </Badge>
              {!notification.isRead && (
               <Badge variant="secondary" className="text-xs">
                Nova
               </Badge>
              )}
             </div>
             <div className="flex gap-1">
              {!notification.isRead && (
               <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(notification.id)}
                className="h-6 w-6 p-0"
                title="Marcar como lida"
               >
                <CheckCircle className="h-3 w-3" />
               </Button>
              )}
              <Button
               variant="ghost"
               size="sm"
               onClick={() => dismissNotification(notification.id)}
               className="h-6 w-6 p-0"
               title="Dispensar"
              >
               <X className="h-3 w-3" />
              </Button>
             </div>
            </div>
           </CardHeader>
           <CardContent className="pt-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
             {notification.message}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-400">
             <span>
              {notification.actionUrl && (
               <Button
                variant="link"
                type="button"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => {
                 if (notification.actionUrl) {
                  navigate(notification.actionUrl)
                 }
                }}
               >
                Ver detalhes →
               </Button>
              )}
             </span>
             <span>{formatTimeAgo(notification.createdAt)}</span>
            </div>
           </CardContent>
          </Card>
         ))
        )}
       </div>
      </ScrollArea>
     </TabsContent>

     <TabsContent value="settings" className="space-y-4">
      <div className="space-y-6">
       <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
         <Settings className="h-5 w-5" />
         Configurações de Notificação
        </h3>

        <div className="space-y-4">
         {/* <div className="flex items-center justify-between">
          <div>
           <Label htmlFor="document-expiry">Vencimento de Documentos</Label>
           <p className="text-sm text-gray-600 dark:text-gray-400">
            Alertas quando documentos estão próximos do vencimento
           </p>
          </div>
          <Switch
           id="document-expiry"
           checked={settings.documentExpiry}
           onCheckedChange={checked =>
            updateSettings({ documentExpiry: checked })
           }
          />
         </div>

         <div className="flex items-center justify-between">
          <div>
           <Label htmlFor="budget-status">Status de Orçamentos</Label>
           <p className="text-sm text-gray-600 dark:text-gray-400">
            Notificações sobre mudanças no status dos orçamentos
           </p>
          </div>
          <Switch
           id="budget-status"
           checked={settings.budgetStatus}
           onCheckedChange={checked =>
            updateSettings({ budgetStatus: checked })
           }
          />
         </div>

         <div className="flex items-center justify-between">
          <div>
           <Label htmlFor="follow-up">Lembretes de Follow-up</Label>
           <p className="text-sm text-gray-600 dark:text-gray-400">
            Lembretes automáticos para acompanhamento de leads
           </p>
          </div>
          <Switch
           id="follow-up"
           checked={settings.followUpReminders}
           onCheckedChange={checked =>
            updateSettings({ followUpReminders: checked })
           }
          />
         </div>

         <div className="flex items-center justify-between">
          <div>
           <Label htmlFor="process-alerts">Alertas de Processos</Label>
           <p className="text-sm text-gray-600 dark:text-gray-400">
            Notificações sobre processos e vencimentos
           </p>
          </div>
          <Switch
           id="process-alerts"
           checked={settings.processAlerts}
           onCheckedChange={checked =>
            updateSettings({ processAlerts: checked })
           }
          />
         </div> */}

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
           <Label htmlFor="email-notifications">Notificações por Email</Label>
           <p className="text-sm text-muted-foreground">
            Receber notificações importantes por email (em breve)
           </p>
          </div>
          <Switch
           id="email-notifications"
           checked={settings.emailNotifications}
           onCheckedChange={checked =>
            updateSettings({ emailNotifications: checked })
           }
           disabled
          />
         </div>
        </div>
       </div>
      </div>
     </TabsContent>
    </Tabs>
   </DialogContent>
  </Dialog>
 )
}
