import { Button } from '@/components/ui/button'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export const ThemeToggle = () => {
 const { setTheme } = useTheme()

 return (
  <DropdownMenu>
   <DropdownMenuTrigger asChild>
    <Button variant="outline" size="icon" className="h-9 w-9 border-border">
     <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
     <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
     <span className="sr-only">Toggle theme</span>
    </Button>
   </DropdownMenuTrigger>
   <DropdownMenuContent align="end" className="bg-popover border-border">
    <DropdownMenuItem
     onClick={() => setTheme('light')}
     className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
    >
     <Sun className="mr-2 h-4 w-4" />
     <span>Claro</span>
    </DropdownMenuItem>
    <DropdownMenuItem
     onClick={() => setTheme('dark')}
     className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
    >
     <Moon className="mr-2 h-4 w-4" />
     <span>Escuro</span>
    </DropdownMenuItem>
    <DropdownMenuItem
     onClick={() => setTheme('system')}
     className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
    >
     <Monitor className="mr-2 h-4 w-4" />
     <span>Sistema</span>
    </DropdownMenuItem>
   </DropdownMenuContent>
  </DropdownMenu>
 )
}
