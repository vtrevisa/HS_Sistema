import type { RecentLead } from '@/http/types/dashboard'
import { CircleAlert, Users } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface RecentLeadsProps {
 leads: RecentLead[]
}

export function RecentLeads({ leads }: RecentLeadsProps) {
 //  const recentLeads = [
 //   {
 //    company: 'Edifício Residencial Solar',
 //    type: 'AVCB',
 //    status: 'Primeiro contato',
 //    vencimento: '2024-08-15'
 //   },
 //   {
 //    company: 'Shopping Center Plaza',
 //    type: 'CLCB',
 //    status: 'Proposta enviada',
 //    vencimento: '2024-07-20'
 //   },
 //   {
 //    company: 'Hotel Business Inn',
 //    type: 'AVCB',
 //    status: 'Follow-up',
 //    vencimento: '2024-09-10'
 //   },
 //   {
 //    company: 'Condomínio Jardim Sul',
 //    type: 'Laudo Técnico',
 //    status: 'Lead',
 //    vencimento: '2024-06-30'
 //   }
 //  ]

 if (leads.length === 0) {
  return (
   <Card className="h-[110px]">
    <CardContent className="pt-6">
     <div className="text-center text-gray-500">
      <CircleAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Nenhum lead encontrado!</p>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6 border-l-4 border-blue-500 self-start">
   <h2 className="text-lg lg:text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
    <Users size={20} />
    Leads Recentes
   </h2>
   <div className="space-y-4">
    {leads.map((lead, index) => (
     <div
      key={index}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors gap-2 sm:gap-0"
     >
      <div>
       <p className="font-semibold text-gray-800 dark:text-white text-sm lg:text-base">
        {lead.company}
       </p>
       <p className="text-sm text-gray-600 dark:text-gray-400">
        {lead.service}
       </p>
      </div>
      <div className="text-left sm:text-right">
       <span
        className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
         lead.status === 'Lead'
          ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white'
          : lead.status === 'Primeiro contato'
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-600/30 dark:text-white'
          : lead.status === 'Follow-up'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600/30 dark:text-white'
          : lead.status === 'Proposta enviada'
          ? 'bg-orange-100 text-orange-800 dark:bg-orange-600/30 dark:text-white'
          : lead.status === 'Cliente fechado'
          ? 'bg-green-100 text-green-800 dark:bg-green-600/30 dark:text-white'
          : 'bg-red-100 text-red-800 dark:bg-red-600/30 dark:text-white'
        }`}
       >
        {lead.status}
       </span>
       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Vence: {new Date(lead.expiration_date).toLocaleDateString('pt-BR')}
       </p>
      </div>
     </div>
    ))}
   </div>
  </div>
 )
}
