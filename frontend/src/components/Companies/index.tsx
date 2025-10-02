import { useState } from 'react'

import { CompaniesActions } from './companies-actions'
import { CompaniesTable } from './companies-table'
import { NewCompanyModal } from '../Modals/new-company'
import { useCompany } from '@/http/use-company'
import type { CompanyRequest } from '@/http/types/companies'
import { CompanyDetailsModal } from '../Modals/company-details'
import { useLead } from '@/http/use-lead'
import type { LeadRequest } from '@/http/types/leads'

export function Companies() {
 const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false)
 const [selectedCompany, setSelectedCompany] = useState<CompanyRequest | null>(
  null
 )
 const [isCompanyDetailsModalOpen, setIsCompanyDetailsModalOpen] =
  useState(false)

 const {
  companies,
  isLoading,
  saveCompany,
  enhanceData,
  enhanceAllData,
  processingEnrichment,
  searchByCnpj
 } = useCompany()

 const { saveLeads } = useLead()

 // Create new company
 function handleNewCompany(companyData: Omit<CompanyRequest, 'id'>) {
  saveCompany.mutate(companyData)
 }

 // Generate new company
 function gererateNewLead(company: CompanyRequest) {
  if (!company) return

  const validityDate = company.validity
   ? new Date(company.validity)
   : new Date()

  const nextActionDate = new Date(validityDate)
  nextActionDate.setDate(validityDate.getDate() + 1)

  const newLead: LeadRequest = {
   company: company.company,
   cep: company.cep || '',
   address: company.address || '',
   number: company.number || '',
   city: company.city || '',
   service: company.service || '',
   validity: company.validity || '',
   phone: company.phone || '',
   cnpj: company.cnpj || '',
   email: company.email || '',
   license: 'Não informado',
   expiration_date: company.validity,
   next_action: nextActionDate.toISOString().split('T')[0],
   district: 'Não informado',
   occupation: 'Não informado',
   status: 'Lead'
  }

  saveLeads.mutate([newLead])
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
     enhanceData={enhanceData}
     processingEnrichment={processingEnrichment}
     gererateNewLead={gererateNewLead}
     onCompanyClick={company => {
      setSelectedCompany(company)
      setIsCompanyDetailsModalOpen(true)
     }}
    />
   )}

   <NewCompanyModal
    isOpen={isNewCompanyModalOpen}
    onClose={() => setIsNewCompanyModalOpen(false)}
    onCompanyCreate={handleNewCompany}
    onSearchCnpj={searchByCnpj}
   />

   <CompanyDetailsModal
    isOpen={isCompanyDetailsModalOpen}
    onClose={() => setIsCompanyDetailsModalOpen(false)}
    company={selectedCompany}
   />
  </div>
 )
}
