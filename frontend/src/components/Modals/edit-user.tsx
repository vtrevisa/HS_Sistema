import { useState, useEffect, useRef } from 'react'
import { IMaskInput } from 'react-imask'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle
} from '../ui/dialog'
import { ChevronDown, Edit } from 'lucide-react'
import type { UserRequest } from '@/http/types/user'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useUser } from '@/http/use-user'
import { useCompany } from '@/http/use-company'

interface EditUserModalProps {
 user: UserRequest | null
 isOpen: boolean
 onClose: () => void
}

export function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
 const [editedUser, setEditedUser] = useState<UserRequest | null>(user)
 const originalCnpjRef = useRef<string | null>(user?.cnpj ?? null)

 const { updateUser } = useUser()
 const { searchByCnpj } = useCompany()

 useEffect(() => {
  if (!editedUser) return
  if (editedUser.role === 'admin') return

  const cnpj = editedUser.cnpj
  if (!cnpj) return

  const cleanCnpj = cnpj.replace(/\D/g, '')

  // só busca com 14 dígitos
  if (cleanCnpj.length !== 14) return

  const originalClean = originalCnpjRef.current?.replace(/\D/g, '')

  // evita buscar se não mudou
  if (cleanCnpj === originalClean) return

  const timeout = setTimeout(() => {
   searchByCnpj.mutate(cleanCnpj, {
    onSuccess: data => {
     setEditedUser(prev => {
      if (!prev) return prev

      return {
       ...prev,
       company: data.nome_fantasia || data.razao_social || prev.company,
       phone: data.telefone?.split('/')[0].trim() ?? prev.phone
      }
     })
    }
   })
  }, 500)

  return () => clearTimeout(timeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [editedUser?.cnpj, editedUser?.role])

 if (!user || !editedUser) return null

 function updateField<K extends keyof UserRequest>(
  field: K,
  value: UserRequest[K]
 ) {
  setEditedUser(prev => (prev ? { ...prev, [field]: value } : prev))
 }

 function updatePlanId(planId: number) {
  setEditedUser(prev => {
   if (!prev) return prev

   return {
    ...prev,
    plan: {
     id: planId,
     name: prev.plan?.name ?? '',
     monthly_credits: planId === 3 ? 0 : prev.plan?.monthly_credits ?? 0
    }
   }
  })
 }

 function updatePlanCredits(value: number) {
  setEditedUser(prev => {
   if (!prev) return prev
   if (!prev.plan) return prev

   return {
    ...prev,
    plan: {
     ...prev.plan,
     monthly_credits: value
    }
   }
  })
 }

 function handleSaveUser() {
  if (!editedUser) return

  const payload: UserRequest = {
   ...editedUser,
   plan: editedUser.role === 'admin' ? null : editedUser.plan
  }

  updateUser.mutate(payload, {
   onSuccess: () => {
    onClose()
   }
  })
 }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
     <DialogTitle className="flex items-center gap-2">
      <Edit className="h-5 w-5" />
      Editar Usuário
     </DialogTitle>
     <DialogDescription>
      Edite as informações do usuário abaixo
     </DialogDescription>
    </DialogHeader>

    {/* Formulário de edição do usuário */}
    <div className="grid gap-4 py-4">
     <div className="grid gap-2">
      <Label htmlFor="name">Nome</Label>
      <Input
       id="name"
       value={editedUser.name || ''}
       onChange={e => updateField('name', e.target.value)}
      />
     </div>

     <div className="grid gap-2">
      <Label htmlFor="email">Email</Label>
      <Input
       id="email"
       type="email"
       value={editedUser.email || ''}
       onChange={e => updateField('email', e.target.value)}
      />
     </div>

     {editedUser.role !== 'admin' && (
      <div className="grid gap-2">
       <Label htmlFor="phone">Telefone</Label>
       <IMaskInput
        type="tel"
        mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
        id="phone"
        value={editedUser.phone || ''}
        onAccept={(value: string) => updateField('phone', value)}
        className="flex h-10 w-full rounded-md border border-input dark:border-white bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
       />
      </div>
     )}

     {editedUser.role !== 'admin' && (
      <div className="grid gap-2">
       <Label htmlFor="cnpj">CNPJ</Label>
       <IMaskInput
        type="tel"
        mask="00.000.000/0000-00"
        id="cnpj"
        value={editedUser.cnpj || ''}
        onAccept={(value: string) => updateField('cnpj', value)}
        className="flex h-10 w-full rounded-md border border-input dark:border-white bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
       />
      </div>
     )}

     {editedUser.role !== 'admin' && (
      <div className="grid gap-2">
       <Label htmlFor="company">Empresa</Label>
       <Input
        id="company"
        value={editedUser.company || ''}
        onChange={e => updateField('company', e.target.value)}
       />
      </div>
     )}

     <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
       <div className="relative w-full">
        <Label htmlFor="status">Status</Label>
        <select
         id="status"
         value={editedUser.status}
         onChange={e =>
          updateField(
           'status',
           e.target.value as 'active' | 'inactive' | 'pending' | 'blocked'
          )
         }
         className="flex h-10 w-full appearance-none items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
         <option value="active">Ativo</option>
         <option value="inactive">Inativo</option>
         <option value="pending">Pendente</option>
         <option value="blocked">Bloqueado</option>
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-[70%] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
       </div>
      </div>

      <div className="grid gap-2">
       <div className="relative w-full">
        <Label htmlFor="role">Tipo</Label>
        <select
         id="role"
         value={editedUser.role}
         onChange={e => updateField('role', e.target.value as 'user' | 'admin')}
         className="flex h-10 w-full appearance-none items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
         <option value="user">Usuário</option>
         <option value="admin">Admin</option>
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-[70%] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
       </div>
      </div>
     </div>
     {editedUser.role !== 'admin' && editedUser.plan && (
      <div className="grid gap-2">
       <Label htmlFor="plan">Plano</Label>
       <div className="relative w-full">
        <select
         id="plan"
         value={editedUser.plan.id}
         onChange={e => updatePlanId(Number(e.target.value))}
         className="flex h-10 w-full appearance-none items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
         <option value={1}>Básico</option>
         <option value={2}>Avançado</option>
         <option value={3}>Custom</option>
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
       </div>
      </div>
     )}

     {editedUser.role !== 'admin' &&
      editedUser.plan &&
      editedUser.plan.id === 3 && (
       <div className="grid gap-2">
        <Label htmlFor="alvaras-limit">Limite de Alvarás</Label>
        <Input
         id="alvaras-limit"
         type="number"
         min={0}
         value={editedUser.plan.monthly_credits}
         onChange={e => updatePlanCredits(Number(e.target.value) || 0)}
        />
       </div>
      )}
    </div>

    <DialogFooter className="flex gap-2">
     <Button variant="outline" onClick={onClose}>
      Cancelar
     </Button>
     <Button onClick={handleSaveUser} disabled={updateUser.isPending}>
      {updateUser.isPending ? 'Salvando...' : 'Salvar Alterações'}
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}
