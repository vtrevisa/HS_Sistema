import { Badge } from '@/components/ui/badge'

export function getStatusBadge(status: string | undefined) {
 switch (status) {
  case 'approved':
   return (
    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-600 hover:text-white">
     Aprovadas
    </Badge>
   )
  case 'rejected':
   return (
    <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-600 hover:text-white">
     Rejeitadas
    </Badge>
   )
  case 'pending':
   return (
    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-600 hover:text-white">
     Pendentes
    </Badge>
   )
  default:
   return <Badge variant="outline">{status}</Badge>
 }
}
