import type { RecentLead } from '@/http/types/dashboard'
import { CircleAlert, Users } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface RecentLeadsProps {
 leads: RecentLead[]
}

export function RecentLeads({ leads }: RecentLeadsProps) {
 const getStatusStyle = (status: string) => {
  switch (status) {
   case 'Lead':
    return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white'
   case 'Primeiro contato':
    return 'bg-blue-100 text-blue-800 dark:bg-blue-600/30 dark:text-white'
   case 'Follow-up':
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600/30 dark:text-white'
   case 'Proposta enviada':
    return 'bg-orange-100 text-orange-800 dark:bg-orange-600/30 dark:text-white'
   case 'Cliente fechado':
    return 'bg-green-100 text-green-800 dark:bg-green-600/30 dark:text-white'
   default:
    return 'bg-muted text-muted-foreground'
  }
 }

 if (leads.length === 0) {
  return (
   <Card className="h-[110px]">
    <CardContent className="pt-6">
     <div className="text-center text-foreground">
      <CircleAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Nenhum lead encontrado!</p>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="bg-card rounded-xl shadow-lg p-4 lg:p-6 border-l-4 border border-primary">
   <h2 className="text-lg lg:text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
    <Users size={20} />
    Lista de Leads Recentes
   </h2>
   <div className="space-y-4">
    {leads.map((lead, index) => (
     <div
      key={index}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors gap-2 sm:gap-0"
     >
      <div>
       <p className="font-semibold text-card-foreground text-sm lg:text-base">
        {lead.company}
       </p>
      </div>
      <div className="text-left sm:text-right">
       <span
        className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
         lead.status
        )}`}
       >
        {lead.status}
       </span>
      </div>
     </div>
    ))}
   </div>
  </div>
 )
}
