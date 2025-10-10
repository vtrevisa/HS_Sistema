import { useEffect, useState } from 'react'
import type { LeadRequest } from '@/http/types/leads'

import {
 Building,
 Calendar,
 Edit,
 FileText,
 Mail,
 MapPin,
 Phone,
 Save,
 User
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { useLead } from '@/http/use-lead'
import { Loading } from '../Login/loading'

interface LeadDetailsModalProps {
 isOpen: boolean
 onClose: () => void
 lead: LeadRequest | null
}

export function LeadDetailsModal({
 isOpen,
 onClose,
 lead
}: LeadDetailsModalProps) {
 const [isEditing, setIsEditing] = useState(false)
 const [editedLead, setEditedLead] = useState<LeadRequest | null>(null)

 const { updateLead } = useLead()

 useEffect(() => {
  if (lead) setEditedLead({ ...lead })
 }, [lead])

 if (!lead) return null

 const currentLead = editedLead || lead

 const formatedPhone = currentLead.phone
  ? currentLead.phone.replace(/\D/g, '')
  : ''

 function handleEdit() {
  if (!lead?.id) return
  setEditedLead({ ...lead })
  setIsEditing(true)
 }

 function handleSave() {
  if (!editedLead) return
  updateLead.mutate(editedLead, {
   onSuccess: () => {
    setIsEditing(false)
    setEditedLead(null)
    onClose()
   }
  })
 }

 function handleCancel() {
  setEditedLead(null)
  setIsEditing(false)
 }

 function updateField<K extends keyof LeadRequest>(
  field: K,
  value: LeadRequest[K]
 ) {
  if (editedLead) {
   setEditedLead({ ...editedLead, [field]: value })
  }
 }

 function getStatusColor(status: string) {
  switch (status) {
   case 'Lead':
    return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
   case 'Primeiro contato':
    return 'bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
   case 'Follow-up':
    return 'bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
   case 'Proposta enviada':
    return 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300'
   case 'Cliente fechado':
    return 'bg-green-100 text-green-800'
   case 'Arquivado':
    return 'bg-red-100 text-red-800'
   default:
    return 'bg-gray-100 text-gray-800'
  }
 }

 function isVencimentoProximo(vencimento: string) {
  if (!vencimento) return false
  const hoje = new Date()
  const dataVencimento = new Date(vencimento)
  const diasAteVencimento = Math.ceil(
   (dataVencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24)
  )
  return diasAteVencimento <= 30
 }

 function getCompleteAddress() {
  const parts: string[] = []
  if (currentLead.address) parts.push(currentLead.address)
  if (currentLead.number) parts.push(currentLead.number)
  if (currentLead.complement) parts.push(currentLead.complement)
  if (currentLead.district) parts.push(currentLead.district)
  if (currentLead.city) parts.push(currentLead.city)

  const addressLine = parts.join(', ')
  return currentLead.cep
   ? `${addressLine} - CEP: ${currentLead.cep}`
   : addressLine
 }

 const EditableField = ({
  label,
  field,
  type = 'text',
  icon
 }: {
  label: string
  field: keyof LeadRequest
  type?: string
  icon?: React.ReactNode
 }) => (
  <div>
   <span className="font-medium text-gray-800 flex items-center gap-1">
    {icon}
    {label}:
   </span>
   {isEditing ? (
    <Input
     type={type}
     value={editedLead?.[field] || ''}
     onChange={e => updateField(field, e.target.value)}
     className="mt-1"
     placeholder={`Digite ${label.toLowerCase()}`}
    />
   ) : (
    <p className="text-gray-600 break-words">
     {currentLead[field] || 'Não informado'}
    </p>
   )}
  </div>
 )

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
    <DialogHeader className="pt-6">
     <DialogTitle className="flex items-center justify-between text-lg sm:text-xl">
      <div className="flex items-center gap-2">
       <Building size={20} />
       <span className="truncate max-w-80">{currentLead.company}</span>
      </div>
      <div className="flex gap-2">
       {isEditing ? (
        <>
         <Button size="sm" variant="outline" onClick={handleCancel}>
          Cancelar
         </Button>
         <Button size="sm" onClick={handleSave} disabled={updateLead.isPending}>
          {updateLead.isPending ? (
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
     {/* Status e Serviço */}
     <div className="flex gap-2 sm:gap-3 flex-wrap">
      <Badge className={`${getStatusColor(currentLead.status)} capitalize`}>
       {currentLead.status}
      </Badge>
      <Badge variant="outline" className="bg-red-100 text-red-800">
       Serviço: {currentLead.service}
      </Badge>
     </div>
     {/* Informações do Serviço */}
     <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
       <FileText size={16} />
       Informações do Serviço
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
       <EditableField label="Serviço" field="service" />
       <EditableField label="Licença" field="license" />
       <EditableField
        label="Validade"
        field="validity"
        type="date"
        icon={<Calendar size={12} />}
       />
       <EditableField
        label="Valor do Serviço"
        field="service_value"
        type="number"
       />
       <div className="sm:col-span-2">
        <EditableField label="Ocupação" field="occupation" />
       </div>
      </div>
     </div>

     {/* Informações da Empresa */}
     <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
       <Building size={16} />
       Informações da Empresa
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
       <EditableField label="CNPJ" field="cnpj" />
       <EditableField label="Website" field="website" type="url" />
       <div>
        <span className="font-medium text-gray-800 flex items-center gap-1">
         <MapPin size={12} />
         Endereço Completo:
        </span>
        {isEditing ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          <Input
           placeholder="Endereço"
           value={editedLead?.address || ''}
           onChange={e => updateField('address', e.target.value)}
          />
          <Input
           placeholder="Número"
           value={editedLead?.number || ''}
           onChange={e => updateField('number', e.target.value)}
          />
          <Input
           placeholder="Complemento"
           value={editedLead?.complement || ''}
           onChange={e => updateField('complement', e.target.value)}
          />
          <Input
           placeholder="Bairro"
           value={editedLead?.district || ''}
           onChange={e => updateField('district', e.target.value)}
          />
          <Input
           placeholder="Município"
           value={editedLead?.city || ''}
           onChange={e => updateField('city', e.target.value)}
          />
          <Input
           placeholder="CEP"
           value={editedLead?.cep || ''}
           onChange={e => updateField('cep', e.target.value)}
          />
         </div>
        ) : (
         <p className="text-gray-600 break-words">
          {getCompleteAddress() || 'Não informado'}
         </p>
        )}
       </div>
      </div>
     </div>

     {/* Informações de Contato */}

     <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
       <User size={16} />
       Contato
      </h3>
      <div className="space-y-3 text-sm">
       <EditableField label="Nome do Contato" field="contact" />
       <EditableField
        label="Telefone/WhatsApp"
        field="phone"
        type="tel"
        icon={<Phone size={14} />}
       />
       <EditableField
        label="Email"
        field="email"
        type="email"
        icon={<Mail size={14} />}
       />
      </div>
     </div>

     {/* Datas Importantes */}
     <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
       <Calendar size={16} />
       Datas Importantes
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
       <div>
        <span className="font-medium text-gray-800">Vencimento:</span>
        {isEditing ? (
         <Input
          type="date"
          value={editedLead?.expiration_date || ''}
          onChange={e => updateField('expiration_date', e.target.value)}
          className="mt-1"
         />
        ) : (
         <p
          className={`${
           isVencimentoProximo(currentLead.expiration_date)
            ? 'text-red-600 font-semibold'
            : 'text-gray-600'
          }`}
         >
          {currentLead.expiration_date
           ? new Date(currentLead.expiration_date).toLocaleDateString('pt-BR')
           : 'Não informado'}
          {isVencimentoProximo(currentLead.expiration_date) && (
           <span className="block text-xs text-red-500">
            ⚠️ Vencimento próximo
           </span>
          )}
         </p>
        )}
       </div>
       <div>
        <span className="font-medium text-gray-800">Próxima Ação:</span>
        {isEditing ? (
         <Input
          type="date"
          value={editedLead?.next_action || ''}
          onChange={e => updateField('next_action', e.target.value)}
          className="mt-1"
         />
        ) : (
         <p className="text-gray-600">
          {currentLead.next_action
           ? new Date(currentLead.next_action).toLocaleDateString('pt-BR')
           : 'Não informado'}
         </p>
        )}
       </div>
      </div>
     </div>

     {/* Ações Rápidas */}
     {!isEditing && (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
       <button
        onClick={() =>
         window.open(`https://wa.me/55${formatedPhone}`, '_blank')
        }
        title={`${
         currentLead.phone ? `Enviar mensagem para ${currentLead.phone}` : ''
        }`}
        type="button"
        className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
       >
        <Phone size={16} />
        Abrir WhatsApp
       </button>
       <button
        onClick={() => window.open(`mailto:${currentLead.email}`, '_blank')}
        title={`${
         currentLead.email ? `Enviar email para ${currentLead.email}` : ''
        }`}
        type="button"
        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
       >
        <Mail size={16} />
        Enviar Email
       </button>
      </div>
     )}
    </div>
   </DialogContent>
  </Dialog>
 )
}
