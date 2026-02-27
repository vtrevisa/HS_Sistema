import { useEffect, useRef, useState } from 'react'
import {
 Building,
 Calendar,
 Camera,
 CreditCard,
 Edit,
 Mail,
 MapPin,
 Phone,
 Save,
 User,
 X
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
import type { UserRequest } from '@/http/types/user'
import { useUser } from '@/http/use-user'
import { useCompany } from '@/http/use-company'
import { api } from '@/lib/api'

interface ProfileDataProps {
 user: UserRequest
}

//const BASE_URL = 'http://localhost:8000'

const BASE_URL = import.meta.env.VITE_PROFILE_URL || ''

export function ProfileData({ user }: ProfileDataProps) {
 const fileInputRef = useRef<HTMLInputElement>(null)
 const [selectedFile, setSelectedFile] = useState<File | null>(null)
 const [previewUrl, setPreviewUrl] = useState<string | null>(
  user.avatar_url ?? null
 )
 const [isUploading, setIsUploading] = useState(false)

 const [isEditing, setIsEditing] = useState(false)

 const [userData, setUserData] = useState(() => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(user as any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  avatar_url: (user as any)?.avatar_url ?? null
 }))
 const [cepData, setCepData] = useState({
  street: '',
  district: '',
  city: '',
  state: ''
 })

 const { updateUser } = useUser()
 const { searchByCnpj } = useCompany()

 const originalCnpj = user?.cnpj ?? null

 useEffect(() => {
  if (selectedFile) return // mantém preview de upload
  if (userData.avatar_url) {
   setPreviewUrl(`${BASE_URL}${userData.avatar_url}`)
  } else {
   setPreviewUrl(null)
  }
 }, [userData.avatar_url, selectedFile])

 useEffect(() => {
  if (isEditing) return

  setUserData(prev => ({
   ...prev,
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   ...(user as any),
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   avatar_url: (user as any)?.avatar_url ?? prev.avatar_url ?? null
  }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!previewUrl) setPreviewUrl((user as any)?.avatar_url ?? null)
 }, [user, isEditing])

 useEffect(() => {
  if (!isEditing) return

  const cnpj = userData?.cnpj
  if (!cnpj) return

  const cleanCnpj = cnpj.replace(/\D/g, '')

  // Só busca quando tiver 14 dígitos
  if (cleanCnpj.length !== 14) return

  const originalClean = originalCnpj?.replace(/\D/g, '')

  // Evita buscar se o CNPJ não mudou
  if (cleanCnpj === originalClean) return

  const timeout = setTimeout(() => {
   searchByCnpj.mutate(cleanCnpj, {
    onSuccess: data => {
     setUserData(prev => ({
      ...prev,
      company: data.nome_fantasia || data.razao_social || prev.company,
      phone: data.telefone?.split('/')[0].trim() ?? prev.phone
     }))
    }
   })
  }, 500)

  return () => clearTimeout(timeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [userData?.cnpj, isEditing])

 useEffect(() => {
  return () => {
   if (previewUrl && previewUrl.startsWith('blob:'))
    URL.revokeObjectURL(previewUrl)
  }
 }, [previewUrl])

 function handleSaveProfile() {
  if (!userData) return
  setIsEditing(false)

  updateUser.mutate(userData, {
   onSuccess: () => {
    setIsEditing(false)
   }
  })
 }

 function updateField<K extends keyof ProfileRequest>(
  field: K,
  value: string | number | undefined
 ) {
  setUserData(prev => ({ ...prev, [field]: value }))

  // Se for o campo CEP, chamar a busca
  if (isEditing && field === 'cep') {
   searchCEP(value)
  }
 }

 async function searchCEP(cep: string | number | undefined) {
  if (!isEditing) return

  const cleanCEP = String(cep ?? '').replace(/\D/g, '')
  if (cleanCEP.length !== 8) return

  try {
   const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
   const data = await response.json()

   if (!data.erro) {
    setCepData({
     street: data.logradouro || '',
     district: data.bairro || '',
     city: data.localidade || '',
     state: data.uf || ''
    })
   }
  } catch (error) {
   console.error('Erro ao buscar CEP:', error)
  }
 }

 useEffect(() => {
  if (!isEditing) return

  if (
   cepData.street &&
   cepData.district &&
   cepData.city &&
   cepData.state &&
   userData.number
  ) {
   const formattedAddress = `${cepData.street}, ${userData.number}, ${cepData.district}, ${cepData.city} - ${cepData.state}`

   setUserData(prev => ({
    ...prev,
    address: formattedAddress
   }))
  }
 }, [cepData, userData.number, isEditing])

 function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]

  if (!file) return
  if (!file.type.startsWith('image/')) {
   alert('Selecione uma imagem (PNG/JPG/GIF).')
   return
  }

  if (file.size > 5 * 1024 * 1024) {
   alert('A imagem deve ser menor que 5MB.')
   return
  }

  if (previewUrl && previewUrl.startsWith('blob:')) {
   URL.revokeObjectURL(previewUrl)
  }

  setSelectedFile(file)
  setPreviewUrl(URL.createObjectURL(file))

  console.log('Arquivo selecionado:', file)
  console.log('URL de visualização:', URL.createObjectURL(file))
  console.log('Estado atualizado: ', previewUrl)
 }

 function handleCancelAvatar() {
  if (previewUrl && previewUrl.startsWith('blob:')) {
   URL.revokeObjectURL(previewUrl)
  }
  setSelectedFile(null)
  setPreviewUrl(user.avatar_url ?? null)
  if (fileInputRef.current) {
   fileInputRef.current.value = ''
  }
 }

 async function handleUploadAvatar() {
  if (!selectedFile) return
  setIsUploading(true)

  try {
   const form = new FormData()
   form.append('avatar', selectedFile)
   const { data } = await api.post('user/avatar', form)

   if (!data.status)
    throw new Error(data.message || 'Erro desconhecido ao enviar imagem')

   const newAvatar = data.avatar_url ?? null

   setUserData(prev => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = { ...(prev as any), avatar_url: newAvatar }
    console.log('Updated userData:', updated)
    return updated
   })

   setSelectedFile(null)
   setPreviewUrl(newAvatar)

   if (fileInputRef.current) fileInputRef.current.value = ''
  } catch (err) {
   console.error(err)
   alert('Erro ao enviar imagem')
  } finally {
   console.log('Data: ', userData)
   setIsUploading(false)
  }
 }

 return (
  <Card className="lg:col-span-2">
   <CardHeader>
    <div className="flex flex-col-reverse items-start gap-6 lg:flex-row lg:items-center justify-between">
     <div className="flex items-center gap-3">
      <div className="relative">
       {previewUrl ? (
        <img
         src={previewUrl}
         alt="Avatar"
         className="h-12 w-12 rounded-full object-cover bg-primary/10"
         onError={e => {
          e.currentTarget.style.display = 'none'
         }}
        />
       ) : (
        <User className="h-12 w-12 rounded-full text-primary bg-primary/10 p-2" />
       )}
       <button
        type="button"
        className="absolute -right-1 -bottom-1 rounded-full bg-white p-1 shadow"
        aria-label="Trocar Foto"
        onClick={() => fileInputRef.current?.click()}
       >
        <Camera className="h-4 w-4" />
       </button>

       <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
       />
      </div>
      <div>
       <CardTitle>Dados Pessoais</CardTitle>
       <CardDescription>Suas informações de cadastro</CardDescription>
      </div>
     </div>
     {selectedFile && (
      <div className="flex gap-2 self-end lg:self-start">
       <Button
        size="sm"
        variant="ghost"
        onClick={handleCancelAvatar}
        disabled={isUploading}
       >
        <X size={14} className="mr-1" /> Cancelar Foto
       </Button>
       <Button size="sm" onClick={handleUploadAvatar} disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Salvar Foto'}
       </Button>
      </div>
     )}
     {isEditing ? (
      <div className="flex gap-2 self-end lg:self-start">
       <Button
        size="sm"
        variant="outline"
        className="dark:hover:bg-red-600 dark:hover:border-red-600"
        onClick={() => {
         setUserData(user)
         setCepData({
          street: '',
          district: '',
          city: '',
          state: ''
         })
         setIsEditing(false)
        }}
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
       disabled={true}
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
     {isEditing && (
      <>
       <div className="space-y-2">
        <ProfileField
         label="CEP"
         field="cep"
         value={userData.cep}
         type="text"
         isEditing={isEditing}
         onChange={updateField}
         icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
       </div>
       <div className="space-y-2">
        <ProfileField
         label="Número"
         field="number"
         value={userData.number}
         type="text"
         isEditing={isEditing}
         onChange={updateField}
         icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
       </div>
      </>
     )}
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
