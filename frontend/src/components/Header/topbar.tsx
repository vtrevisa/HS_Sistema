import { SidebarTrigger } from '../ui/sidebar'
import { ThemeToggle } from '../ui/theme-toggle'

export function Topbar() {
 return (
  <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
   <SidebarTrigger />
   <ThemeToggle />
  </header>
 )
}
