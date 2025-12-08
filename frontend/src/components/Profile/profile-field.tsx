import { Input } from '../ui/input'
import { IMaskInput } from 'react-imask'

export interface ProfileRequest {
 id?: number
 name: string
 email?: string
 phone: string
 company?: string
 cnpj?: string
 address: string
 last_renewal_at: string
}

interface ProfileFieldProps {
 label: string
 field: keyof ProfileRequest
 value?: string | number
 displayValue?: string
 isEditing: boolean
 onChange: (
  field: keyof ProfileRequest,
  value: string | number | undefined
 ) => void
 type?: string
 icon?: React.ReactNode
}

const maskCNPJ = (value: string) => ({
 mask: '00.000.000/0000-00',
 value
})

// const maskCEP = (value: string) => ({
//  mask: '00000-000',
//  value
// })

const maskPhone = (value: string) => ({
 mask: [{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }],
 value
})

export function ProfileField({
 label,
 field,
 value,
 displayValue,
 isEditing,
 onChange,
 type = 'text',
 icon
}: ProfileFieldProps) {
 const currentValue = value || ''

 const fieldMask =
  field === 'cnpj'
   ? maskCNPJ(currentValue as string)
   : field === 'phone'
   ? maskPhone(currentValue as string)
   : null

 return (
  <>
   <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
    {icon} {label}
   </span>
   {isEditing ? (
    fieldMask ? (
     <IMaskInput
      {...fieldMask}
      onAccept={masked => onChange(field, masked)}
      className="flex h-10 w-full rounded-md border border-input dark:border-white bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
    <Input
     type={type}
     disabled
     value={
      displayValue ??
      (typeof value === 'string'
       ? value.trim() || 'Não informado'
       : value ?? 'Não informado')
     }
     onChange={e => onChange(field, e.target.value)}
    />
   )}
  </>
 )
}
