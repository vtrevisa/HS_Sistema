import { useState } from 'react'
import type { LeadRequest } from '@/http/types/leads'

import {
 Building,
 Calendar,
 DollarSign,
 Edit,
 FileText,
 Globe,
 Mail,
 MapPin,
 Phone,
 Save,
 Upload,
 User,
 UserCheck,
 UserX
} from 'lucide-react'
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { toast } from 'sonner'
import { Textarea } from '../ui/textarea'
import { useCLCB } from '@/contexts/CLCBContext'
import { useCRM } from '@/contexts/CRMContext'

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
 const [lossReason, setLossReason] = useState('')
 const [isFileUploading, setIsFileUploading] = useState(false)

 const { updateLeadStatus, archiveProposal, addActivity, addAttachment } =
  useCRM()
 const { createClienteFromLead } = useCLCB()

 if (!lead) return null

 const currentLead = editedLead || lead

 function handleEdit() {
  if (!lead?.id) return
  setEditedLead({ ...lead })
  setIsEditing(true)
 }

 function handleSave() {
  // Aqui você implementaria a lógica para salvar as alterações
  console.log('Salvando alterações:', editedLead)
  setIsEditing(false)
  setEditedLead(null)
 }

 function handleCancel() {
  setEditedLead(null)
  setIsEditing(false)
 }

 function updateField(field: string, value: string) {
  if (editedLead) {
   setEditedLead({ ...editedLead, [field]: value })
  }
 }

 function handleGanho() {
  updateLeadStatus(lead.id, 'Cliente Fechado')
  createClienteFromLead(lead)
  archiveProposal(lead.id, 'Ganho')
  addActivity(lead.id, {
   type: 'note',
   description: 'Lead marcado como GANHO - Cliente fechado com sucesso!'
  })
  toast.success('Lead convertido!', {
   description: `${lead?.empresa} foi marcado como cliente ganho.`
  })
  onClose()
 }

 function handlePerdido() {
  if (!lossReason.trim()) {
   toast.info('Motivo obrigatório', {
    description: 'Por favor, informe o motivo da perda.'
   })
   return
  }

  archiveProposal(lead.id, 'Perdido', lossReason)
  addActivity(lead.id, {
   type: 'note',
   description: `Lead marcado como PERDIDO. Motivo: ${lossReason}`
  })
  toast.error('Lead arquivado', {
   description: `${lead?.empresa} foi arquivado como perdido.`
  })
  onClose()
 }

 const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  setIsFileUploading(true)
  setTimeout(() => {
   addAttachment(lead.id, {
    name: file.name,
    url: URL.createObjectURL(file),
    type: file.type
   })

   addActivity(lead.id, {
    type: 'note',
    description: `Arquivo anexado: ${file.name}`
   })

   toast.success('Arquivo anexado', {
    description: `${file.name} foi anexado com sucesso.`
   })
   setIsFileUploading(false)
  }, 1000)
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

 //  function isVencimentoProximo(vencimento: string) {
 //   if (!vencimento) return false
 //   const hoje = new Date()
 //   const dataVencimento = new Date(vencimento)
 //   const diasAteVencimento = Math.ceil(
 //    (dataVencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24)
 //   )
 //   return diasAteVencimento <= 30
 //  }

 function getCompleteAddress() {
  const parts: string[] = []
  if (currentLead.endereco) parts.push(currentLead.endereco)
  if (currentLead.numero) parts.push(currentLead.numero)
  if (currentLead.complemento) parts.push(currentLead.complemento)
  if (currentLead.bairro) parts.push(currentLead.bairro)
  if (currentLead.municipio) parts.push(currentLead.municipio)

  return parts.join(', ')
 }

 const EditableField = ({
  label,
  value,
  field,
  type = 'text',
  icon
 }: {
  label: string
  value?: string
  field: string
  type?: string
  icon?: React.ReactNode
 }) => (
  <div>
   <span className="font-semibold text-card-foreground flex items-center gap-2">
    {icon}
    {label}:
   </span>
   {isEditing ? (
    <Input
     type={type}
     value={value || ''}
     onChange={e => updateField(field, e.target.value)}
     className="mt-2"
     placeholder={`Digite ${label.toLowerCase()}`}
    />
   ) : (
    <p className="text-muted-foreground break-words mt-1">
     {value || 'Não informado'}
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
       <span className="truncate">{currentLead.empresa}</span>
      </div>
      <div className="flex gap-2">
       {isEditing ? (
        <>
         <Button size="sm" variant="outline" onClick={handleCancel}>
          Cancelar
         </Button>
         <Button size="sm" onClick={handleSave}>
          <Save size={16} className="mr-1" />
          Salvar
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
      <Badge className={getStatusColor(currentLead.status)}>
       {currentLead.status}
      </Badge>
     </div>
     {/* Informações do Serviço */}
     <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2 text-sm sm:text-base">
       <FileText size={16} />
       Serviço
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
       <EditableField
        label="Tipo de serviço"
        value={currentLead.tipo}
        field="type"
       />
       <EditableField
        label="Número da licença"
        value={currentLead.licenca}
        field="license"
       />
       <EditableField
        label="Validade da licença"
        value={currentLead.vigencia || currentLead.vencimento}
        field="vigencia"
        type="date"
        icon={<Calendar size={14} />}
       />
       <EditableField
        label="Valor do serviço"
        value={currentLead.valor_servico || ''}
        field="valorServico"
        icon={<DollarSign size={14} />}
        type="number"
       />
       <div className="sm:col-span-2">
        <EditableField
         label="Ocupação"
         value={currentLead.ocupacao}
         field="occupation"
        />
       </div>
      </div>
     </div>

     {/* Informações da Empresa */}
     <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2 text-sm sm:text-base">
       <Building size={16} />
       Informações da Empresa
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
       <EditableField
        label="CNPJ"
        value={currentLead.cnpj || ''}
        field="cnpj"
       />
       <EditableField
        label="Website"
        value={currentLead.site || ''}
        field="website"
        type="url"
        icon={<Globe size={14} />}
       />
       <div>
        <span className="font-semibold text-card-foreground flex items-center gap-2 mb-2">
         <MapPin size={14} />
         Endereço Completo:
        </span>
        {isEditing ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          <Input
           placeholder="Endereço"
           value={editedLead?.endereco || ''}
           onChange={e => updateField('address', e.target.value)}
          />
          <Input
           placeholder="Número"
           value={editedLead?.numero || ''}
           onChange={e => updateField('numero', e.target.value)}
          />
          <Input
           placeholder="Complemento"
           value={editedLead?.complemento || ''}
           onChange={e => updateField('complemento', e.target.value)}
          />
          <Input
           placeholder="Bairro"
           value={editedLead?.bairro || ''}
           onChange={e => updateField('bairro', e.target.value)}
          />
          <Input
           placeholder="Município"
           value={editedLead?.municipio || ''}
           onChange={e => updateField('municipio', e.target.value)}
          />
          <Input
           placeholder="CEP"
           value={editedLead?.cep || ''}
           onChange={e => updateField('cep', e.target.value)}
          />
         </div>
        ) : (
         <p className="text-muted-foreground break-words bg-muted/50 p-3 rounded">
          {getCompleteAddress() || 'Não informado'}
         </p>
        )}
       </div>
      </div>
     </div>

     {/* Informações de Contato */}

     <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2 text-sm sm:text-base">
       <User size={18} />
       Informações de Contato
      </h3>
      <div className="space-y-4 text-sm">
       <EditableField
        label="Nome do Contato"
        value={currentLead.contato}
        field="contact"
       />
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
         <EditableField
          label="Telefone/WhatsApp"
          value={currentLead.whatsapp}
          field="phone"
          type="tel"
          icon={<Phone size={14} />}
         />
         {!isEditing && currentLead.whatsapp && (
          <Button
           variant="outline"
           size="sm"
           className="mt-2 w-full"
           onClick={() =>
            window.open(
             `https://wa.me/55${currentLead.whatsapp?.replace(/\D/g, '')}`,
             '_blank'
            )
           }
          >
           <Phone size={14} className="mr-2" />
           Abrir WhatsApp
          </Button>
         )}
        </div>
        <div>
         <EditableField
          label="E-mail"
          value={currentLead.email}
          field="email"
          type="email"
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

     {/* Histórico e Anexos */}
     <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2 text-sm sm:text-base">
       <FileText size={18} />
       Histórico e Anexos
      </h3>

      {/* Upload de arquivo */}
      <div className="mb-4">
       <Label
        htmlFor={`file-modal-${currentLead.id}`}
        className="cursor-pointer"
       >
        <div className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 hover:border-muted-foreground transition-colors">
         <Upload size={16} className="text-muted-foreground" />
         <span className="text-sm text-muted-foreground">
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
        onChange={handleFileUpload}
        disabled={isFileUploading}
       />
      </div>

      {/* Lista de anexos */}
      {currentLead.attachments && currentLead.attachments.length > 0 && (
       <div className="mb-4">
        <h4 className="font-medium text-card-foreground mb-2">
         Arquivos anexados:
        </h4>
        <div className="space-y-2">
         {currentLead.attachments.map(attachment => (
          <div
           key={attachment.id}
           className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
          >
           <FileText size={14} className="text-muted-foreground" />
           <span className="flex-1 truncate">{attachment.name}</span>
           <Button variant="ghost" size="sm" asChild>
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
             Abrir
            </a>
           </Button>
          </div>
         ))}
        </div>
       </div>
      )}

      {/* Histórico de atividades */}
      {currentLead.activities && currentLead.activities.length > 0 && (
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
      )}
     </div>

     {/* Lead Status */}
     {!isEditing && currentLead.status !== 'Cliente Fechado' && (
      <div className="bg-card border border-border rounded-lg p-4">
       <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2 text-sm sm:text-base">
        <UserCheck size={18} />
        Status do Lead
       </h3>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
         variant="default"
         className="bg-green-600 hover:bg-green-700 text-white"
         onClick={handleGanho}
        >
         <UserCheck size={16} className="mr-2" />
         Marcar como Ganho
        </Button>
        <Dialog>
         <DialogTrigger asChild>
          <Button variant="destructive">
           <UserX size={16} className="mr-2" />
           Marcar como Perdido
          </Button>
         </DialogTrigger>
         <DialogContent>
          <DialogHeader>
           <DialogTitle>Marcar como Perdido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
           <p className="text-sm text-muted-foreground">
            Por favor, informe o motivo da perda para{' '}
            <strong>{currentLead.empresa}</strong>:
           </p>
           <Textarea
            value={lossReason}
            onChange={e => setLossReason(e.target.value)}
            placeholder="Ex: Preço muito alto, escolheu concorrente, cancelou projeto..."
            className="min-h-[100px]"
           />
           <div className="flex gap-2 justify-end">
            <DialogTrigger asChild>
             <Button variant="outline">Cancelar</Button>
            </DialogTrigger>
            <Button variant="destructive" onClick={handlePerdido}>
             Confirmar Perda
            </Button>
           </div>
          </div>
         </DialogContent>
        </Dialog>
       </div>
      </div>
     )}
    </div>
   </DialogContent>
  </Dialog>
 )
}
