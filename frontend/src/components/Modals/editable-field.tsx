import type { LeadRequest } from '@/http/types/leads'
import { Input } from '../ui/input'
import { IMaskInput } from 'react-imask'

interface EditableFieldProps {
 label: string
 field: keyof LeadRequest
 value?: string | number
 displayValue?: string
 isEditing: boolean
 onChange: (
  field: keyof LeadRequest,
  value: string | number | undefined
 ) => void
 type?: string
 icon?: React.ReactNode
}

const maskCNPJ = (value: string) => ({
 mask: '00.000.000/0000-00',
 value
})

const maskCEP = (value: string) => ({
 mask: '00000-000',
 value
})

const maskPhone = (value: string) => ({
 mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }],
 value
})

export function EditableField({
 label,
 field,
 value,
 displayValue,
 isEditing,
 onChange,
 type = 'text',
 icon
}: EditableFieldProps) {
 const currentValue = value || ''

 const fieldMask =
  field === 'cnpj'
   ? maskCNPJ(currentValue as string)
   : field === 'cep'
   ? maskCEP(currentValue as string)
   : field === 'phone'
   ? maskPhone(currentValue as string)
   : null

 return (
  <div>
   <span className="font-medium text-gray-800 dark:text-white flex items-center gap-1">
    {icon} {label}:
   </span>
   {isEditing ? (
    fieldMask ? (
     <IMaskInput
      {...fieldMask}
      onAccept={masked => onChange(field, masked)}
      className="mt-1 flex h-10 w-full rounded-md border border-input dark:border-white bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
     />
    ) : (
     <Input
      type={type}
      value={value || ''}
      onChange={e => onChange(field, e.target.value)}
      className="mt-1"
      placeholder={`Digite ${label.toLowerCase()}`}
     />
    )
   ) : (
    <p className="text-gray-600 dark:text-white break-words">
     {displayValue ??
      (typeof value === 'string'
       ? value.trim() || 'Não informado'
       : value ?? 'Não informado')}
    </p>
   )}
  </div>
 )
}
