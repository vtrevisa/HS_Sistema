import { useState } from 'react'

import { CompaniesActions } from './companies-actions'
import { CompaniesTable } from './companies-table'
import { NewCompanyModal } from '../Modals/new-company'
import { useCompany } from '@/http/use-company'
import type { CompanyRequest } from '@/http/types/companies'
import type { LeadRequest } from '@/http/types/leads'
import { CompanyDetailsModal } from '../Modals/company-details'
import { ImportAlvarasModal } from '../Modals/import-alvaras'
import { useLead } from '@/http/use-lead'

export function Companies() {
 const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false)
 const [selectedCompany, setSelectedCompany] = useState<CompanyRequest | null>(
  null
 )
 const [isCompanyDetailsModalOpen, setIsCompanyDetailsModalOpen] =
  useState(false)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [loadingCompanyId, setLoadingCompanyId] = useState<
  string | number | null
 >(null)

 const {
  companies,
  isLoading,
  saveCompanies,
  enhanceData,
  enhanceAllData,
  processingEnrichment,
  searchByCnpj
 } = useCompany()

 const { saveLeads } = useLead()

 // Create new company
 function handleNewCompany(companyData: Omit<CompanyRequest, 'id'>) {
  saveCompanies.mutate([companyData])
 }

 // Generate new company
 function gererateNewLead(company: CompanyRequest) {
  if (!company) return

  setLoadingCompanyId(company.id)

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
   complement: company.complement || '',
   city: company.city || '',
   service: company.service || '',
   validity: company.validity || '',
   phone: company.phone || '',
   cnpj: company.cnpj || '',
   email: company.email || '',
   license: company.license,
   expiration_date: company.validity,
   next_action: nextActionDate.toISOString().split('T')[0],
   district: company.district || '',
   occupation: company.occupation || '',
   website: company.website || '',
   contact: company.contact || '',
   status: 'Lead'
  }

  saveLeads.mutate([newLead], {
   onSettled: () => {
    setTimeout(() => {
     setLoadingCompanyId(null)
    }, 3200)
   }
  })
 }

 function handleImportComplete(importedAlvaras: CompanyRequest[]) {
  const processedAlvaras = importedAlvaras.map(alvara => {
   return {
    ...alvara,
    address: alvara.address,
    // Manter os campos originais para referência
    numero: alvara.number,
    complemento: alvara.complement,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    municipio: alvara.city || (alvara as any).cidade,
    bairro: alvara.district
   }
  })

  saveCompanies.mutate(processedAlvaras)
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
     onImportClick={() => setIsImportModalOpen(true)}
    />
   </div>
   {/* Tabela de Empresas */}
   {!isLoading && (
    <CompaniesTable
     companies={companies}
     enhanceData={enhanceData}
     processingEnrichment={processingEnrichment}
     gererateNewLead={gererateNewLead}
     loadingCompanyId={loadingCompanyId}
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

   <ImportAlvarasModal
    isOpen={isImportModalOpen}
    onClose={() => setIsImportModalOpen(false)}
    onImportComplete={handleImportComplete}
   />
  </div>
 )
}
