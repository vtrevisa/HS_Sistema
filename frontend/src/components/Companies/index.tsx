import { useEffect, useMemo, useState, useRef } from 'react'
import { CompaniesActions } from './companies-actions'
import { CompaniesTable } from './companies-table'
import { NewCompanyModal } from '../Modals/new-company'
import { useCompany } from '@/http/use-company'
import type { CompanyRequest } from '@/http/types/companies'
import type { LeadRequest } from '@/http/types/leads'
import { CompanyDetailsModal } from '../Modals/company-details'
import { ImportAlvarasModal } from '../Modals/import-alvaras'
import { useLead } from '@/http/use-lead'
import { DeleteCompanyModal } from '../Modals/delete-company'
import { toast } from "sonner"
import type { DateRange } from 'react-day-picker'

export function Companies() {
 //--------useStates--------//
 const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false)
 const [selectedCompany, setSelectedCompany] = useState<CompanyRequest | null>( null)
 const [isCompanyDetailsModalOpen, setIsCompanyDetailsModalOpen] = useState(false)
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

  // Filter leads from context
  const filteredCompanies = useMemo(() => {
   const from = dateRange?.from
   const to = dateRange?.to
   console.log("Date range from: ", from, " to: ", to);
   return leads.filter(company => {
    
    const matchesStatus =
     selectedStatus === 'todos' ? true : company.status === selectedStatus
    
    if (!matchesStatus) return false
    if (!from && !to) return true
    if (!company.validity) return true
    
    const validityDate = new Date(company.validity)
    console.log('Company Validity:', company.validity)
    const validityDay = new Date(
      validityDate.getFullYear(),
      validityDate.getMonth(),
      validityDate.getDate())
    console.log('validityDay:', validityDay)
    const fromDay = from ? new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate()) : null
    console.log('fromDay:', fromDay)
    const toDay = to ? new Date(
      to.getFullYear(),
      to.getMonth(),
      to.getDate()) : null 
    console.log('toDay:', toDay)

    if (fromDay && toDay) {
      return validityDay >= fromDay && validityDay <= toDay
    }
 
    return true
   })
  }, [leads, selectedStatus, dateRange?.from, dateRange?.to])

 // Create new company
 function handleNewCompany(companyData: Omit<CompanyRequest, 'id'>) {
  saveCompanies.mutate([companyData])
 }

 // Generate new company (turn it into a lead)
 function generateNewLead(company: CompanyRequest) {

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

//Function to generate all Leads
const generateAllLeads = async () => {
   const pendingCompanies = companiesDB.data?.filter(
      company => company.status === "enriquecido") ?? [];

   if (pendingCompanies.length === 0) {
      toast.warning("Nenhuma empresa Pendente", {
         description: "Todos as empresas enriquecidas já viraram leads.",
      });
      return;
   }

   const waitForLoadingStart = (targetId: string | number | null, intervalMs = 150) => {
      return new Promise<void>((resolve) => {
         const check = () => {
            if (loadingCompanyIdRef.current === targetId) {resolve(); return;}
            setTimeout(check, intervalMs);
         }
         check()
      })
   }

   const waitForLoadingNull = (/* timeoutMs = 10000, */ intervalMs = 200) => {
      return new Promise<void>((resolve) => {
         /* const start = Date.now(); */
         const check = () => {
            if (loadingCompanyIdRef.current === null) {resolve(); return;}
            /* if (Date.now() - start > timeoutMS) { resolve(); return;} */
            setTimeout(check, intervalMs);
         }
         check()
      })
   }

   for (const company of pendingCompanies) {
      generateNewLead(company);
      await waitForLoadingStart(company.id);
      await waitForLoadingNull();
      await new Promise(r => setTimeout(r, 150));
   }

   toast.success("Leads gerados com sucesso.");
};

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

 useEffect(() => {
  refetchCompanies()
 }, [refetchCompanies])

 return (
  <div className="p-4 lg:p-6 space-y-6">
   <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-2">
    <h1 className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-white">
     Busca de Dados da Empresa
    </h1>
    <CompaniesActions
     onNewCompanyClick={() => setIsNewCompanyModalOpen(true)}
     onImportClick={() => setIsImportModalOpen(true)}
     generateAllLeads={generateAllLeads}
    />
   </div>
   {/* Tabela de Empresas */}
   {!isLoading && (
    <CompaniesTable
     companies={filteredCompanies}
     selectedStatus={selectedStatus}
     setSelectedStatus={setSelectedStatus}
     enhanceData={enhanceData}
     processingEnrichment={processingEnrichment}
     generateNewLead={generateNewLead}
     loadingCompanyId={loadingCompanyId}
     onCompanyClick={company => {
      setSelectedCompany(company)
      setIsCompanyDetailsModalOpen(true)
     }}
     onDeleteCompany={company => {
      setSelectedCompany(company)
      setIsDeleteCompanyModalOpen(true)} 
     }
     dateRange={dateRange}
     setDateRange={setDateRange}
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
