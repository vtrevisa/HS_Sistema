import { useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Header } from '@/components/Header'
import { Topbar } from '@/components/Header/topbar'
import { Outlet } from 'react-router-dom'
import { CLCBProvider } from '@/contexts/CLCBContext'

import { useTheme } from '@/hooks/useTheme'

import { MantineProvider } from '@mantine/core'

export function AppLayout() {
 const { theme } = useTheme()

 useEffect(() => {
  // Tailwind
  document.documentElement.classList.toggle('dark', theme === 'dark')

  // Mantine (essencial para o MonthPicker)
  document.documentElement.setAttribute('data-mantine-color-scheme', theme)
 }, [theme])

 return (
  <CLCBProvider>
   <SidebarProvider>
    <MantineProvider defaultColorScheme="auto">
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
    </MantineProvider>
   </SidebarProvider>
  </CLCBProvider>
 )
}
