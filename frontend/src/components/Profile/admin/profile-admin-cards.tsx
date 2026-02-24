import {
 Card,
 CardDescription,
 CardHeader,
 CardTitle
} from '@/components/ui/card'
import { Target, User, Users } from 'lucide-react'

interface ProfileAdminCardsProps {
 totalUsers: number
 activeUsers: number
 totalAlvarasUsed: number
}

export function ProfileAdminCards({
 totalUsers,
 activeUsers,
 totalAlvarasUsed
}: ProfileAdminCardsProps) {
 return (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
   <Card>
    <CardHeader className="p-4">
     <CardDescription>Total de Usuários</CardDescription>
     <CardTitle className="text-3xl flex items-center gap-2">
      <Users className="h-6 w-6 text-primary" />
      {totalUsers}
     </CardTitle>
    </CardHeader>
   </Card>
   <Card>
    <CardHeader className="pb-2">
     <CardDescription>Usuários Ativos</CardDescription>
     <CardTitle className="text-3xl flex items-center gap-2">
      <User className="h-6 w-6 text-brand-success" />
      {activeUsers}
     </CardTitle>
    </CardHeader>
   </Card>
   <Card>
    <CardHeader className="pb-2">
     <CardDescription>Alvarás Consumidos (Total)</CardDescription>
     <CardTitle className="text-3xl flex items-center gap-2">
      <Target className="h-6 w-6 text-destructive" />
      {totalAlvarasUsed}
     </CardTitle>
    </CardHeader>
   </Card>
  </div>
 )
}
