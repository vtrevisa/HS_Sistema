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
 CheckCircle,
 Download,
 FileSpreadsheet,
 Link,
 Upload
} from 'lucide-react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Alert, AlertDescription } from '../ui/alert'
import {
 extractSheetId,
 fetchGoogleSheetData,
 readExcelFile
} from '@/services/leads'
import type { ExcelLead, LeadRequest } from '@/http/types/leads'

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
   if (!sheetId)
    throw new Error('URL inválida. Use uma URL do Google Sheets válida.')
   return await fetchGoogleSheetData(sheetId)
  } else {
   return await readExcelFile(selectedFile!)
  }
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

  if (importType === 'sheets' && !sheetsUrl) {
   toast.error('Por favor, insira a URL da planilha do Google Sheets')
   return
  }

  if (importType === 'excel' && !selectedFile) {
   toast.error('Por favor, selecione um arquivo Excel')
   return
  }

  setIsLoading(true)
  setImportProgress({ current: 0, total: 0 })
  console.log(
   `Iniciando importação ${importType === 'sheets' ? 'Google Sheets' : 'Excel'}`
  )

  try {
   const rawLeads = (await loadRawLeads()) as ExcelLead[]
   if (rawLeads.length === 0)
    throw new Error('Nenhum dado encontrado na planilha')

   const leadRequests: LeadRequest[] = rawLeads.map(lead => ({
    empresa: lead.empresa || '',
    tipo: lead.tipo || lead.type || '',
    licenca: lead.licenca || lead.license || '',
    vigencia: lead.vigencia || '',
    vencimento: lead.vencimento || '',
    proxima_acao: lead.proxima_acao || '',
    status: lead.status || '',
    endereco: lead.address || '',
    numero: lead.numero,
    municipio: lead.municipio || '',
    bairro: lead.bairro || '',
    ocupacao: lead.ocupacao || lead.occupation,
    complemento: lead.complemento
   }))

   onImportComplete(rawLeads)
   setImportStatus('success')

   const importedCount = rawLeads.length

   toast.success('Importação Concluída', {
    description:
     importedCount === 1
      ? `${importedCount} lead importado!`
      : `${importedCount} leads importados!`,
    duration: 3000
   })

   await new Promise(resolve => setTimeout(resolve, 3000))

   const count = leadRequests.length

   toast.success(
    count === 1
     ? '1 lead foi salvo com sucesso!'
     : `Todos os ${count} leads foram salvos com sucesso!`
   )

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
     {importStatus === 'idle' && (
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
         <strong>Enriquecimento automático:</strong> CNPJ, Site, Email e
         WhatsApp clique no botão atualizar.
        </AlertDescription>
       </Alert>

       {isLoading && importProgress.total > 0 && (
        <div className="space-y-2">
         <div className="flex justify-between text-sm">
          {/* <span>
           {config
            ? 'Processando e enriquecendo leads...'
            : 'Processando leads...'}
          </span> */}
          <span>Processando leads...</span>
          <span>
           {importProgress.current}/{importProgress.total}
          </span>
         </div>
         <div className="w-full bg-gray-200 rounded-full h-2">
          <div
           className="bg-green-600 h-2 rounded-full transition-all duration-300"
           style={{
            width: `${(importProgress.current / importProgress.total) * 100}%`
           }}
          />
         </div>
        </div>
       )}

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
           {/* {config ? 'Enriquecendo...' : 'Importando...'} */}
           Importando..
          </>
         ) : (
          <>
           <Download className="h-4 w-4 mr-2" />
           {/* {config ? 'Importar e Enriquecer' : 'Importar Dados'} */}
           Importar Dados
          </>
         )}
        </Button>
       </div>
      </>
     )}

     {importStatus === 'success' && (
      <div className="text-center py-6">
       <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
       <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Importação Concluída!
       </h3>
       <p className="text-gray-600">
        Os leads foram importados com os dados especificados.
        {/* {config && ' Dados enriquecidos via APIs reais.'} */}
       </p>
      </div>
     )}

     {importStatus === 'error' && (
      <div className="text-center py-6">
       <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
       <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Erro na Importação
       </h3>
       <p className="text-gray-600 mb-4">
        Verifique se a planilha está pública e se a URL está correta.
       </p>
       <Button variant="outline" onClick={() => setImportStatus('idle')}>
        Tentar Novamente
       </Button>
      </div>
     )}
    </div>
   </DialogContent>
  </Dialog>
 )
}
