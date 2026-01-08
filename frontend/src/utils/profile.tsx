import { Badge } from '@/components/ui/badge'
import { Crown, User } from 'lucide-react'

export function getStatusBadge(status: string | undefined) {
 switch (status) {
  case 'active':
   return (
    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-600 hover:text-white">
     Ativo
    </Badge>
   )
  case 'inactive':
   return (
    <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-600 hover:text-white">
     Inativo
    </Badge>
   )
  case 'pending':
   return (
    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-600 hover:text-white">
     Pendente
    </Badge>
   )
  case 'blocked':
   return (
    <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-600 hover:text-white">
     Bloqueado
    </Badge>
   )
  default:
   return <Badge variant="outline">{status}</Badge>
 }
}

export function getRoleBadge(role: string | undefined) {
 switch (role) {
  case 'admin':
   return (
    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white dark:hover:text-black flex items-center gap-1 w-fit">
     <Crown className="h-3 w-3" />
     Admin
    </Badge>
   )
  case 'user':
   return (
    <Badge variant="outline" className="flex items-center gap-1 w-fit">
     <User className="h-3 w-3" />
     Usuário
    </Badge>
   )
  default:
   return <Badge variant="outline">{role}</Badge>
 }
}
