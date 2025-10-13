import { Plus } from 'lucide-react'
import { PipelineNotification } from './pipeline-notification'

interface PipelineActionsProps {
 onNewLeadClick: () => void
}

export function PipelineActions({ onNewLeadClick }: PipelineActionsProps) {
 return (
  <div className="flex gap-2 flex-row">
   <PipelineNotification />
   <button
    onClick={onNewLeadClick}
    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
   >
    <Plus size={20} />
    <span className="hidden sm:inline">Novo Lead</span>
   </button>
  </div>
 )
}
