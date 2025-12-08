import { Check, Shield } from 'lucide-react'
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle
} from '../ui/card'

export function ProfilePlan() {
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Shield className="h-5 w-5 text-primary" />
     Recursos do seu plano
    </CardTitle>
    <CardDescription>Veja o que está incluso na sua assinatura</CardDescription>
   </CardHeader>
   <CardContent>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
     <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <Check className="h-5 w-5 text-green-500 mt-0.5" />
      <div>
       <p className="font-medium">200 Alvarás/mês</p>
       <p className="text-sm text-muted-foreground">Captação mensal inclusa</p>
      </div>
     </div>
     <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <Check className="h-5 w-5 text-green-500 mt-0.5" />
      <div>
       <p className="font-medium">CRM Completo</p>
       <p className="text-sm text-muted-foreground">
        Gestão de leads e pipeline
       </p>
      </div>
     </div>
     <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <Check className="h-5 w-5 text-green-500 mt-0.5" />
      <div>
       <p className="font-medium">Busca de dados empresariais</p>
       <p className="text-sm text-muted-foreground">
        Aprimoramento de dados empresariais
       </p>
      </div>
     </div>
     <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <Check className="h-5 w-5 text-green-500 mt-0.5" />
      <div>
       <p className="font-medium">Suporte Prioritário</p>
       <p className="text-sm text-muted-foreground">
        Suporte por e-mail e whatsapp
       </p>
      </div>
     </div>
    </div>
   </CardContent>
  </Card>
 )
}
