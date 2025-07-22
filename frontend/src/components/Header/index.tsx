import { Link } from 'react-router-dom'
import {
 LayoutDashboard,
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
 useSidebar
} from '@/components/ui/sidebar'

interface AppSidebarProps {
 activeTab: string
 onTabChange: (tab: string) => void
}

export function Header({ activeTab, onTabChange }: AppSidebarProps) {
 const { state } = useSidebar()
 const isCollapsed = state === 'collapsed'

 const menuItems = [
  {
   id: 'dashboard',
   label: 'Dashboard',
   icon: LayoutDashboard,
   href: '/dashboard'
  },
  { id: 'leads', label: 'Leads', icon: Users, href: '/dashboard/leads' }
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
     <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
     <SidebarGroupContent>
      <SidebarMenu>
       {menuItems.map(item => {
        return (
         <SidebarMenuItem key={item.id}>
          <Link to={item.href}>
           <SidebarMenuButton
            onClick={() => onTabChange(item.id)}
            isActive={activeTab === item.id}
            tooltip={isCollapsed ? item.label : undefined}
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
  </Sidebar>
 )
}
