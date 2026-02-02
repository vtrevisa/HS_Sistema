import { Link, useLocation } from 'react-router-dom'
import {
 LayoutDashboard,
 LogOut,
 Target,
 Users,
 Search,
 Trello,
 FileText,
 UserCircle,
 ArrowRightLeft,
 Sun,
 Moon
 //  Shield,
 //  Calculator,
 //  Zap,
 //  Settings,
 //  Calendar,

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
import { useUser } from '@/http/use-user'
import { useTheme } from '@/hooks/useTheme'

interface MenuItemProps {
 id: string
 label: string
 icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
 href: string
}

export function Header() {
 const { state } = useSidebar()
 const isCollapsed = state === 'collapsed'
 const location = useLocation()
 const { mutateAsync: logout } = useLogout()

 const { user } = useUser()

 const comercialItems: MenuItemProps[] = [
  {
   id: 'dashboard',
   label: 'Dashboard CRM',
   icon: LayoutDashboard,
   href: '/dashboard'
  },
  {
   id: 'captacao-alvaras',
   label: 'Captação de Alvarás',
   icon: Target,
   href: '/dashboard/captacao-alvaras'
  },
  {
   id: 'busca-dados',
   label: 'Busca de Dados da Empresa',
   icon: Search,
   href: '/dashboard/busca-empresa'
  },
  {
   id: 'pipeline-crm',
   label: 'Pipeline CRM',
   icon: Trello,
   href: '/dashboard/pipeline-crm'
  },
  {
   id: 'gestao-leads',
   label: 'Gestão de Leads',
   icon: Users,
   href: '/dashboard/gestao-leads'
  },
  {
   id: 'propostas-arquivadas',
   label: 'Propostas Arquivadas',
   icon: FileText,
   href: '/dashboard/propostas-arquivadas'
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

 const systemItems = [
  {
   id: 'user-profile',
   label: 'Minha Conta',
   icon: UserCircle,
   href: '/dashboard/minha-conta'
  },
  {
   id: 'plans',
   label: 'Solicitações',
   icon: ArrowRightLeft,
   href: '/dashboard/solicitacoes'
  },

  {
   id: 'logs',
   label: 'Logs de Alvarás',
   icon: FileText,
   href: '/dashboard/logs'
  }
 ]

 const { actualTheme, setTheme } = useTheme()

 const activeTab = comercialItems.find(
  item => item.href === location.pathname
 )?.id

 const toggleTheme = () => {
  setTheme(actualTheme === 'dark' ? 'light' : 'dark')
 }

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
    {/* Gestão Comercial (CRM) */}
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

    <SidebarGroup>
     <SidebarGroupLabel>Sistema</SidebarGroupLabel>
     <SidebarGroupContent>
      <SidebarMenu>
       {systemItems
        .filter(item => {
         if (
          (item.id === 'logs' && user.role !== 'admin') ||
          (item.id === 'plans' && user.role !== 'admin')
         ) {
          return false
         }
         return true
        })
        .map(item => (
         <SidebarMenuItem key={item.id}>
          <Link to={item.href}>
           <SidebarMenuButton
            isActive={activeTab === item.id}
            tooltip={isCollapsed ? item.label : undefined}
           >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
           </SidebarMenuButton>
          </Link>
         </SidebarMenuItem>
        ))}
      </SidebarMenu>
     </SidebarGroupContent>
    </SidebarGroup>
   </SidebarContent>

   <SidebarFooter>
    <SidebarMenu>
     <SidebarMenuItem>
      <SidebarMenuButton
       onClick={toggleTheme}
       tooltip={
        isCollapsed
         ? actualTheme === 'dark'
           ? 'Modo Claro'
           : 'Modo Escuro'
         : undefined
       }
       className="hover:bg-accent hover:text-accent-foreground"
      >
       {actualTheme === 'dark' ? (
        <Sun className="h-4 w-4" />
       ) : (
        <Moon className="h-4 w-4" />
       )}
       <span>{actualTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
      </SidebarMenuButton>
     </SidebarMenuItem>
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
