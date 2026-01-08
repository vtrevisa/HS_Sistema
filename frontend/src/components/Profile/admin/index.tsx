import { useState } from 'react'
import { Shield } from 'lucide-react'
import { ProfileAdminCards } from './profile-admin-cards'
import { ProfileAdminData } from './profile-admin'
import { useUser } from '@/http/use-user'

export function ProfileAdmin() {
 const { users, isLoading } = useUser()

 const [searchTerm, setSearchTerm] = useState('')

 const adminUsers = users.filter(user => user.role === 'admin')
 const systemUsers = users.filter(user => user.role !== 'admin')

 //const orderedUsers = [...adminUsers, ...systemUsers]

 const filteredAdminUsers = adminUsers.filter(
  user =>
   user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
   user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
   user.company?.toLowerCase().includes(searchTerm.toLowerCase())
 )

 const filteredUsers = systemUsers.filter(
  user =>
   user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
   user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
   user.company?.toLowerCase().includes(searchTerm.toLowerCase())
 )

 const totalUsers = users.length
 const activeUsers = users.filter(user => user.status === 'active').length
 const totalAlvarasUsed = users.reduce(
  (acc, user) => acc + (user.alvarasUsed ?? 0),
  0
 )

 if (isLoading) return <p>Carregando...</p>

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
     <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
      <Shield className="h-8 w-8 text-primary" />
      Administração de Usuários
     </h1>
     <p className="text-muted-foreground">
      Gerencie todos os usuários cadastrados no sistema
     </p>
    </div>
   </div>

   <ProfileAdminCards
    totalUsers={totalUsers}
    activeUsers={activeUsers}
    totalAlvarasUsed={totalAlvarasUsed}
   />

   <ProfileAdminData
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    admin={filteredAdminUsers}
    users={filteredUsers}
   />
  </div>
 )
}
