import { Plus } from 'lucide-react'
import { PipelineNotification } from './pipeline-notification'

interface PipelineActionsProps {
 onNewLeadClick: () => void
}

export function PipelineActions({ onNewLeadClick }: PipelineActionsProps) {
 return (
  <div className="flex flex-wrap items-center gap-2">
   <PipelineNotification />
   <button
    onClick={onNewLeadClick}
    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
   >
    <Plus size={20} />
    <span className="hidden sm:inline">Novo Lead</span>
   </button>
  </div>
 )
}
