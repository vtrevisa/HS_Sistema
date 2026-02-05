import { useEffect, useState } from 'react'
import { IMaskInput } from 'react-imask'
import type { LeadRequest } from '@/http/types/leads'
import { useProposals } from '@/http/use-proposals'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { EditableField } from './editable-field'

import { useLead } from '@/http/use-lead'
import { Loading } from '../Login/loading'
import {
 AlertTriangle,
 Building,
 Calendar,
 Clock,
 DollarSign,
 Edit,
 FileText,
 Mail,
 MapPin,
 Phone,
 Save,
 Trash2,
 Upload,
 User
} from 'lucide-react'
import { getCompleteAddress, getStatusColor } from '@/services/leads'
import { ProposalsActions } from './proposals-actions'
import { Label } from '../ui/label'

type Attachment = { id?: number; name: string; url: string }

type LeadWithExtras = LeadRequest & {
 daysInStage?: number
 isOverdue?: boolean
 attachments?: Attachment[]
}

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
 const [editedLead, setEditedLead] = useState<LeadWithExtras | null>(null)
 const [isFileUploading, setIsFileUploading] = useState(false)
 const { updateLead, deleteLeadAttachment } = useLead()
 const { saveProposal } = useProposals({})

 useEffect(() => {
  if (lead) setEditedLead({ ...lead })
 }, [lead])

 if (!lead) return null

 const currentLead: LeadWithExtras = editedLead || { ...lead, attachments: [] }

 const formatedPhone = currentLead.phone?.replace(/\D/g, '')

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

 function handleGanho() {
  saveProposal.mutate(
   {
    lead_id: currentLead.id,
    status: 'Ganho',
    company: currentLead.company,
    type: currentLead.service,
    value: Number(currentLead.service_value)
   },
   {
    onSuccess: () => {
     setEditedLead(prev =>
      prev ? { ...prev, status: 'Cliente fechado' } : prev
     )
     onClose()
    }
   }
  )
 }

 function handlePerdido(reason: string) {
  saveProposal.mutate(
   {
    lead_id: currentLead.id,
    status: 'Perdido',
    company: currentLead.company,
    type: currentLead.service,
    value: Number(currentLead.service_value),
    reason
   },
   {
    onSuccess: () => {
     setEditedLead(prev =>
      prev ? { ...prev, status: 'Cliente fechado' } : prev
     )
     onClose()
    }
   }
  )
 }

 function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
  if (!event.target.files || !editedLead) return

  const files = Array.from(event.target.files)
  if (files.length === 0) return

  setIsFileUploading(true)

  const formData = new FormData()
  files.forEach(file => formData.append('attachments[]', file))

  updateLead.mutate(
   { id: editedLead.id, attachmentsFilesFormData: formData },
   {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (updatedLead: any) => {
     const leadData = updatedLead.lead ?? updatedLead
     const updatedAttachments =
      leadData.attachments ?? updatedLead.attachments ?? []

     setEditedLead(prev =>
      prev
       ? {
          ...prev,
          attachments: updatedAttachments
         }
       : null
     )

     event.target.value = ''
     setIsFileUploading(false)
    },
    onSettled: () => setIsFileUploading(false)
   }
  )
 }

 async function handleRemoveAttachment(index: number) {
  if (!editedLead || !editedLead.id) return
  if (!confirm('Deseja remover este arquivo?')) return

  deleteLeadAttachment.mutate(
   { leadId: editedLead.id, index },
   {
    onSuccess: updatedLead => {
     setEditedLead(prev =>
      prev ? { ...prev, attachments: updatedLead.attachments } : null
     )
    }
   }
  )
 }

 function updateField<K extends keyof LeadRequest>(
  field: K,
  value: string | number | undefined
 ) {
  if (field === 'service_value') {
   setEditedLead(prev => (prev ? { ...prev, [field]: Number(value) } : null))
  } else {
   setEditedLead(prev => (prev ? { ...prev, [field]: value } : null))
  }
 }

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
         <Button
          size="sm"
          variant="outline"
          className="dark:hover:bg-red-600 dark:hover:border-red-600"
          onClick={() => setIsEditing(false)}
         >
          Cancelar
         </Button>
         <Button size="sm" onClick={handleSave} disabled={updateLead.isPending}>
          {updateLead.isPending ? (
           <Loading size={16} />
          ) : (
           <Save size={16} className="mr-1" />
          )}
          Salvar
         </Button>
        </>
       ) : (
        <Button
         size="sm"
         variant="outline"
         className="dark:hover:bg-red-600 dark:hover:border-red-600"
         onClick={() => setIsEditing(true)}
        >
         <Edit size={16} className="mr-1" />
         Editar
        </Button>
       )}
      </div>
     </DialogTitle>
    </DialogHeader>

    {/* Proposals Actions */}
    <ProposalsActions
     isEditing={isEditing}
     currentLead={{
      ...currentLead,
      company: currentLead.company || '',
      status: currentLead.status || 'Lead'
     }}
     handleGanho={handleGanho}
     handlePerdido={handlePerdido}
    />

    <div className="space-y-4 sm:space-y-6">
     {/* Status e Serviço */}
     <div className="flex gap-2 sm:gap-3 flex-wrap">
      <Badge className={`${getStatusColor(currentLead.status)} capitalize`}>
       {currentLead.status}
      </Badge>
      {currentLead.isOverdue && (
       <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle size={12} />
        Prazo vencido
       </Badge>
      )}
      {(currentLead.daysInStage ?? 0) > 0 && (
       <Badge variant="outline" className="flex items-center gap-1">
        <Clock size={12} />
        {currentLead.daysInStage} dias no estágio
       </Badge>
      )}
     </div>

     {/* Informações do Serviço */}

     <div className="bg-card border border-border dark:border-white p-3 sm:p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
       <FileText size={16} />
       Informações do Serviço
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
       <EditableField
        label="Tipo de serviço"
        field="service"
        value={currentLead.service}
        isEditing={isEditing}
        onChange={updateField}
       />
       <EditableField
        label="Número da licença"
        field="license"
        value={currentLead.license}
        displayValue={`${currentLead.service}-${currentLead.license}`}
        isEditing={isEditing}
        onChange={updateField}
       />
       <EditableField
        label="Validade da licença"
        field="validity"
        value={currentLead.validity}
        type="date"
        isEditing={isEditing}
        onChange={updateField}
        icon={<Calendar size={12} />}
       />
       <EditableField
        label="Valor do Serviço"
        field="service_value"
        value={currentLead.service_value}
        isEditing={isEditing}
        onChange={updateField}
        icon={<DollarSign size={14} />}
       />
       <EditableField
        label="Ocupação"
        field="occupation"
        value={currentLead.occupation}
        isEditing={isEditing}
        onChange={updateField}
       />
      </div>
     </div>

     {/* Informações da Empresa */}

     <div className="bg-card border border-border dark:border-white p-3 sm:p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
       <Building size={16} />
       Informações da Empresa
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
       <EditableField
        label="CNPJ"
        field="cnpj"
        value={currentLead.cnpj}
        isEditing={isEditing}
        onChange={updateField}
       />
       <EditableField
        label="Empresa"
        field="company"
        value={currentLead.company}
        isEditing={isEditing}
        onChange={updateField}
       />

       <EditableField
        label="Website"
        field="website"
        value={currentLead.website}
        type="url"
        isEditing={isEditing}
        onChange={updateField}
       />
       <div>
        <span className="font-medium text-gray-800 dark:text-white flex items-center gap-1">
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
          <IMaskInput
           mask="00000-000"
           value={editedLead?.cep || ''}
           onAccept={(value: string) => updateField('cep', value)}
           className="mt-1 flex h-10 w-full rounded-md border border-input dark:border-white bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
         </div>
        ) : (
         <p className="text-gray-600 dark:text-white break-words bg-muted/50 p-3 rounded">
          {getCompleteAddress(currentLead) || 'Não informado'}
         </p>
        )}
       </div>
      </div>
     </div>

     {/* Informações de Contato */}

     <div className="bg-card border border-border dark:border-white p-3 sm:p-4 rounded-lg">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
       <User size={16} />
       Informações de Contato
      </h3>
      <div className="space-y-4 text-sm">
       <EditableField
        label="Nome do Contato"
        field="contact"
        value={currentLead.contact}
        isEditing={isEditing}
        onChange={updateField}
       />
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
         <EditableField
          label="Telefone / WhatsApp"
          field="phone"
          value={currentLead.phone}
          type="tel"
          isEditing={isEditing}
          onChange={updateField}
          icon={<Phone size={14} />}
         />
         {!isEditing && currentLead.phone && (
          <Button
           variant="outline"
           size="sm"
           className="mt-2 w-full"
           onClick={() =>
            window.open(`https://wa.me/55${formatedPhone}`, '_blank')
           }
          >
           <Phone size={14} className="mr-2" />
           Abrir WhatsApp
          </Button>
         )}
        </div>
        <div>
         <EditableField
          label="Email"
          field="email"
          value={currentLead.email}
          type="email"
          isEditing={isEditing}
          onChange={updateField}
          icon={<Mail size={14} />}
         />
         {!isEditing && currentLead.email && (
          <Button
           variant="outline"
           size="sm"
           className="mt-2 w-full"
           onClick={() => window.open(`mailto:${currentLead.email}`, '_blank')}
          >
           <Mail size={14} className="mr-2" />
           Enviar E-mail
          </Button>
         )}
        </div>
       </div>
      </div>
     </div>

     {/* Informações de anexo */}

     {/* Lista de anexos */}
     {currentLead.attachments && currentLead.attachments.length > 0 && (
      <div className="mb-4">
       <h4 className="font-medium text-card-foreground mb-2">
        Arquivos anexados:
       </h4>
       <div className="space-y-2">
        {currentLead.attachments.map((attachment, index) => (
         <div
          key={attachment.id || index}
          className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
         >
          <FileText
           size={14}
           className="text-muted-foreground dark:text-white"
          />
          <span className="flex-1 truncate">{attachment.name}</span>
          <Button variant="ghost" size="sm" asChild>
           <a href={attachment.url} target="_blank" rel="noopener noreferrer">
            Abrir
           </a>
          </Button>
          {isEditing && (
           <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRemoveAttachment(index)}
            disabled={deleteLeadAttachment.isPending}
           >
            <Trash2 size={14} />
           </Button>
          )}
         </div>
        ))}
       </div>
      </div>
     )}

     {/* Upload de arquivo */}
     {isEditing && (
      <div className="bg-card border border-border dark:border-white p-3 sm:p-4 rounded-lg">
       <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
        <FileText size={16} />
        Adicionar novos anexos
       </h3>
       <div className="mb-4">
        <Label
         htmlFor={`file-modal-${currentLead.id}`}
         className="cursor-pointer"
        >
         <div className="flex items-center justify-center gap-2 border-2 border-dashed border-border dark:border-white rounded-lg p-4 hover:border-muted-foreground transition-colors">
          <Upload size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground dark:text-white">
           {isFileUploading
            ? 'Enviando arquivo...'
            : 'Anexar arquivo (PDF, DOC, etc.)'}
          </span>
         </div>
        </Label>
        <Input
         id={`file-modal-${currentLead.id}`}
         type="file"
         accept=".pdf,.doc,.docx"
         className="hidden"
         multiple
         onChange={handleFileUpload}
         disabled={isFileUploading}
        />
       </div>
      </div>
     )}

     {/* Histórico de atividades */}
     {/* {currentLead.activities && currentLead.activities.length > 0 && (
      <div>
       <h4 className="font-medium text-card-foreground mb-2">
        Histórico de alterações:
       </h4>
       <div className="space-y-2 max-h-40 overflow-y-auto">
        {currentLead.activities
         .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
         )
         .map(activity => (
          <div key={activity.id} className="p-2 bg-muted/50 rounded text-sm">
           <div className="flex justify-between items-start mb-1">
            <span className="font-medium capitalize">{activity.type}</span>
            <span className="text-xs text-muted-foreground">
             {new Date(activity.date).toLocaleString('pt-BR')}
            </span>
           </div>
           <p className="text-muted-foreground">{activity.description}</p>
          </div>
         ))}
       </div>
      </div>
     )} */}
    </div>
   </DialogContent>
  </Dialog>
 )
}
