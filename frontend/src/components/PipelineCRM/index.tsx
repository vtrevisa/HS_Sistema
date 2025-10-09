import { PipelineActions } from './PipelineActions'

export function Pipeline() {
 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     CRM - Funil de Vendas
    </h1>
    <PipelineActions />
   </div>
  </div>
 )
}
