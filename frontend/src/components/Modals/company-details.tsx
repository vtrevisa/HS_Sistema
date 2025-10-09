import { useEffect, useState } from 'react'
import type { CompanyRequest } from '@/http/types/companies'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import {
 Edit,
 Save,
 Building,
 Calendar,
 MapPin,
 Phone,
 Mail
} from 'lucide-react'
import { useCompany } from '@/http/use-company'
import { Loading } from '../Login/loading'

interface CompanyDetailsModalProps {
 isOpen: boolean
 onClose: () => void
 company: CompanyRequest | null
}

export function CompanyDetailsModal({
 isOpen,
 onClose,
 company
}: CompanyDetailsModalProps) {
 const [isEditing, setIsEditing] = useState(false)
 const [editedCompany, setEditedCompany] = useState<CompanyRequest | null>(null)
 const { updateCompany, searchByCnpj } = useCompany()

 const originalCnpj = company?.cnpj ?? null

 useEffect(() => {
  if (!editedCompany?.cnpj || editedCompany.cnpj === originalCnpj) return

  const timeout = setTimeout(() => {
   searchByCnpj.mutate(editedCompany.cnpj as string, {
    onSuccess: data => {
     setEditedCompany(prev => {
      if (!prev) return null
      return {
       ...prev,
       company: (data.nome_fantasia || data.razao_social) ?? prev.company,
       email: data.email ?? prev.email,
       phone: data.telefone?.split('/')[0].trim() ?? prev.phone
      }
     })
    }
   })
  }, 500)

  return () => clearTimeout(timeout)
 }, [editedCompany?.cnpj, originalCnpj])

 if (!company) return null
 const currentCompany = editedCompany || company

 function handleEdit() {
  setEditedCompany({ ...company } as CompanyRequest)
  setIsEditing(true)
 }

 function handleSave() {
  if (!editedCompany || !company) return

  const companyToSave = {
   ...editedCompany,
   status: company.status === 'pendente' ? 'enriquecido' : company.status
  }

  updateCompany.mutate(companyToSave, {
   onSuccess: () => {
    setIsEditing(false)
    setEditedCompany(null)
    onClose()
   }
  })
 }

 function handleCancel() {
  setEditedCompany(null)
  setIsEditing(false)
 }

 function updateField<K extends keyof CompanyRequest>(
  field: K,
  value: CompanyRequest[K]
 ) {
  if (!editedCompany) return

  setEditedCompany({ ...editedCompany, [field]: value })

  // Se for o campo CEP, chamar a busca
  if (field === 'cep' && typeof value === 'string') {
   searchCEP(value)
  }
 }

 function getStatusColor(status: string) {
  switch (status) {
   case 'pendente':
    return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
   case 'enriquecido':
    return 'bg-green-100 text-green-800 hover:bg-green-100'
   default:
    return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
 }

 function getServiceColor(service: string) {
  switch (service) {
   case 'CLCB':
    return 'bg-green-100 text-green-800 hover:bg-green-100'
   case 'AVCB':
    return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
   default:
    return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
 }

 function getCompleteAddress() {
  const parts: string[] = []
  if (currentCompany.address) parts.push(currentCompany.address)
  if (currentCompany.number) parts.push(currentCompany.number)
  if (currentCompany.city) parts.push(currentCompany.city)
  if (currentCompany.state) parts.push(currentCompany.state)

  const addressLine = parts.join(', ')
  return currentCompany.cep
   ? `${addressLine} - CEP: ${currentCompany.cep}`
   : addressLine
 }

 async function searchCEP(cep: string) {
  const inputCEP = cep.replace(/\D/g, '')
  if (inputCEP.length !== 8) return

  try {
   const response = await fetch(`https://viacep.com.br/ws/${inputCEP}/json/`)
   const data = await response.json()

   if (!data.erro) {
    setEditedCompany(prev =>
     prev
      ? {
         ...prev,
         address: data.logradouro || prev.address,
         city: data.localidade || prev.city,
         state: data.uf || prev.state
        }
      : prev
    )
    document.getElementById('number')?.focus()
   }
  } catch (error) {
   console.error('Erro ao buscar CEP:', error)
  }
 }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
    <DialogHeader className="pt-6">
     <DialogTitle className="flex items-center justify-between text-lg sm:text-xl">
      <div className="flex items-center gap-2">
       <Building size={20} />
       <span className="truncate max-w-80">{currentCompany.company}</span>
      </div>
      <div className="flex gap-2">
       {isEditing ? (
        <>
         <Button size="sm" variant="outline" onClick={handleCancel}>
          Cancelar
         </Button>
         <Button
          size="sm"
          onClick={handleSave}
          disabled={updateCompany.isPending}
         >
          {updateCompany.isPending ? (
           <>
            <Loading size={16} />
            Salvando...
           </>
          ) : (
           <>
            <Save size={16} className="mr-1" />
            Salvar
           </>
          )}
         </Button>
        </>
       ) : (
        <Button size="sm" variant="outline" onClick={handleEdit}>
         <Edit size={16} className="mr-1" />
         Editar
        </Button>
       )}
      </div>
     </DialogTitle>
    </DialogHeader>

    <div className="space-y-4 sm:space-y-6">
     {/* Status */}
     <div className="flex gap-2 flex-wrap">
      <Badge className={`${getStatusColor(currentCompany.status)} capitalize`}>
       {currentCompany.status}
      </Badge>
      <Badge className={`${getServiceColor(currentCompany.service)}`}>
       Serviço: {currentCompany.service}
      </Badge>
     </div>

     {/* Informações da Empresa */}
     <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
       <Building size={16} />
       Informações da Empresa
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
       {/* CNPJ */}
       <div>
        <span className="font-medium text-gray-800">CNPJ:</span>
        {isEditing ? (
         <Input
          value={editedCompany?.cnpj || ''}
          onChange={e => updateField('cnpj', e.target.value)}
          className="mt-1"
         />
        ) : (
         <p className="text-gray-600">
          {currentCompany.cnpj || 'Não informado'}
         </p>
        )}
       </div>

       {/* Nome da Empresa */}
       <div>
        <span className="font-medium text-gray-800">Razão Social:</span>
        {isEditing ? (
         <Input
          value={editedCompany?.company || ''}
          onChange={e => updateField('company', e.target.value)}
          className="mt-1"
         />
        ) : (
         <p className="text-gray-600">{currentCompany.company}</p>
        )}
       </div>

       {/* Endereço */}
       <div>
        <span className="font-medium text-gray-800 flex items-center gap-1">
         <MapPin size={12} />
         Endereço Completo:
        </span>
        {isEditing ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          <div className="col-span-2">
           <Input
            placeholder="CEP"
            value={editedCompany?.cep || ''}
            onChange={e => updateField('cep', e.target.value)}
           />
          </div>
          <Input
           placeholder="Endereço"
           value={editedCompany?.address || ''}
           onChange={e => updateField('address', e.target.value)}
          />
          <Input
           placeholder="Número"
           value={editedCompany?.number || ''}
           onChange={e => updateField('number', e.target.value)}
          />
          <Input
           placeholder="Cidade"
           value={editedCompany?.city || ''}
           onChange={e => updateField('city', e.target.value)}
          />
          <Input
           placeholder="Estado"
           value={editedCompany?.state || ''}
           onChange={e => updateField('state', e.target.value)}
          />
         </div>
        ) : (
         <p className="text-gray-600 break-words">
          {getCompleteAddress() || 'Não informado'}
         </p>
        )}
       </div>

       {/* Telefone */}
       <div>
        <span className="font-medium text-gray-800 flex items-center gap-1">
         <Phone size={12} />
         Telefone:
        </span>
        {isEditing ? (
         <Input
          type="tel"
          value={editedCompany?.phone || ''}
          onChange={e => updateField('phone', e.target.value)}
          className="mt-1"
         />
        ) : (
         <p className="text-gray-600">
          {currentCompany.phone || 'Não informado'}
         </p>
        )}
       </div>

       {/* Email */}
       <div>
        <span className="font-medium text-gray-800 flex items-center gap-1">
         <Mail size={12} />
         Email:
        </span>
        {isEditing ? (
         <Input
          type="email"
          value={editedCompany?.email || ''}
          onChange={e => updateField('email', e.target.value)}
          className="mt-1"
         />
        ) : (
         <p className="text-gray-600">
          {currentCompany.email || 'Não informado'}
         </p>
        )}
       </div>
      </div>
     </div>

     {/* Datas importantes */}
     <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
       <Calendar size={16} />
       Datas Importantes
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
       <div>
        <span className="font-medium text-gray-800">Validade:</span>
        {isEditing ? (
         <Input
          type="date"
          value={editedCompany?.validity || ''}
          onChange={e => updateField('validity', e.target.value)}
          className="mt-1"
         />
        ) : (
         <p className="text-gray-600">
          {currentCompany.validity
           ? new Date(currentCompany.validity).toLocaleDateString('pt-BR')
           : 'Não informado'}
         </p>
        )}
       </div>
      </div>
     </div>
    </div>
   </DialogContent>
  </Dialog>
 )
}
