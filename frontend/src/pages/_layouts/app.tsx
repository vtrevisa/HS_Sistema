import { SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/Header'
import { Topbar } from '@/components/Header/topbar'
import { Outlet } from 'react-router-dom'
import { CLCBProvider } from '@/contexts/CLCBContext'

export function AppLayout() {
 return (
  <CLCBProvider>
   <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
     <Header />

     <div className="flex-1 flex flex-col">
      {/* Header with sidebar trigger and theme toggle */}
      <Topbar />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
       <Outlet />
      </main>
     </div>
    </div>
   </SidebarProvider>
  </CLCBProvider>
 )
}
