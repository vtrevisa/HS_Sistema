import { toast } from 'sonner'
import { useState } from 'react'

import { CompaniesActions } from './companies-actions'
import { CompaniesTable } from './companies-table'
import { NewCompanyModal } from '../Modals/new-company'
import { useCompany } from '@/http/use-company'
import type { CompanyRequest } from '@/http/types/companies'

export function Companies() {
 const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false)
 const [processingEnrichment, setProcessingEnrichment] = useState<number[]>([])

 const { companies, saveCompany, searchByCnpj, isLoading } = useCompany()

 function enhanceData(companyId: number) {
  const company = companies?.find(company => company.id === companyId)
  if (!company || company.status !== 'pendente') return

  setProcessingEnrichment(prev => [...prev, companyId])

  setTimeout(() => {
   company.phone ||= '(11) 99999-9999'
   company.cnpj ||= '12.345.678/0001-99'
   company.email ||= 'contato@empresa.com.br'
   company.status = 'enriquecido'

   setProcessingEnrichment(prev => prev.filter(id => id !== companyId))

   toast.success('Dados Aprimorados', {
    description: `A empresa ${company.company} foi enriquecida com sucesso.`
   })
  }, 2000)
 }

 async function enhanceAllData() {
  const pendingCompanies =
   companies?.filter(company => company.status === 'Pendente') ?? []

  if (pendingCompanies.length === 0) {
   toast.warning('Nenhum Alvará Pendente', {
    description: 'Todos os alvarás já foram enriquecidos.'
   })
   return
  }

  pendingCompanies.forEach(company => enhanceData(company.id))
 }

 function handleNewCompany(companyData: Omit<CompanyRequest, 'id'>) {
  saveCompany.mutate(companyData)
 }

 //  function handleSearchCnpj(cnpj: string) {
 //   searchByCnpj.mutate(cnpj)
 //  }

 function gererateNewLead() {
  console.log('Novo lead')
 }

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     Busca de Dados da Empresa
    </h1>
    <CompaniesActions
     enhanceAllData={enhanceAllData}
     onNewCompanyClick={() => setIsNewCompanyModalOpen(true)}
    />
   </div>
   {/* Tabela de Empresas */}
   {!isLoading && (
    <CompaniesTable
     companies={companies}
     processingEnrichment={processingEnrichment}
     enhanceData={enhanceData}
     gererateNewLead={gererateNewLead}
    />
   )}

   <NewCompanyModal
    isOpen={isNewCompanyModalOpen}
    onClose={() => setIsNewCompanyModalOpen(false)}
    onCompanyCreate={handleNewCompany}
    onSearchCnpj={searchByCnpj}
   />
  </div>
 )
}
