import { toast } from 'sonner'
import { useState } from 'react'

import { EmpresasActions } from './empresas-actions'
import { EmpresasTable, type AlvaraEnriquecido } from './empresas-table'
import { NewCompanyModal } from '../Modals/new-company'

export function Empresas() {
 const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false)

 const [alvaras, setAlvaras] = useState<AlvaraEnriquecido[]>([
  {
   id: '1',
   nomeComercial: 'Shopping Center ABC',
   endereco: 'Av. Principal, 123',
   cidade: 'São Paulo',
   estado: 'SP',
   tipoServico: 'CLCB',
   dataVencimento: '2024-12-15',
   enriquecido: false
  },
  {
   id: '2',
   nomeComercial: 'Edifício Comercial XYZ',
   endereco: 'Rua Comercial, 456',
   cidade: 'Rio de Janeiro',
   estado: 'RJ',
   tipoServico: 'AVCB',
   dataVencimento: '2024-11-20',
   telefone: '(21) 99999-9999',
   email: 'contato@edificioxyz.com.br',
   cnpj: '12.345.678/0001-99',
   enderecoFormatado: 'Rua Comercial, 456 - Centro, Rio de Janeiro/RJ',
   enriquecido: true
  }
 ])

 const [processingEnrichment, setProcessingEnrichment] = useState<string[]>([])

 function enhanceData(alvaraId: string) {
  setProcessingEnrichment(prev => [...prev, alvaraId])

  setTimeout(() => {
   setAlvaras(prev =>
    prev.map(alvara =>
     alvara.id === alvaraId
      ? {
         ...alvara,
         telefone: '(11) 99999-9999',
         email: 'contato@empresa.com.br',
         cnpj: '12.345.678/0001-99',
         enderecoFormatado: `${alvara.endereco} - Centro, ${alvara.cidade}/${alvara.estado}`,
         enriquecido: true
        }
      : alvara
    )
   )

   setProcessingEnrichment(prev => prev.filter(id => id !== alvaraId))

   toast.success('Dados Aprimorados', {
    description: 'Os dados da empresa foram enriquecidos com sucesso.'
   })
  }, 2000)
 }

 console.log(isNewCompanyModalOpen)

 async function enhanceAllData() {
  const alvarasNaoEnriquecidos = alvaras.filter(alvara => !alvara.enriquecido)

  if (alvarasNaoEnriquecidos.length === 0) {
   toast.warning('Nenhum Alvará Pendente', {
    description: 'Todos os alvarás já foram enriquecidos.'
   })
   return
  }

  alvarasNaoEnriquecidos.forEach(alvara => {
   enhanceData(alvara.id)
  })
 }

 function gererateNewLead() {
  console.log('Novo lead')
 }

 return (
  <div className="p-6 space-y-6">
   <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold text-blue-600 dark:text-white">
     Busca de Dados da Empresa
    </h1>
    <EmpresasActions
     enhanceAllData={enhanceAllData}
     onNewCompanyClick={() => setIsNewCompanyModalOpen(true)}
    />
   </div>
   {/* Tabela de Empresas */}
   <EmpresasTable
    alvaras={alvaras}
    processingEnrichment={processingEnrichment}
    enhanceData={enhanceData}
    gererateNewLead={gererateNewLead}
   />

   <NewCompanyModal
    isOpen={isNewCompanyModalOpen}
    onClose={() => setIsNewCompanyModalOpen(false)}
   />
  </div>
 )
}
