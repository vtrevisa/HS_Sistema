import { useEffect, useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/Header'
import { Topbar } from '@/components/Header/topbar'
import { Outlet, useLocation } from 'react-router-dom'
import { CLCBProvider } from '@/contexts/CLCBContext'
import { LeadsProvider } from '@/contexts/LeadsContext'
import { CRMProvider } from '@/contexts/CRMContext'

export function AppLayout() {
 const location = useLocation()
 const [activeTab, setActiveTab] = useState('dashboard')

 useEffect(() => {
  if (location.pathname.startsWith('/dashboard/leads')) {
   setActiveTab('leads')
  } else if (location.pathname.startsWith('/dashboard')) {
   setActiveTab('dashboard')
  }
 }, [location.pathname])

 return (
  <LeadsProvider>
   <CLCBProvider>
    <CRMProvider>
     <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
       <Header activeTab={activeTab} onTabChange={setActiveTab} />

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
    </CRMProvider>
   </CLCBProvider>
  </LeadsProvider>
 )
}
