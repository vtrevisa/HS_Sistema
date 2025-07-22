import { useState } from 'react'
import type { Lead } from '@/http/types/leads'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Calendar } from 'lucide-react'

interface NewLeadModalProps {
 isOpen: boolean
 onClose: () => void
 onLeadCreate: (lead: Omit<Lead, 'id'>) => void
}

export function NewLeadModal({
 isOpen,
 onClose,
 onLeadCreate
}: NewLeadModalProps) {
 const [formData, setFormData] = useState({
  company: '',
  type: 'AVCB',
  license: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  cep: '',
  occupation: '',
  status: 'Lead',
  vencimento: '',
  nextAction: '',
  website: '',
  cnpj: ''
 })

 function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  if (!formData.company || !formData.contact || !formData.vencimento) {
   alert('Preencha os campos obrigatórios: Empresa, Contato e Vencimento')
   return
  }

  onLeadCreate(formData)
  setFormData({
   company: '',
   type: 'AVCB',
   license: '',
   contact: '',
   phone: '',
   email: '',
   address: '',
   cep: '',
   occupation: '',
   status: 'Lead',
   vencimento: '',
   nextAction: '',
   website: '',
   cnpj: ''
  })
  onClose()
 }

 function handleChange(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
 ) {
  setFormData(prev => ({
   ...prev,
   [e.target.name]: e.target.value
  }))
 }

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
     <DialogTitle>Novo Lead</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-4">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Empresa *
       </label>
       <input
        type="text"
        name="company"
        value={formData.company}
        onChange={handleChange}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
        required
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        CNPJ
       </label>
       <input
        type="text"
        name="cnpj"
        value={formData.cnpj}
        onChange={handleChange}
        placeholder="00.000.000/0000-00"
        className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Tipo
       </label>
       <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       >
        <option value="AVCB">AVCB</option>
        <option value="CLCB">CLCB</option>
        <option value="Laudo Técnico">Laudo Técnico</option>
       </select>
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Licença
       </label>
       <input
        type="text"
        name="license"
        value={formData.license}
        onChange={handleChange}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Contato *
       </label>
       <input
        type="text"
        name="contact"
        value={formData.contact}
        onChange={handleChange}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
        required
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        WhatsApp
       </label>
       <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Email
       </label>
       <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Website
       </label>
       <input
        type="url"
        name="website"
        value={formData.website}
        onChange={handleChange}
        placeholder="www.empresa.com.br"
        className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        CEP
       </label>
       <input
        type="text"
        name="cep"
        value={formData.cep}
        onChange={handleChange}
        placeholder="00000-000"
        className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Endereço
       </label>
       <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Ocupação
       </label>
       <input
        type="text"
        name="occupation"
        value={formData.occupation}
        onChange={handleChange}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Status
       </label>
       <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none"
       >
        <option value="Lead">Lead</option>
        <option value="Primeiro Contato">Primeiro Contato</option>
        <option value="Follow-up">Follow-up</option>
        <option value="Proposta Enviada">Proposta Enviada</option>
        <option value="Cliente Fechado">Cliente Fechado</option>
        <option value="Arquivado">Arquivado</option>
       </select>
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Vencimento *
       </label>
       <div className="relative">
        <input
         type="date"
         name="vencimento"
         value={formData.vencimento}
         onChange={handleChange}
         className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
         required
        />
        <Calendar className="absolute right-3 top-3 h-4 w-4 text-foreground pointer-events-none" />
       </div>
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Próxima Ação
       </label>
       <div className="relative">
        <input
         type="date"
         name="nextAction"
         value={formData.nextAction}
         onChange={handleChange}
         className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <Calendar className="absolute right-3 top-3 h-4 w-4 text-foreground pointer-events-none" />
       </div>
      </div>
     </div>

     <div className="flex gap-3 pt-4">
      <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
       Criar Lead
      </Button>
      <Button type="button" variant="outline" onClick={onClose}>
       Cancelar
      </Button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}
