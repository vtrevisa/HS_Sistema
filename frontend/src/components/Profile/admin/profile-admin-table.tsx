import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { UserRequest, UserRole } from '@/http/types/user'
import {
 Calendar,
 Crown,
 Edit,
 Mail,
 MoreHorizontal,
 Trash2,
 User
} from 'lucide-react'
import { EditUserModal } from '@/components/Modals/edit-user'
import { UpdateUserRoleModal } from '@/components/Modals/update-role'
import { useUser } from '@/http/use-user'
import { DeleteUserModal } from '@/components/Modals/delete-user'

interface ProfileAdminTableProps {
 users: UserRequest[]
}

export function ProfileAdminTable({ users }: ProfileAdminTableProps) {
 const [editModalOpen, setEditModalOpen] = useState(false)
 const [roleModalOpen, setRoleModalOpen] = useState(false)
 const [deleteModalOpen, setDeleteModalOpen] = useState(false)
 const [selectedUser, setSelectedUser] = useState<UserRequest | null>(null)

 const { updateUser, deleteUser } = useUser()

 function getStatusBadge(status: string | undefined) {
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

 function getRoleBadge(role: string | undefined) {
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

 function handleEditUser(user: UserRequest) {
  setSelectedUser(user)
  setEditModalOpen(true)
 }

 function handleToggleDeleteUser(user: UserRequest) {
  setSelectedUser(user)
  setDeleteModalOpen(true)
 }

 function handleToggleRole(user: UserRequest) {
  setSelectedUser(user)
  setRoleModalOpen(true)
 }

 function confirmToggleRole(newRole: UserRole) {
  if (!selectedUser) return

  updateUser.mutate(
   {
    ...selectedUser,
    role: newRole
   },
   {
    onSuccess: () => {
     setRoleModalOpen(false)
     setSelectedUser(null)
    }
   }
  )
 }

 function handleDeleteUser() {
  if (!selectedUser) return

  deleteUser.mutate(selectedUser.id, {
   onSuccess: () => {
    setDeleteModalOpen(false)
    setSelectedUser(null)
   }
  })
 }

 return (
  <>
   <Card className="p-2 md:p-6">
    <div className="rounded-md border overflow-x-auto">
     <table className="w-full caption-bottom text-sm">
      <thead className="[&_tr]:border-b">
       <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
         Usuário
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
         Empresa
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
         Plano
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
         Alvarás
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
         Role
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
         Status
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
         Cadastro
        </th>
        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
         Ações
        </th>
       </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
       {users.length === 0 ? (
        <tr>
         <td colSpan={12} className="text-center py-8 text-muted-foreground">
          Nenhum registro encontrado
         </td>
        </tr>
       ) : (
        users.map(user => (
         <tr
          key={user.id}
          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
         >
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
             <User className="h-5 w-5 text-primary" />
            </div>
            <div>
             <p className="font-medium">{user.name}</p>
             <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
             </p>
            </div>
           </div>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
           <div>
            <p className="font-medium">{user.company}</p>
            <p className="text-xs text-muted-foreground">{user.cnpj}</p>
           </div>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
           <Badge variant="outline">{user.plan?.name}</Badge>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
           <div className="flex items-center gap-2">
            <span className="font-medium">{user.alvarasUsed ?? 0}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">
             {user.plan?.monthly_credits || 0}
            </span>
           </div>
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
           {getRoleBadge(user.role)}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
           {getStatusBadge(user.status)}
          </td>
          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
           <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(user.created_at).toLocaleDateString('pt-BR')}
           </div>
          </td>
          <td className="text-right px-4">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="icon">
              <MoreHorizontal
               className="h-4 w-4"
               onClick={() => handleEditUser(user)}
              />
             </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
             <DropdownMenuItem onClick={() => handleEditUser(user)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleToggleRole(user)}>
              <Crown className="h-4 w-4 mr-2" />
              {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
             </DropdownMenuItem>
             <DropdownMenuItem
              onClick={() => handleToggleDeleteUser(user)}
              className="text-destructive"
             >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
             </DropdownMenuItem>
            </DropdownMenuContent>
           </DropdownMenu>
          </td>
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
   </Card>

   {selectedUser && (
    <>
     <EditUserModal
      key={selectedUser.id}
      user={selectedUser}
      isOpen={editModalOpen}
      onClose={() => {
       setEditModalOpen(false)
       setSelectedUser(null)
      }}
     />

     <UpdateUserRoleModal
      user={selectedUser}
      isOpen={roleModalOpen}
      onClose={() => {
       setRoleModalOpen(false)
       setSelectedUser(null)
      }}
      onConfirm={confirmToggleRole}
     />

     <DeleteUserModal
      user={selectedUser}
      isOpen={deleteModalOpen}
      onClose={() => {
       setDeleteModalOpen(false)
       setSelectedUser(null)
      }}
      onConfirm={handleDeleteUser}
      onDeleting={deleteUser.isPending}
     />
    </>
   )}
  </>
 )
}
