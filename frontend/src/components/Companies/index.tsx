import { useEffect, useMemo, useState } from 'react'

import { CompaniesActions } from './companies-actions'
import { CompaniesTable } from './companies-table'
import { NewCompanyModal } from '../Modals/new-company'
import { useCompany } from '@/http/use-company'
import type { CompanyRequest } from '@/http/types/companies'
import type { LeadRequest } from '@/http/types/leads'
import { CompanyDetailsModal } from '../Modals/company-details'
import { ImportAlvarasModal } from '../Modals/import-alvaras'
import { useLead } from '@/http/use-lead'
import { CompaniesFilters } from './companies-filters'
import type { DateRange } from 'react-day-picker'
import { toDateOnly } from '@/services/leads'
import { DeleteCompanyModal } from '../Modals/delete-company'
import { toast } from 'sonner'

export function Companies() {
 const [city, setCity] = useState('')
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedFilter, setSelectedFilter] = useState('todos')
 const [selectedType, setSelectedType] = useState('todos')
 const [dateRange, setDateRange] = useState<DateRange | undefined>()

 const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false)
 const [selectedCompany, setSelectedCompany] = useState<CompanyRequest | null>(
  null
 )
 const [isCompanyDetailsModalOpen, setIsCompanyDetailsModalOpen] =
  useState(false)
 const [isDeleteCompanyModalOpen, setIsDeleteCompanyModalOpen] = useState(false)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [loadingCompanyId, setLoadingCompanyId] = useState <  string | number | null  >(null)
 const [isDeleteCompanyModalOpen, setIsDeleteCompanyModalOpen] = useState(false)
 const [dateRange, setDateRange] = useState<DateRange | undefined>()
 const [selectedStatus, setSelectedStatus] = useState('todos')

 //--------useRef--------//
 const loadingCompanyIdRef = useRef<string | number | null>(null)
 
 //--------useEffect--------//
 useEffect(() => {
   loadingCompanyIdRef.current = loadingCompanyId
 }, [loadingCompanyId])

 //--------useCompany, useLead, useMemo--------// 
 const { saveLeads } = useLead()
 const { companiesDB } = useCompany()
 const leads = useMemo(() => companiesDB.data ?? [], [companiesDB.data])
 const {
  isLoading,
  refetchCompanies,
  saveCompanies,
  enhanceData,
  processingEnrichment,
  searchByCnpj,
  updateCompany
 } = useCompany()

 const { saveLeads, leadsDB } = useLead()

 // Filter leads from context
 const filteredCompanies = useMemo(() => {
  return companies.filter(company => {
   const companySearch = company.company?.toLowerCase() ?? ''
   const address = company.address?.toLowerCase() ?? ''
   const search = searchTerm.toLowerCase()

   const removeAccents = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

   // City
   const matchesCity =
    city === ''
     ? true
     : removeAccents(company.city?.toLowerCase() ?? '') ===
       removeAccents(city.toLowerCase())

   // Busca
   const matchesSearch =
    companySearch.includes(search) || address.includes(search)

   // Status
   const matchesStatus =
    selectedFilter === 'todos' ? true : company.status === selectedFilter

   // Service
   const matchesType =
    selectedType === 'todos' ? true : company.service === selectedType

   // Validity
   const matchesDate = () => {
    if (!dateRange?.from || !dateRange?.to) return true

    const from = new Date(dateRange.from)
    from.setHours(0, 0, 0, 0)

    const to = new Date(dateRange.to)
    to.setHours(23, 59, 59, 999)

    let matchesValidity = false

    if (company.validity) {
     const validity = new Date(company.validity)
     matchesValidity = validity >= from && validity <= to
    }

    return matchesValidity
   }

   return (
    matchesCity &&
    matchesSearch &&
    matchesStatus &&
    matchesType &&
    matchesDate()
   )
  })
 }, [companies, city, searchTerm, selectedFilter, selectedType, dateRange])

 // Create new company
 function handleNewCompany(companyData: Omit<CompanyRequest, 'id'>) {
  saveCompanies.mutate([companyData])
 }

 // Generate new lead
 function gererateNewLead(company: CompanyRequest) {
  if (!company) return

  setLoadingCompanyId(company.id)
  
  const validityDate = company.validity
   ? new Date(company.validity)
   : new Date()

  const nextActionDate = new Date(validityDate)
  nextActionDate.setDate(nextActionDate.getDate() + 1)

  const newLead: LeadRequest = {
   company: company.company,
   cep: company.cep || '',
   address: company.address || '',
   number: company.number || '',
   complement: company.complement || '',
   city: company.city || '',
   service: company.service || '',
   validity: toDateOnly(company.validity) || '',
   phone: company.phone || '',
   cnpj: company.cnpj || '',
   email: company.email || '',
   license: company.license,
   expiration_date: toDateOnly(company.validity) || '',
   next_action: nextActionDate.toISOString().split('T')[0],
   district: company.district || '',
   occupation: company.occupation || '',
   website: company.website || '',
   contact: company.contact || '',
   attachments: [],
   status: 'Lead'
  }

  saveLeads.mutate([newLead], {
   onSuccess:() => {
    if (company?.id) updateCompany.mutate({...company, status: 'lead'})
   },
   onSettled: () => {
    setTimeout(() => {
     setLoadingCompanyId(null)
    }, 3200)
   }
  })
 }

 async function generateAllLeads() {
  const enrichedCompanies =
   companies.filter(company => company.status === 'enriquecido') ?? []

  const companiesToGenerate = enrichedCompanies.filter(company => {
   const key = company.company?.trim().toUpperCase()
   return key && !companiesWithLead.has(key)
  })

  if (companiesToGenerate.length === 0) {
   toast.warning('Nenhuma alvará disponível', {
    description: 'Todas os alvarás enriquecidos já possuem lead gerado.'
   })
   return
  }

  const leadsToCreate: LeadRequest[] = companiesToGenerate.map(company => {
   const validityDate = company.validity
    ? new Date(company.validity)
    : new Date()

   const nextActionDate = new Date(validityDate)
   nextActionDate.setDate(nextActionDate.getDate() + 1)

   return {
    company: company.company,
    cep: company.cep || '',
    address: company.address || '',
    number: company.number || '',
    complement: company.complement || '',
    city: company.city || '',
    service: company.service || '',
    validity: toDateOnly(company.validity) || '',
    phone: company.phone || '',
    cnpj: company.cnpj || '',
    email: company.email || '',
    license: company.license,
    expiration_date: toDateOnly(company.validity) || '',
    next_action: nextActionDate.toISOString().split('T')[0],
    district: company.district || '',
    occupation: company.occupation || '',
    website: company.website || '',
    contact: company.contact || '',
    attachments: [],
    status: 'Lead'
   }
  })

  saveLeads.mutate(leadsToCreate)
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

 const companiesWithLead = useMemo<Set<string>>(() => {
  return new Set(
   (leadsDB.data ?? [])
    .map(lead => lead.company?.trim().toUpperCase())
    .filter((company): company is string => Boolean(company))
  )
 }, [leadsDB.data])

 useEffect(() => {
  refetchCompanies()
 }, [refetchCompanies])

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
    <h1 className="text-3xl font-bold text-foreground">
     Busca de Dados da Empresa
    </h1>
    <CompaniesActions
     generateAllLeads={generateAllLeads}
     onNewCompanyClick={() => setIsNewCompanyModalOpen(true)}
     onImportClick={() => setIsImportModalOpen(true)}
     generateAllLeads={generateAllLeads}
    />
   </div>

   {/* Filtros */}
   <CompaniesFilters
    city={city}
    setCity={setCity}
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    selectedStatus={selectedFilter}
    setSelectedStatus={setSelectedFilter}
    selectedType={selectedType}
    setSelectedType={setSelectedType}
    dateRange={dateRange}
    setDateRange={setDateRange}
   />

   {/* Tabela de Empresas */}
   {!isLoading && (
    <CompaniesTable
     companies={filteredCompanies}
     enhanceData={enhanceData}
     processingEnrichment={processingEnrichment}
     gererateNewLead={gererateNewLead}
     companiesWithLead={companiesWithLead}
     loadingCompanyId={loadingCompanyId}
     onCompanyClick={company => {
      setSelectedCompany(company)
      setIsCompanyDetailsModalOpen(true)
     }}
     onDeleteCompany={company => {
      setSelectedCompany(company)
      setIsDeleteCompanyModalOpen(true)
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

   <DeleteCompanyModal
    isOpen={isDeleteCompanyModalOpen}
    onClose={() => setIsDeleteCompanyModalOpen(false)}
    company={selectedCompany}
   />
  </div>
 )
}
