import { useState } from 'react'
import {
 Building,
 Calendar,
 CreditCard,
 Edit,
 Mail,
 MapPin,
 Phone,
 Save,
 User
} from 'lucide-react'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from '../ui/card'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { ProfileField, type ProfileRequest } from './profile-field'
import type { UserProfile } from '@/http/types/user'

interface ProfileDataProps {
 user: UserProfile
}

// const mockUserData = {
//  id: '1',
//  name: 'João Silva',
//  email: 'joao.silva@empresa.com',
//  phone: '(11) 99999-9999',
//  company: 'AVCB Certo Consultoria',
//  cnpj: '12.345.678/0001-90',
//  address: 'Av. Paulista, 1000 - São Paulo, SP',
//  createdAt: '2024-01-15'
// }

export function ProfileData({ user }: ProfileDataProps) {
 const [isEditing, setIsEditing] = useState(false)
 const [userData, setUserData] = useState(user)

 function handleSaveProfile() {
  if (!userData) return
  setIsEditing(false)
  //onClose()
 }

 function updateField<K extends keyof ProfileRequest>(
  field: K,
  value: string | number | undefined
 ) {
  setUserData(prev => ({ ...prev, [field]: value }))
 }

 return (
  <Card className="lg:col-span-2">
   <CardHeader>
    <div className="flex flex-col-reverse items-start gap-6 lg:flex-row lg:items-center justify-between">
     <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
       <User className="h-6 w-6 text-primary" />
      </div>
      <div>
       <CardTitle>Dados Pessoais</CardTitle>
       <CardDescription>Suas informações de cadastro</CardDescription>
      </div>
     </div>
     {isEditing ? (
      <div className="flex gap-2 self-end lg:self-start">
       <Button
        size="sm"
        variant="outline"
        className="dark:hover:bg-red-600 dark:hover:border-red-600"
        onClick={() => setIsEditing(false)}
       >
        Cancelar
       </Button>
       <Button size="sm" onClick={handleSaveProfile}>
        <Save size={16} className="mr-1" />
        Salvar
       </Button>
      </div>
     ) : (
      <Button
       size="sm"
       variant="outline"
       className="dark:hover:bg-red-600 dark:hover:border-red-600 self-end lg:self-start"
       onClick={() => setIsEditing(true)}
      >
       <Edit size={16} className="mr-1" />
       Editar
      </Button>
     )}
    </div>
   </CardHeader>
   <CardContent className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
     <div className="space-y-2">
      <ProfileField
       label="Nome Completo"
       field="name"
       value={userData.name}
       type="text"
       isEditing={isEditing}
       onChange={updateField}
       icon={<User className="h-4 w-4 text-muted-foreground" />}
      />
     </div>
     <div className="space-y-2">
      <ProfileField
       label="E-mail"
       field="email"
       value={userData.email}
       type="email"
       isEditing={isEditing}
       onChange={updateField}
       icon={<Mail className="h-4 w-4 text-muted-foreground" />}
      />
     </div>
     <div className="space-y-2">
      <ProfileField
       label="CNPJ"
       field="cnpj"
       value={userData.cnpj}
       type="text"
       isEditing={isEditing}
       onChange={updateField}
       icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
      />
     </div>
     <div className="space-y-2">
      <ProfileField
       label="Empresa"
       field="company"
       value={userData.company}
       type="text"
       isEditing={isEditing}
       onChange={updateField}
       icon={<Building className="h-4 w-4 text-muted-foreground" />}
      />
     </div>
     <div className="space-y-2">
      <ProfileField
       label="Telefone"
       field="phone"
       value={userData.phone}
       type="text"
       isEditing={isEditing}
       onChange={updateField}
       icon={<Phone className="h-4 w-4 text-muted-foreground" />}
      />
     </div>
     <div className="space-y-2">
      <ProfileField
       label="Endereço"
       field="address"
       value={userData.address}
       type="text"
       isEditing={isEditing}
       onChange={updateField}
       icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
      />
     </div>
    </div>

    <Separator />

    <div className="flex items-center gap-2 text-sm text-muted-foreground">
     <Calendar className="h-4 w-4" />
     <span>
      Membro desde: {new Date(userData.created_at).toLocaleDateString('pt-BR')}
     </span>
    </div>
   </CardContent>
  </Card>
 )
}
