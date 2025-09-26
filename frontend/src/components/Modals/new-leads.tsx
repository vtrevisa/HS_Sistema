/* eslint-disable react-hooks/exhaustive-deps */
import { useForm, Controller } from 'react-hook-form'
import type { LeadRequest } from '@/http/types/leads'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Calendar } from 'lucide-react'
import { IMaskInput } from 'react-imask'
import { useEffect } from 'react'

interface NewLeadModalProps {
 isOpen: boolean
 onClose: () => void
 onLeadCreate: (lead: Omit<LeadRequest, 'id'>) => void
}

export function NewLeadModal({
 isOpen,
 onClose,
 onLeadCreate
}: NewLeadModalProps) {
 const {
  register,
  handleSubmit,
  watch,
  setValue,
  control,
  reset,
  formState: { errors, isSubmitting }
 } = useForm<Omit<LeadRequest, 'id'>>({
  defaultValues: {
   company: '',
   service: 'AVCB',
   license: '',
   contact: '',
   phone: '',
   email: '',
   cep: '',
   address: '',
   number: '',
   district: '',
   city: '',
   occupation: '',
   status: 'Lead',
   validity: '',
   expiration_date: '',
   next_action: '',
   website: '',
   cnpj: ''
  }
 })

 async function searchCEP(cep: string) {
  const inputCEP = cep.replace(/\D/g, '')
  if (inputCEP.length !== 8) return

  try {
   const response = await fetch(`https://viacep.com.br/ws/${inputCEP}/json/`)
   const data = await response.json()

   if (!data.erro) {
    setValue('address', data.logradouro || '')
    setValue('district', data.bairro || '')
    setValue('city', data.localidade || '')
   }
  } catch (error) {
   console.error('Erro ao buscar CEP:', error)
  }
 }

 const vencimento = watch('expiration_date')
 const cep = watch('cep')

 async function handleSaveLead(data: Omit<LeadRequest, 'id'>) {
  onLeadCreate(data)

  await new Promise(resolve => setTimeout(resolve, 1500))
  reset()
  onClose()
 }

 useEffect(() => {
  setValue('validity', vencimento)
 }, [vencimento, setValue])

 useEffect(() => {
  if (cep?.length === 9) {
   ;(async () => {
    await searchCEP(cep)
   })()
  }
 }, [cep])

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
     <DialogTitle>Novo Lead</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit(handleSaveLead)} className="space-y-4">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Empresa *
       </label>
       <input
        type="text"
        {...register('company', { required: 'Empresa é obrigatório' })}
        className={`w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none ${
         errors.company ? 'border-red-500' : 'border-gray-300'
        }`}
       />
       {errors.company && (
        <span className="text-red-500 text-sm">{errors.company.message}</span>
       )}
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        CNPJ
       </label>

       <Controller
        control={control}
        name="cnpj"
        render={({ field }) => (
         <IMaskInput
          {...field}
          mask="00.000.000/0000-00"
          placeholder="00.000.000/0000-00"
          className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
         />
        )}
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Tipo
       </label>
       <select
        {...register('service')}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
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
        {...register('license')}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Contato *
       </label>
       <input
        type="text"
        {...register('contact', { required: 'Contato é obrigatório' })}
        className={`w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none ${
         errors.contact ? 'border-red-500' : 'border-gray-300'
        }`}
       />
       {errors.contact && (
        <span className="text-red-500 text-sm">{errors.contact.message}</span>
       )}
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        WhatsApp
       </label>

       <Controller
        control={control}
        name="phone"
        render={({ field }) => (
         <IMaskInput
          {...field}
          mask="(00) 00000-0000"
          placeholder="(11) 99999-9999"
          className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
         />
        )}
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Email
       </label>
       <input
        type="email"
        {...register('email')}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Website
       </label>
       <input
        type="url"
        {...register('website')}
        placeholder="www.empresa.com.br"
        className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
        onBlur={e => {
         if (
          e.target.value &&
          !e.target.value.startsWith('http://') &&
          !e.target.value.startsWith('https://')
         ) {
          e.target.value = `http://${e.target.value}`
         }
        }}
       />
      </div>

      <div className="md:col-span-2">
       <label className="block text-sm font-medium text-foreground mb-1">
        CEP
       </label>

       <Controller
        control={control}
        name="cep"
        render={({ field }) => (
         <IMaskInput
          {...field}
          mask="00000-000"
          placeholder="00000-000"
          className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
         />
        )}
       />
      </div>

      <div className="hidden">
       <input {...register('district')} placeholder="Bairro" />
       <input {...register('city')} placeholder="Município" />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Endereço
       </label>
       <input
        type="text"
        {...register('address')}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Número
       </label>
       <input
        type="tel"
        {...register('number')}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Ocupação
       </label>
       <input
        type="text"
        {...register('occupation')}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Status
       </label>
       <select
        {...register('status')}
        className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
       >
        <option value="Lead">Lead</option>
        <option value="Primeiro contato">Primeiro Contato</option>
        <option value="Follow-up">Follow-up</option>
        <option value="Proposta enviada">Proposta Enviada</option>
        <option value="Cliente fechado">Cliente Fechado</option>
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
         {...register('expiration_date', {
          required: 'Vencimento é obrigatório'
         })}
         className={`w-full border bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
          errors.expiration_date ? 'border-red-500' : 'border-gray-300'
         }`}
        />
        <Calendar className="absolute right-3 top-3 h-4 w-4 text-foreground pointer-events-none" />
       </div>
       {errors.expiration_date && (
        <span className="text-red-500 text-sm">
         {errors.expiration_date.message}
        </span>
       )}
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Próxima Ação
       </label>
       <div className="relative">
        <input
         type="date"
         {...register('next_action')}
         className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <Calendar className="absolute right-3 top-3 h-4 w-4 text-foreground pointer-events-none" />
       </div>
      </div>
     </div>

     <div className="flex gap-3 pt-4">
      <Button
       type="submit"
       className="bg-red-600 hover:bg-red-700 text-white"
       disabled={isSubmitting}
      >
       {isSubmitting ? 'Criando Lead...' : 'Criar Lead'}
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
