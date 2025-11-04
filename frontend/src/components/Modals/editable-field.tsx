import type { LeadRequest } from '@/http/types/leads'
import { Input } from '../ui/input'

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
 return (
  <div>
   <span className="font-medium text-gray-800 dark:text-white flex items-center gap-1">
    {icon} {label}:
   </span>
   {isEditing ? (
    <Input
     type={type}
     value={value || ''}
     onChange={e => onChange(field, e.target.value)}
     className="mt-1"
     placeholder={`Digite ${label.toLowerCase()}`}
    />
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
