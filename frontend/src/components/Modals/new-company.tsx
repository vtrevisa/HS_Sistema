import type { UseMutationResult } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import type { CnpjResponse, CompanyRequest } from '@/http/types/companies'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { IMaskInput } from 'react-imask'
import { useEffect } from 'react'

import { cnpj as cnpjValidator } from 'cpf-cnpj-validator'
import type { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NewCompanyModalProps {
 isOpen: boolean
 onClose: () => void
 onCompanyCreate: (company: Omit<CompanyRequest, 'id'>) => void
 onSearchCnpj: UseMutationResult<CnpjResponse, AxiosError, string>
}

export function NewCompanyModal({
 isOpen,
 onClose,
 onSearchCnpj,
 onCompanyCreate
}: NewCompanyModalProps) {
 const {
  register,
  handleSubmit,
  watch,
  setValue,
  control,
  reset,
  formState: { errors, isSubmitting }
 } = useForm<Omit<CompanyRequest, 'id'>>({
  defaultValues: {
   status: '',
   company: '',
   cep: '',
   address: '',
   number: '',
   state: '',
   city: '',
   service: '',
   validity: '',
   phone: '',
   email: '',
   cnpj: ''
  }
 })

 const cep = watch('cep')
 const cnpj = watch('cnpj')

 async function searchCEP(cep: string) {
  const inputCEP = cep.replace(/\D/g, '')
  if (inputCEP.length !== 8) return

  try {
   const response = await fetch(`https://viacep.com.br/ws/${inputCEP}/json/`)
   const data = await response.json()

   if (!data.erro) {
    setValue('address', data.logradouro || '', { shouldValidate: true })
    setValue('city', data.localidade || '', { shouldValidate: true })
    setValue('state', data.uf || '', { shouldValidate: true })
    document.getElementById('number')?.focus()
   }
  } catch (error) {
   console.error('Erro ao buscar CEP:', error)
  }
 }

 async function handleSaveCompany(data: Omit<CompanyRequest, 'id'>) {
  const cleanCnpj = data.cnpj?.replace(/\D/g, '') || ''

  let enrichedData: Partial<Omit<CompanyRequest, 'id'>> = {}

  if (cleanCnpj.length === 14) {
   try {
    const cnpjResult = await onSearchCnpj.mutateAsync(cleanCnpj)

    if (cnpjResult && cnpjResult.cnpj) {
     enrichedData = {
      company: cnpjResult.nome_fantasia || data.company,
      email: cnpjResult.email || data.email,
      phone: cnpjResult.telefone || data.phone,
      status: 'enriquecido'
     }
    } else {
     enrichedData = { status: 'pendente' }
    }
   } catch (error) {
    enrichedData = { status: 'pendente' }
    toast.error('Erro ao buscar CNPJ', {
     description: `${error}`
    })
   }
  } else {
   enrichedData = { status: 'pendente' }
  }

  onCompanyCreate({ ...data, ...enrichedData })
  reset()
  onClose()
 }

 useEffect(() => {
  if (cep?.length === 9) {
   ;(async () => {
    await searchCEP(cep)
   })()
  }
 }, [cep])

 useEffect(() => {
  const cleanCnpj = cnpj?.replace(/\D/g, '') || ''
  if (cleanCnpj.length === 14 && cnpjValidator.isValid(cleanCnpj)) {
   onSearchCnpj.mutate(cleanCnpj, {
    onSuccess: data => {
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     if ((data as any)?.erro) {
      toast.error('CNPJ não encontrado')
      return
     }
     setValue('company', data.nome_fantasia || data.razao_social || '')
     setValue('email', data.email || '')
     setValue('phone', data.telefone || '')
    },
    onError: () => {
     toast.error('Erro ao consultar CNPJ')
    }
   })
  }
 }, [cnpj, setValue])

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
     <DialogTitle>Cadastro Manual de Empresa</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit(handleSaveCompany)} className="space-y-4">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        CNPJ
       </label>
       <Controller
        name="cnpj"
        control={control}
        render={({ field }) => (
         <div className="relative">
          <IMaskInput
           {...field}
           mask="00.000.000/0000-00"
           value={field.value ?? ''}
           placeholder="___.___.___/____-__"
           className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
           onAccept={(value: string) => field.onChange(value)}
          />
          {onSearchCnpj.isPending && (
           <span className="absolute right-3 top-2 text-sm text-gray-500">
            <Loader2 />
           </span>
          )}
         </div>
        )}
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Nome Comercial *
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

      <div className="md:col-span-2">
       <label className="block text-sm font-medium text-foreground mb-1">
        CEP
       </label>
       <Controller
        name="cep"
        control={control}
        render={({ field }) => (
         <IMaskInput
          {...field}
          mask="00000-000"
          placeholder="_____-___"
          value={field.value ?? ''}
          onAccept={(value: string) => field.onChange(value)}
          className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
         />
        )}
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Endereço
       </label>
       <input
        type="text"
        {...register('address')}
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Número
       </label>
       <input
        type="tel"
        {...register('number')}
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>

      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Cidade*
       </label>
       <input
        type="text"
        {...register('city', { required: 'Cidade é obrigatório' })}
        className={`w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none ${
         errors.city ? 'border-red-500' : 'border-gray-300'
        }`}
       />
       {errors.city && (
        <span className="text-red-500 text-sm">{errors.city.message}</span>
       )}
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Estado
       </label>
       <select
        {...register('state')}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
       >
        <option value="">Selecione</option>
        {[
         'SP',
         'RJ',
         'MG',
         'RS',
         'PR',
         'SC',
         'BA',
         'PE',
         'CE',
         'DF',
         'GO',
         'ES',
         'MT',
         'MS',
         'AM',
         'PA',
         'MA',
         'RN',
         'PB',
         'AL',
         'SE',
         'PI',
         'RO',
         'TO',
         'AC',
         'RR',
         'AP'
        ].map(uf => (
         <option key={uf} value={uf}>
          {uf}
         </option>
        ))}
       </select>
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Tipo de Serviço *
       </label>
       <select
        {...register('service', { required: 'Selecione o tipo' })}
        className={`w-full border bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none text-sm h-10 ${
         errors.service ? 'border-red-500' : 'border-gray-300'
        }`}
       >
        <option value="">Selecione o tipo</option>
        <option value="AVCB">AVCB</option>
        <option value="CLCB">CLCB</option>
       </select>
       {errors.service && (
        <span className="text-red-500 text-sm">{errors.service.message}</span>
       )}
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Data de Vencimento
       </label>
       <input
        type="date"
        {...register('validity')}
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300 text-sm"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Telefone
       </label>
       <Controller
        name="phone"
        control={control}
        render={({ field }) => (
         <IMaskInput
          {...field}
          mask="(00) 00000-0000"
          placeholder="(__) _____-____"
          value={field.value ?? ''}
          onAccept={(value: string) => field.onChange(value)}
          className="w-full border border-gray-300 bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
         />
        )}
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        E-mail
       </label>
       <input
        type="email"
        {...register('email')}
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>
     </div>
     <div className="flex justify-end gap-2 mt-4">
      <Button type="button" variant="outline" onClick={onClose}>
       Cancelar
      </Button>
      <Button
       type="submit"
       disabled={isSubmitting}
       className="bg-blue-600 hover:bg-blue-700 text-white"
      >
       {isSubmitting ? 'Cadastrando empresa...' : 'Cadastrar'}
      </Button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}
