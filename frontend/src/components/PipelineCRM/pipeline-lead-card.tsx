import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { AlertTriangle, Calendar, Clock, DollarSign } from 'lucide-react'

import type { LeadRequest } from '@/http/types/leads'

interface PipelineLeadCardProps {
 lead: LeadRequest & { daysInStage: number; isOverdue: boolean }
 onLeadClick: (lead: LeadRequest) => void
}

export function PipelineLeadCard({ lead, onLeadClick }: PipelineLeadCardProps) {
 const getCardBorderColor = () =>
  lead.isOverdue ? 'border-red-500 dark:border-red-400' : 'border-border'

 const getOverdueIndicator = () =>
  lead.isOverdue ? (
   <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium">
    <AlertTriangle size={12} /> Prazo vencido
   </div>
  ) : null

 return (
  <Card
   className={`hover:shadow-lg transition-all cursor-pointer ${getCardBorderColor()}`}
   onClick={() => onLeadClick(lead)}
  >
   <CardHeader className="pb-3">
    <div className="space-y-2">
     <div className="flex justify-between items-start">
      <h3 className="font-semibold text-card-foreground text-sm max-w-[190px]">
       {lead.company}
      </h3>
      {getOverdueIndicator()}
     </div>

     <div className="flex items-center justify-between">
      <Badge variant="secondary" className="text-xs">
       Alvará {lead.service}
      </Badge>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
       <Clock size={10} />
       {lead.daysInStage}d
      </div>
     </div>
    </div>
   </CardHeader>
   <CardContent className="space-y-3">
    {/* Informações resumidas do card fechado */}
    <div className="space-y-2 text-xs">
     <div className="flex items-center gap-1">
      <Calendar size={10} className="text-muted-foreground" />
      <span className="font-semibold text-card-foreground">Validade:</span>
      <span className="text-muted-foreground">
       {new Date(lead.expiration_date).toLocaleDateString('pt-BR')}
      </span>
     </div>
     {lead.service_value && (
      <div className="flex items-center gap-1">
       <DollarSign size={10} className="text-muted-foreground" />
       <span className="font-semibold text-card-foreground">Valor:</span>
       <span className="text-green-600 dark:text-green-400 font-semibold">
        {new Intl.NumberFormat('pt-BR', {
         style: 'currency',
         currency: 'BRL'
        }).format(parseFloat(lead.service_value))}
       </span>
      </div>
     )}
    </div>

    {/* File Attachments Indicator */}
    {/* {lead.attachments && lead.attachments.length > 0 && (
     <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
      <FileText size={10} />
      <span>{lead.attachments.length} arquivo(s)</span>
     </div>
    )} */}
   </CardContent>
  </Card>
 )
}
