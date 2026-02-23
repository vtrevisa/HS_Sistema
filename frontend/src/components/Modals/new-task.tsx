/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '../ui/button'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Textarea } from '../ui/textarea'
import { Calendar } from '../ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import type { CreateTask } from '@/http/types/calendar'

interface NewTaskModalProps {
 isOpen: boolean
 onOpenChange: (open: boolean) => void
 onSave: (task: CreateTask) => void
 defaultDate?: Date
 task?: any | null
 leadId?: number
}

export function NewTaskModal({
 isOpen,
 onOpenChange,
 onSave,
 defaultDate,
 task,
 leadId
}: NewTaskModalProps) {
 const [title, setTitle] = useState('')
 const [description, setDescription] = useState('')
 const [date, setDate] = useState<Date | undefined>(defaultDate || new Date())
 const [hour, setHour] = useState('09:00')
 const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media')

 function handleSaveTask() {
  if (!title.trim()) {
   toast.error('Informe o título da tarefa')
   return
  }

  if (!description.trim()) {
   toast.error('Informe a descrição da tarefa')
   return
  }

  if (!date) {
   toast.error('Selecione uma data')
   return
  }

  const formattedHour = hour.length === 8 ? hour.slice(0, 5) : hour

  onSave({
   title,
   description,
   date,
   hour: formattedHour,
   priority,
   lead_id: leadId
  })

  // reset
  if (!task) {
   setTitle('')
   setDescription('')
   setHour('09:00')
   setPriority('media')
  }

  onOpenChange(false)
 }

 useEffect(() => {
  if (!isOpen) return

  if (task) {
   // Modo edição
   setTitle(task.title)
   setDescription(task.description ?? '')
   setDate(new Date(task.date))
   setHour(
    task.hour?.length === 8 ? task.hour.slice(0, 5) : (task.hour ?? '09:00')
   )
   setPriority(task.priority ?? 'media')
  } else {
   // Modo nova tarefa (reset total)
   setTitle('')
   setDescription('')
   setDate(defaultDate || new Date())
   setHour('09:00')
   setPriority('media')
  }
 }, [task, isOpen, defaultDate])
 return (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
   <DialogContent className="sm:max-w-[480px]">
    <DialogHeader>
     <DialogTitle className="text-primary">
      {task ? 'Editar Tarefa' : 'Agendar Nova Tarefa'}
     </DialogTitle>
     <DialogDescription className="sr-only">
      Formulário para criar uma nova tarefa no calendário
     </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-2">
     <div className="space-y-2">
      <Label htmlFor="title">Título *</Label>
      <Input
       id="title"
       value={title}
       onChange={e => setTitle(e.target.value)}
       placeholder="Ex: Reunião com cliente"
      />
     </div>

     <div className="space-y-2">
      <Label htmlFor="description">Descrição</Label>
      <Textarea
       id="description"
       value={description}
       onChange={e => setDescription(e.target.value)}
       placeholder="Detalhes da tarefa..."
       rows={3}
      />
     </div>

     <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
       <Label>Data *</Label>
       <Popover>
        <PopoverTrigger asChild>
         <Button
          variant="outline"
          className={cn(
           'w-full justify-start text-left font-normal',
           !date && 'text-muted-foreground'
          )}
         >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
         </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
         <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          className="pointer-events-auto"
         />
        </PopoverContent>
       </Popover>
      </div>

      <div className="space-y-2">
       <Label htmlFor="hora">Horário</Label>
       <Input
        id="hora"
        type="time"
        value={hour}
        onChange={e => setHour(e.target.value)}
       />
      </div>
     </div>

     <div className="space-y-2">
      <Label>Prioridade</Label>
      <select
       value={priority}
       onChange={e => setPriority(e.target.value as any)}
       className="w-full border border-gray-300 bg-background rounded-lg p-2 focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
      >
       <option value="baixa">🟢 Baixa</option>
       <option value="media">🟡 Média</option>
       <option value="alta">🔴 Alta</option>
      </select>
     </div>
    </div>

    <DialogFooter>
     <Button variant="outline" onClick={() => onOpenChange(false)}>
      Cancelar
     </Button>
     <Button
      onClick={handleSaveTask}
      className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
     >
      {task ? 'Salvar Alterações' : 'Agendar Tarefa'}
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}
