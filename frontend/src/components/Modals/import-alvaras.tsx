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
import type { LeadRequest } from '@/http/types/leads'
import type { ExcelAlvara } from '@/http/types/alvaras'

interface ImportAlvarasModalProps {
 isOpen: boolean
 onClose: () => void
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 onImportComplete: (leads: any[]) => void
}

export function ImportAlvarasModal({
 isOpen,
 onClose,
 onImportComplete
}: ImportAlvarasModalProps) {
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

 async function loadRawAlvaras() {
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
   const rawAlvaras = (await loadRawAlvaras()) as ExcelAlvara[]

   if (!rawAlvaras || rawAlvaras.length === 0) {
    throw new Error('Nenhum dado encontrado na planilha')
   }

   const processedAlvaras: LeadRequest[] = rawAlvaras.map(lead => ({
    company: '',
    service: lead.service || lead.type || '',
    license: lead.license || lead.license || '',
    validity: lead.validity || lead.vigencia || '',
    expiration_date: lead.expiration_date || lead.vencimento || '',
    next_action: lead.next_action || lead.nextAction || '',
    status: 'pendente',
    address: lead.address || '',
    number: lead.number || lead.numero || '',
    city: lead.city || lead.municipio || '',
    district: lead.district || lead.bairro || '',
    occupation: lead.occupation || lead.occupation,
    complement: lead.complement || lead.complemento || ''
   }))

   onImportComplete(processedAlvaras)

   setImportStatus('success')

   toast.success('Importação concluída!', {
    description:
     processedAlvaras.length === 1
      ? '1 alvará importado, salvando no sistema...'
      : `${processedAlvaras.length} alvarás importados, salvando no sistema...`,
    duration: 3000
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
      Importar Alvarás
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
          <p className="text-sm text-muted-foreground">
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
          <span>Processando alvarás...</span>
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
         className="bg-green-600 hover:bg-green-700 dark:text-white"
        >
         {isLoading ? (
          <>
           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
           Importando..
          </>
         ) : (
          <>
           <Download className="h-4 w-4 mr-2" />
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
        Os alvarás foram importados com os dados especificados.
       </p>
      </div>
     )}

     {importStatus === 'error' && (
      <div className="text-center py-6">
       <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
       <h3 className="text-lg font-semibold text-muted-foreground mb-2">
        Erro na Importação
       </h3>
       <p className="text-muted-foreground mb-4">
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
