import { Link } from 'react-router-dom'
import {
 LayoutDashboard,
 LogOut,
 Target,
 Users
 //  Trello,
 //  Shield,
 //  Calculator,
 //  Zap,
 //  Settings,
 //  Calendar,
 //  FileText,
 //  MessageCircle,
 //  Cog
} from 'lucide-react'
import {
 Sidebar,
 SidebarContent,
 SidebarGroup,
 SidebarGroupContent,
 SidebarGroupLabel,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 SidebarHeader,
 SidebarFooter,
 useSidebar
} from '@/components/ui/sidebar'
import { useLogout } from '@/http/use-logout'

interface AppSidebarProps {
 activeTab: string
 onTabChange: (tab: string) => void
}

export function Header({ activeTab, onTabChange }: AppSidebarProps) {
 const { state } = useSidebar()
 const isCollapsed = state === 'collapsed'

 const comercialItems = [
  {
   id: 'dashboard',
   label: 'Dashboard CRM',
   icon: LayoutDashboard,
   href: '/dashboard'
  },
  {
   id: 'leads',
   label: 'Gestão de Leads',
   icon: Users,
   href: '/dashboard/leads'
  }
  // { id: 'kanban', label: 'Kanban', icon: Trello },
  // { id: 'clcb', label: 'CLCB', icon: Shield },
  // { id: 'orcamentos', label: 'Orçamentos', icon: Calculator },
  // { id: 'productivity', label: 'Produtividade', icon: Zap },
  // { id: 'advanced', label: 'Avançado', icon: Settings },
  // { id: 'calendar', label: 'Agenda', icon: Calendar },
  // { id: 'documents', label: 'Documentos', icon: FileText },
  // { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  // { id: 'settings', label: 'Configurações', icon: Cog }
 ]

 const { mutateAsync: logout } = useLogout()

 async function handleLogout() {
  await logout()
 }

 return (
  <Sidebar collapsible="icon">
   <SidebarHeader>
    <div className="flex items-center gap-2 px-2">
     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <LayoutDashboard className="h-4 w-4" />
     </div>
     {!isCollapsed && (
      <div className="flex flex-col">
       <span className="text-sm font-semibold">Painel HS Sistema</span>
      </div>
     )}
    </div>
   </SidebarHeader>

   <SidebarContent>
    <SidebarGroup>
     <SidebarGroupLabel className="text-blue-600 font-semibold flex items-center gap-2">
      <Target className="h-4 w-4" />
      {!isCollapsed && 'Gestão Comercial'}
     </SidebarGroupLabel>
     <SidebarGroupContent>
      <SidebarMenu>
       {comercialItems.map(item => {
        return (
         <SidebarMenuItem key={item.id}>
          <Link to={item.href}>
           <SidebarMenuButton
            onClick={() => onTabChange(item.id)}
            isActive={activeTab === item.id}
            tooltip={isCollapsed ? item.label : undefined}
            className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-l-2 data-[active=true]:border-blue-500"
           >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
           </SidebarMenuButton>
          </Link>
         </SidebarMenuItem>
        )
       })}
      </SidebarMenu>
     </SidebarGroupContent>
    </SidebarGroup>
   </SidebarContent>

   <SidebarFooter>
    <SidebarMenu>
     <SidebarMenuItem>
      <SidebarMenuButton
       onClick={handleLogout}
       tooltip={isCollapsed ? 'Sair' : undefined}
       className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
       <LogOut className="h-4 w-4" />
       <span>Sair</span>
      </SidebarMenuButton>
     </SidebarMenuItem>
    </SidebarMenu>
   </SidebarFooter>
  </Sidebar>
 )
}
