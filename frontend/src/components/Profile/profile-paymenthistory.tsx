import { CheckCircle, Clock, FileText, Receipt, XCircle } from 'lucide-react'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from '../ui/card'
import { Badge } from '../ui/badge'
import { useInvoice } from '@/http/use-invoice'
//import { Button } from '../ui/button'

// const mockPayments = [
//  {
//   id: 1,
//   date: '2024-12-04',
//   description: 'Assinatura Plano Profissional - Dezembro/2024',
//   amount: 800.0,
//   status: 'paid',
//   invoiceUrl: '#'
//  },
//  {
//   id: 2,
//   date: '2024-11-04',
//   description: 'Assinatura Plano Profissional - Novembro/2024',
//   amount: 800.0,
//   status: 'paid',
//   invoiceUrl: '#'
//  },
//  {
//   id: 3,
//   date: '2024-11-15',
//   description: 'Alvarás Excedentes - 50 unidades',
//   amount: 250.0,
//   status: 'paid',
//   invoiceUrl: '#'
//  },
//  {
//   id: 4,
//   date: '2024-10-04',
//   description: 'Assinatura Plano Profissional - Outubro/2024',
//   amount: 800.0,
//   status: 'paid',
//   invoiceUrl: '#'
//  },
//  {
//   id: 5,
//   date: '2024-09-04',
//   description: 'Assinatura Plano Profissional - Setembro/2024',
//   amount: 800.0,
//   status: 'paid',
//   invoiceUrl: '#'
//  },
//  {
//   id: 6,
//   date: '2025-01-04',
//   description: 'Assinatura Plano Profissional - Janeiro/2025',
//   amount: 800.0,
//   status: 'pending',
//   invoiceUrl: '#'
//  }
// ]

export function ProfilePaymentHistory() {
 const { data: invoices, isLoading, isPending } = useInvoice()

 if (isLoading) {
  return <p>Carregando faturas...</p>
 }

 const getStatusBadge = (status: string) => {
  switch (status) {
   case 'paid':
    return (
     <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-600 hover:text-white">
      <CheckCircle className="h-3 w-3 mr-1" />
      Pago
     </Badge>
    )
   case 'pending':
    return (
     <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-600 hover:text-white">
      <Clock className="h-3 w-3 mr-1" />
      Pendente
     </Badge>
    )
   case 'failed':
    return (
     <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-600 hover:text-white">
      <XCircle className="h-3 w-3 mr-1" />
      Falhou
     </Badge>
    )
   default:
    return <Badge variant="outline">{status}</Badge>
  }
 }

 //  const handleDownloadInvoice = (paymentId: number) => {
 //   // TODO: Integrate with backend to download invoice
 //   //toast.success('Download da fatura iniciado!')
 //   console.log(paymentId)
 //  }

 const totalPaidRaw = invoices
  ?.filter(invoice => invoice.status === 'paid')
  .reduce((acc, invoice) => acc + Number(invoice.amount || 0), 0)

 const totalPaid = Number(totalPaidRaw) || 0

 return (
  <Card>
   <CardHeader>
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
     <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
       <Receipt className="h-5 w-5 text-primary" />
      </div>
      <div>
       <CardTitle>Histórico de Pagamentos</CardTitle>
       <CardDescription>Suas faturas e pagamentos realizados</CardDescription>
      </div>
     </div>
     <div className="text-center lg:text-right self-center">
      <p className="text-sm text-muted-foreground">Total pago</p>
      <p className="text-lg font-bold text-primary">
       R$ {totalPaid.toFixed(2).replace('.', ',')}
      </p>
     </div>
    </div>
   </CardHeader>
   <CardContent>
    <div className="space-y-3">
     {invoices?.length === 0 && (
      <p className="text-muted-foreground text-sm">
       Nenhuma fatura encontrada.
      </p>
     )}
     {invoices?.map(invoice => (
      <div
       key={invoice.id}
       className="flex flex-col-reverse lg:flex-row items-start lg:items-center justify-between p-4 gap-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
      >
       <div className="flex items-start lg:items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
         <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
         <p className="font-medium text-sm">{invoice.description}</p>
         <p className="text-xs text-muted-foreground">
          {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
         </p>
        </div>
       </div>
       <div className="flex flex-col self-end items-end gap-4">
        <div className="text-right">
         <p className="font-semibold">
          R$ {invoice.amount.toFixed(2).replace('.', ',')}
         </p>
         {getStatusBadge(invoice.status)}
        </div>
        {invoice.status === 'pending' && (
         <div>
          <button
           onClick={() => {}}
           disabled={isPending}
           className="px-3 py-1 rounded bg-primary text-white hover:bg-primary/80"
          >
           {isPending ? 'Processando...' : 'Pagar agora'}
          </button>
         </div>
        )}
        {/* <Button
         variant="ghost"
         size="icon"
         onClick={() => handleDownloadInvoice(payment.id)}
         title="Baixar fatura"
        >
         <Download className="h-4 w-4" />
        </Button> */}
       </div>
      </div>
     ))}
    </div>
   </CardContent>
  </Card>
 )
}
