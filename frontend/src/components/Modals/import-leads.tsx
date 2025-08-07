import { useState } from 'react'
import { toast } from 'sonner'
import {
 Dialog,
 DialogContent,
 DialogTitle,
 DialogDescription,
 DialogHeader
} from '../ui/dialog'
import {
 AlertCircle,
 Download,
 FileSpreadsheet,
 Link,
 Upload
} from 'lucide-react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Alert, AlertDescription } from '../ui/alert'
import { useDataEnrichment } from '@/hooks/useDataEnrichment'

interface ImportLeadsModalProps {
 isOpen: boolean
 onClose: () => void
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 onImportComplete: (leads: any[]) => void
}

export function ImportLeadsModal({
 isOpen,
 onClose,
 onImportComplete
}: ImportLeadsModalProps) {
 const [sheetsUrl, setSheetsUrl] = useState('')
 const [selectedFile, setSelectedFile] = useState<File | null>(null)
 const [importType, setImportType] = useState<'sheets' | 'excel'>('sheets')
 const [isLoading, setIsLoading] = useState(false)
 const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>(
  'idle'
 )
 const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })

 const { enrichCompanyData, config } = useDataEnrichment()

 console.log(importProgress)

 function handleClose() {
  if (!isLoading) {
   onClose()
   setImportStatus('idle')
   setSheetsUrl('')
   setSelectedFile(null)
   setImportProgress({ current: 0, total: 0 })
  }
 }

 async function loadRawLeads() {
  if (importType === 'sheets') {
   const sheetId = extractSheetId(sheetsUrl)
   if (!sheetId) throw new Error('URL inválida do Google Sheets.')
   return await fetchGoogleSheetData(sheetId)
  } else {
   return await readExcelFile(selectedFile!)
  }
 }

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 async function enrichLeads(leads: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enriched: any[] = []

  for (let i = 0; i < leads.length; i++) {
   const lead = leads[i]
   setImportProgress({ current: i + 1, total: leads.length })

   try {
    let enrichedLead = { ...lead, id: Date.now() + i }

    if (config && enrichCompanyData && lead.enderecoParaBusca) {
     let data = await enrichCompanyData(lead.enderecoParaBusca)

     if (!data?.cnpj && !data?.phone) {
      data = await enrichCompanyData(lead.company)
     }

     if (data) {
      enrichedLead = {
       ...enrichedLead,
       company:
        data.company?.length > lead.company.length
         ? data.company
         : lead.company,
       cnpj: data.cnpj || enrichedLead.cnpj,
       phone: data.phone || enrichedLead.phone,
       email: data.email || enrichedLead.email,
       website: data.website || enrichedLead.website,
       address: data.address || enrichedLead.address
      }
     }

     await new Promise(resolve => setTimeout(resolve, 500)) // delay para evitar rate limit
    }

    delete enrichedLead.enderecoParaBusca
    enriched.push(enrichedLead)
   } catch (err) {
    console.error(`Erro ao enriquecer ${lead.company}:`, err)
    const { enderecoParaBusca, ...fallbackLead } = lead
    enriched.push({ ...fallbackLead, id: Date.now() + i })
   }
  }

  return enriched
 }

 function resetImportStateAfterDelay() {
  setTimeout(() => {
   onClose()
   setImportStatus('idle')
   setSheetsUrl('')
   setSelectedFile(null)
   setImportProgress({ current: 0, total: 0 })
  }, 3000)
 }

 function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0]
  if (file) {
   const fileExtension = file.name.toLowerCase()
   if (fileExtension.endsWith('.xlsx') || fileExtension.endsWith('.xls')) {
    setSelectedFile(file)
    console.log('Arquivo Excel selecionado:', file.name)
   } else {
    toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)')
   }
  }
 }

 async function handleImport() {
  // Validação inicial
  if (
   (importType === 'sheets' && !sheetsUrl) ||
   (importType === 'excel' && !selectedFile)
  ) {
   toast.error(
    importType === 'sheets'
     ? 'Por favor, insira a URL da planilha do Google Sheets'
     : 'Por favor, selecione um arquivo Excel'
   )
   return
  }

  setIsLoading(true)
  setImportProgress({ current: 0, total: 0 })

  try {
   const rawLeads = await loadRawLeads()
   if (rawLeads.length === 0)
    throw new Error('Nenhum dado encontrado na planilha')

   const leadsWithCompany = rawLeads.filter(lead => !!lead.company)
   setImportProgress({ current: 0, total: leadsWithCompany.length })

   const enrichedLeads = await enrichLeads(leadsWithCompany)

   onImportComplete(enrichedLeads)
   setImportStatus('success')

   const enrichedCount = enrichedLeads.filter(
    lead => lead.cnpj || lead.phone || lead.email || lead.website
   ).length

   toast.success('Importação Concluída', {
    description: config
     ? `${enrichedLeads.length} leads importados! ${enrichedCount} enriquecidos via API.`
     : `${enrichedLeads.length} leads importados! Configure as APIs para enriquecimento automático.`
   })

   resetImportStateAfterDelay()
  } catch (error) {
   console.error('Erro na importação:', error)
   setImportStatus('error')

   toast.error('Erro na Importação', {
    description:
     error instanceof Error ? error.message : 'Erro desconhecido na importação'
   })
  } finally {
   setIsLoading(false)
  }
 }

 return (
  <Dialog open={isOpen} onOpenChange={handleClose}>
   <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
     <DialogTitle className="flex items-center gap-2">
      <Upload className="h-5 w-5 text-green-600" />
      Importar Leads
     </DialogTitle>
     <DialogDescription>
      Escolha entre importar de uma planilha do Google Sheets ou fazer upload de
      um arquivo Excel.
     </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
     <>
      <div className="flex gap-2 mb-4">
       <Button
        variant={importType === 'sheets' ? 'default' : 'outline'}
        onClick={() => setImportType('sheets')}
        className="flex-1"
        disabled={isLoading}
       >
        <Link className="h-4 w-4 mr-2" />
        Google Sheets
       </Button>
       <Button
        variant={importType === 'excel' ? 'default' : 'outline'}
        onClick={() => setImportType('excel')}
        className="flex-1"
        disabled={isLoading}
       >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Arquivo Excel
       </Button>
      </div>

      {importType === 'sheets' ? (
       <div className="space-y-2">
        <Label htmlFor="sheets-url">URL da Planilha do Google Sheets</Label>
        <Input
         id="sheets-url"
         type="url"
         placeholder="https://docs.google.com/spreadsheets/d/..."
         value={sheetsUrl}
         onChange={e => setSheetsUrl(e.target.value)}
         disabled={isLoading}
        />
       </div>
      ) : (
       <div className="space-y-2">
        <Label htmlFor="excel-file">Arquivo Excel (.xlsx ou .xls)</Label>
        <Input
         id="excel-file"
         type="file"
         accept=".xlsx,.xls"
         onChange={handleFileSelect}
         disabled={isLoading}
        />
        {selectedFile && (
         <p className="text-sm text-gray-600">
          Arquivo selecionado: {selectedFile.name}
         </p>
        )}
       </div>
      )}

      <Alert>
       <AlertCircle className="h-4 w-4" />
       <AlertDescription>
        <strong>Campos reconhecidos:</strong> Empresa/Estabelecimento, CNPJ,
        Email, Telefone/WhatsApp, Endereço (completo), Tipo de Serviço (AVCB,
        CLCB, PPCI, etc.), Vigência/Validade, Ocupação, Valor do Serviço.
        <br />
        <strong>Enriquecimento automático:</strong> CNPJ, Site, Email e WhatsApp
        clique no botão atualizar.
       </AlertDescription>
      </Alert>

      <div className="flex justify-between gap-3">
       <Button variant="outline" onClick={handleClose} disabled={isLoading}>
        Cancelar
       </Button>
       <Button
        onClick={handleImport}
        disabled={
         isLoading || (importType === 'sheets' ? !sheetsUrl : !selectedFile)
        }
        className="bg-green-600 hover:bg-green-700"
       >
        {isLoading ? (
         <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {config ? 'Enriquecendo...' : 'Importando...'}
         </>
        ) : (
         <>
          <Download className="h-4 w-4 mr-2" />
          {config ? 'Importar e Enriquecer' : 'Importar Dados'}
         </>
        )}
       </Button>
      </div>
     </>
    </div>
   </DialogContent>
  </Dialog>
 )
}
