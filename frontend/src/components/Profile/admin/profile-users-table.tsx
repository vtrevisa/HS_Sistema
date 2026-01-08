import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { UserRequest } from '@/http/types/user'
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
import { DeleteUserModal } from '@/components/Modals/delete-user'
import { getRoleBadge, getStatusBadge } from '@/utils/profile'
import { useUserActions } from '@/hooks/profile'

interface ProfileUserTableProps {
 users: UserRequest[]
}

export function ProfileUserTable({ users }: ProfileUserTableProps) {
 const {
  selectedUser,
  setSelectedUser,
  deleteUser,

  editModalOpen,
  roleModalOpen,
  deleteModalOpen,

  setEditModalOpen,
  setRoleModalOpen,
  setDeleteModalOpen,

  handleEditUser,
  handleToggleDeleteUser,
  handleToggleRole,
  confirmToggleRole,
  handleDeleteUser
 } = useUserActions()

 return (
  <>
   <div className="rounded-md border overflow-x-auto mt-4">
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
        Tipo
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
        Status
       </th>
       <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
        Último login
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
           {new Date(user.last_login_at).toLocaleDateString('pt-BR')}
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
