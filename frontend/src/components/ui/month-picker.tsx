import { Calendar as CalendarIcon } from 'lucide-react'
import { MonthPickerInput } from '@mantine/dates'
import 'dayjs/locale/pt-br'

import { cn } from '@/lib/utils'

export interface SelectedMonth {
 month: number
 year: number
}

interface MonthPickerProps {
 className?: string
 value?: SelectedMonth
 onChange: (value: SelectedMonth | undefined) => void
}

export function MonthPicker({ className, value, onChange }: MonthPickerProps) {
 const stringValue = value
  ? `${value.year}-${String(value.month).padStart(2, '0')}`
  : null

 //  monthsListControl: `
 //     capitalize
 //     text-gray-900 dark:text-gray-100
 //     hover:bg-gray-100 dark:hover:bg-gray-800
 //     data-[selected=true]:bg-black
 //     data-[selected=true]:text-white
 //     dark:data-[selected=true]:bg-white
 //     dark:data-[selected=true]:text-black
 //   `,

 //  input:
 //       'h-10 text-sm rounded-lg bg-white text-foreground border-gray-300 dark:bg-black',
 //      placeholder: 'placeholder:text-foreground text-foreground',
 //      section: 'text-foreground',
 //      levelsGroup: 'bg-white text-gray-900 dark:bg-black dark:text-white',
 //      calendarHeader: 'bg-[#f8f9fa] dark:bg-black',
 //      calendarHeaderControl: `
 //       hover:bg-gray-200
 //       dark:hover:bg-[#27272a]
 //     `,
 //      monthsList: 'dark:bg-black',
 //      monthsListControl:
 //       'text-foreground capitalize dark:hover:text-white dark:hover:bg-[#27272a] hover:text-white hover:bg-black data-[selected=true]:bg-black data-[selected=true]:text-white dark:data-[selected=true]:bg-[#27272a] dark:data-[selected=true]:text-white'

 // input: `
 //     h-10 text-sm rounded-lg
 //     bg-white text-foreground border-gray-300
 //     dark:bg-black
 //   `,

 return (
  <div className={cn('grid gap-2', className)}>
   <MonthPickerInput
    locale="pt-br"
    value={stringValue}
    valueFormat="MM/YYYY"
    onChange={value => {
     if (!value) {
      onChange(undefined)
      return
     }

     const [year, month] = value.split('-').map(Number)

     onChange({ year, month })
    }}
    classNames={{
     /* INPUT */
     input: `
      h-10 text-sm rounded-lg
      bg-white text-foreground border-gray-300
      dark:bg-black
    `,

     /* Placeholder */
     placeholder: 'text-foreground',

     /* Ícones */
     section: 'text-gray-500 dark:text-white',

     /* 👇 "DROPDOWN" (container do calendário) */
     levelsGroup: `
      bg-white text-gray-900
      dark:bg-[#2e2e2e] dark:text-white
    `,

     /* Header */
     calendarHeader: `
      bg-white text-foreground
      dark:bg-[#2e2e2e] dark:text-foreground
    
    `,

     /* Botões do header */
     calendarHeaderControl: `
      bg-white
      hover:bg-gray-100
      dark:bg-[#2e2e2e]
      dark:hover:bg-gray-800
    `,
     calendarHeaderControlIcon: `
      text-foreground
      hover:bg-gray-100
      dark:hover:bg-gray-800
      dark:text-white
    `,
     calendarHeaderLevel: 'dark:hover:bg-gray-800',

     /* Lista de meses */
     monthsList: 'dark:bg-[#2e2e2e]',

     /* Botão do mês */
     monthsListControl: `
      capitalize
      text-foreground
      hover:bg-gray-100

      data-[selected=true]:bg-gray-100
      data-[selected=true]:text-foreground

      dark:text-white
      dark:hover:bg-gray-800
      dark:data-[selected=true]:bg-gray-800
      dark:data-[selected=true]:text-white
    `
    }}
    placeholder="Selecione o mês"
    leftSection={<CalendarIcon size={16} className="text-foreground" />}
    clearable
   />
  </div>
 )
}
