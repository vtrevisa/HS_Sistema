import { useState } from 'react'
import { Calendar, Check, Mail, MoreHorizontal, User, X } from 'lucide-react'
import { Card } from '../ui/card'
import type { PlanRequest } from '@/http/types/plan'
import { Badge } from '../ui/badge'
import { getStatusBadge } from '@/utils/plan'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { AprovePlan } from '../Modals/aprove-plan'
import { RejectPlan } from '../Modals/reject-plan'

interface PlansAdminTableProps {
 plans: PlanRequest[]
}

export function PlansAdminTable({ plans }: PlansAdminTableProps) {
 const [selectedRequest, setSelectedRequest] = useState<PlanRequest | null>(
  null
 )

 const [approveModalOpen, setApproveModalOpen] = useState(false)
 const [rejectModalOpen, setRejectModalOpen] = useState(false)

 function handleOpenApproveModal(request: PlanRequest) {
  setSelectedRequest(request)
  setApproveModalOpen(true)
 }

 function handleOpenRejectModal(request: PlanRequest) {
  setSelectedRequest(request)
  setRejectModalOpen(true)
 }

 return (
  <>
   <Card className="p-2 md:p-6">
    <div className="rounded-md border overflow-x-auto">
     <table className="w-full caption-bottom text-sm">
      <thead className="[&_tr]:border-b">
       <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
         Usuário
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
         Plano Atual
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
         Plano Solicitado
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
         Status
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
         Data da Solicitação
        </th>
        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
         Ações
        </th>
       </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
       {plans.length === 0 ? (
        <tr>
         <td colSpan={12} className="text-center py-8 text-muted-foreground">
          Nenhum registro encontrado
         </td>
        </tr>
       ) : (
        plans.map(plan => {
         return (
          <tr
           key={plan.id}
           className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
          >
           <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
            <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
             </div>
             <div>
              <p className="font-medium">{plan.user.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
               <Mail className="h-3 w-3" />
               {plan.user.email}
              </p>
             </div>
            </div>
           </td>
           <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
            <Badge variant="outline">{plan.current_plan.name}</Badge>
           </td>
           <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
            <Badge variant="secondary">{plan.requested_plan.name}</Badge>
           </td>
           <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
            {getStatusBadge(plan.status)}
           </td>
           <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
             <Calendar className="h-3 w-3" />
             {new Date(plan.created_at).toLocaleDateString('pt-BR')}
            </div>
           </td>
           <td className="text-right px-4">
            <DropdownMenu>
             <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
               <MoreHorizontal className="h-4 w-4" />
              </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenApproveModal(plan)}>
               <Check className="h-4 w-4 mr-2" />
               Aprovar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenRejectModal(plan)}>
               <X className="h-4 w-4 mr-2" />
               Recusar
              </DropdownMenuItem>
             </DropdownMenuContent>
            </DropdownMenu>
           </td>
          </tr>
         )
        })
       )}
      </tbody>
     </table>
    </div>
   </Card>

   {selectedRequest && (
    <>
     <AprovePlan
      key={selectedRequest.id}
      request={selectedRequest}
      isOpen={approveModalOpen}
      onClose={() => {
       setApproveModalOpen(false)
       setSelectedRequest(null)
      }}
     />

     <RejectPlan
      request={selectedRequest}
      isOpen={rejectModalOpen}
      onClose={() => {
       setRejectModalOpen(false)
       setSelectedRequest(null)
      }}
     />
    </>
   )}
  </>
 )
}
