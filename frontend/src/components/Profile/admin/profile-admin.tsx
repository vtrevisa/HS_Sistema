import {
 Card,
 CardDescription,
 CardHeader,
 CardTitle
} from '@/components/ui/card'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProfileAdminTable } from './profile-admin-table'
import { ProfileUserTable } from './profile-users-table'
import type { UserRequest } from '@/http/types/user'

interface ProfileAdminDataProps {
 searchTerm: string
 setSearchTerm: (term: string) => void
 admin: UserRequest[]
 users: UserRequest[]
}

export function ProfileAdminData({
 searchTerm,
 setSearchTerm,
 admin,
 users
}: ProfileAdminDataProps) {
 return (
  <Card>
   <CardHeader>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
     <div>
      <CardTitle>Usuários Cadastrados</CardTitle>
      <CardDescription>Lista de todos os usuários do sistema</CardDescription>
     </div>

     <div className="relative w-full md:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
       placeholder="Buscar usuário..."
       value={searchTerm}
       onChange={e => setSearchTerm(e.target.value)}
       className="pl-9"
      />
     </div>
    </div>
   </CardHeader>

   <Card className="p-2 md:p-6">
    <ProfileAdminTable users={admin} />
    <ProfileUserTable users={users} />
   </Card>
  </Card>
 )
}
