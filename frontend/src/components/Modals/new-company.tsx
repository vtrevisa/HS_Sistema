import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

interface NewCompanyModalProps {
 isOpen: boolean
 onClose: () => void
 //onLeadCreate: (lead: Omit<LeadRequest, 'id'>) => void
}

export function NewCompanyModal({ isOpen, onClose }: NewCompanyModalProps) {
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
     <DialogTitle>Cadastro Manual de Empresa</DialogTitle>
    </DialogHeader>
    <form className="space-y-4">
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Nome Comercial *
       </label>
       <input
        type="text"
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        CNPJ
       </label>
       <input
        type="text"
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        CEP
       </label>
       <input
        type="text"
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Endereço
       </label>
       <input
        type="text"
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Cidade*
       </label>
       <input
        type="text"
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Estado
       </label>
       <input
        type="text"
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Tipo de Serviço *
       </label>
       <select className="w-full border border-gray-300 bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none text-sm h-10">
        <option value="">Selecione o tipo</option>
        <option value="AVCB">AVCB</option>
        <option value="CLCB">CLCB</option>
       </select>
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Data de Vencimento
       </label>
       <input
        type="date"
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300 text-sm"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        Telefone
       </label>
       <input
        type="tel"
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-foreground mb-1">
        E-mail
       </label>
       <input
        type="email"
        className="w-full border bg-background text-foreground placeholder:text-foreground rounded-lg px-3 py-2 focus:ring-blue-500 focus:outline-none focus:ring-2 outline-none border-gray-300"
       />
      </div>
     </div>
     <div className="flex justify-end gap-2 mt-4">
      <Button type="button" variant="outline" onClick={onClose}>
       Cancelar
      </Button>
      <Button
       type="submit"
       className="bg-blue-600 hover:bg-blue-700 text-white"
      >
       Cadastrar
      </Button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}
