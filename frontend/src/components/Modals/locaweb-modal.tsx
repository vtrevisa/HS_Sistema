import React, { useEffect, useState } from 'react'
import { useSmtp } from '../../http/use-Smtp'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

export function LocawebModal({
 isOpen,
 onClose
}: {
 isOpen: boolean
 onClose: () => void
}) {
 const [testing, setTesting] = useState(false)
 const [saving, setSaving] = useState(false)
 const [feedback, setFeedback] = useState<{
  type: 'success' | 'error'
  message: string
 } | null>(null)
 const [advanced, setAdvanced] = useState(false)

 interface FormState {
  host: string
  port: number
  encryption: string // permite "", "tls", "ssl" para o bind do select
  username: string
  password: string
  from_email: string
  from_name: string
  provider?: 'locaweb' | 'yahoo' | ''
 }

 const { config, loading, testConnection, save, disconnect } = useSmtp()
 const [form, setForm] = useState<FormState>({
  host: '',
  port: 465,
  encryption: 'ssl',
  username: '',
  password: '',
  from_email: '',
  from_name: '',
  provider: ''
 })

 useEffect(() => {
  if (config) {
   setForm({
    host: config.host,
    port: config.port,
    encryption: config.encryption || '',
    username: config.username,
    password: '',
    from_email: config.from_email,
    from_name: config.from_name || ''
   })
  }
 }, [config])

 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
 ) => {
  setForm({ ...form, [e.target.name]: e.target.value })
 }

 const handleTest = async () => {
  setTesting(true)
  setFeedback(null)
  const testData = {
   host: form.host,
   port: form.port,
   encryption:
    form.encryption === '' ? null : (form.encryption as 'tls' | 'ssl'),
   username: form.username,
   password: form.password
  }
  const result = await testConnection(testData)
  if (result.success) {
   setFeedback({ type: 'success', message: 'Conexão SMTP bem-sucedida!' })
  } else {
   setFeedback({
    type: 'error',
    message: result.error || 'Falha na conexão SMTP'
   })
  }
  setTesting(false)
 }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSaving(true)
  setFeedback(null)
  console.log(
   'Dados do formulário para salvar SMTP:',
   form,
   'Provedor selecionado:',
   (form as any).provider
  )
  const submitData = {
   host:
    (form as any).provider === 'locaweb'
     ? 'email-ssl.com.br'
     : (form as any).provider === 'yahoo'
       ? 'imap.mail.yahoo.com'
       : form.host,
   port:
    (form as any).provider === 'locaweb'
     ? 465
     : (form as any).provider === 'yahoo'
       ? 993
       : form.port,
   encryption:
    (form as any).provider === 'locaweb' || (form as any).provider === 'yahoo'
     ? 'ssl'
     : form.encryption === ''
       ? null
       : (form.encryption as 'tls' | 'ssl'),
   username: form.username,
   password: form.password,
   from_email: form.from_email,
   from_name: form.from_name || null
  }

  const result = await save(submitData)
  if (result.success) {
   setSaving(false)
   onClose()
   alert('Configuração SMTP salva com sucesso!')
  } else {
   setFeedback({
    type: 'error',
    message: result.error || 'Erro ao salvar configuração SMTP'
   })
  }
 }

 const handleDisconnect = async () => {
  if (!window.confirm('Tem certeza que deseja desconectar o SMTP?')) return
  const result = await disconnect()
  if (result.success) {
   setFeedback({ type: 'success', message: 'SMTP desconectado com sucesso!' })
   setForm({
    host: '',
    port: 587,
    encryption: 'tls',
    username: '',
    password: '',
    from_email: '',
    from_name: ''
   })
  }

  if (loading) return <div>Carregando...</div>
 }
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent className="max-w-lg">
    <DialogHeader>
     <DialogTitle>Configuração SMTP (Locaweb / Outros)</DialogTitle>
    </DialogHeader>
    {feedback && (
     <div
      className={`p-3 mb-4 rounded ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
     >
      {feedback.message}
     </div>
    )}
    <form onSubmit={handleSubmit} className="space-y-4">
     <div className="grid grid-cols-2 gap-4">
      <div>
       <label className="block text-sm font-medium mb-1">
        Usuário (e-mail)
       </label>
       <input
        type="email"
        name="username"
        value={form.username}
        onChange={handleChange}
        className="w-full border rounded-md px-3 py-2"
        required
       />
      </div>
      <div>
       <label className="block text-sm font-medium mb-1">Senha</label>
       <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder={config ? '•••••••• (deixe em branco para manter)' : ''}
        className="w-full border rounded-md px-3 py-2"
        required={!config}
       />
      </div>
      <div>
       <label className="block text-sm font-medium mb-1">
        E-mail de origem (From)
       </label>
       <input
        type="email"
        name="from_email"
        value={form.from_email}
        onChange={handleChange}
        className="w-full border rounded-md px-3 py-2"
        required
       />
      </div>
      <div>
       <label className="block text-sm font-medium mb-1">
        Nome de origem (opcional)
       </label>
       <input
        type="text"
        name="from_name"
        value={form.from_name}
        onChange={handleChange}
        className="w-full border rounded-md px-3 py-2"
       />
      </div>
      {!advanced && (
       <div>
        <label className="block text-sm font-medium mb-1">Provedor</label>
        <select
         name="provider"
         value={(form as any).provider}
         onChange={handleChange}
         className="w-full border rounded-md px-3 py-2"
        >
         <option value="">Selecione</option>
         <option value="locaweb">Locaweb</option>
         <option value="yahoo">Yahoo</option>
        </select>
       </div>
      )}
     </div>
     {advanced && (
      <div>
       <div>
        <label className="block text-sm font-medium mb-1">Servidor SMTP</label>
        <input
         type="text"
         name="host"
         value={form.host}
         onChange={handleChange}
         placeholder="email-ssl.com.br"
         className="w-full border rounded-md px-3 py-2"
         required
        />
       </div>
       <div>
        <label className="block text-sm font-medium mb-1">Porta</label>
        <input
         type="number"
         name="port"
         value={form.port}
         onChange={handleChange}
         className="w-full border rounded-md px-3 py-2"
         required
        />
       </div>
       <div>
        <label className="block text-sm font-medium mb-1">Criptografia</label>
        <select
         name="encryption"
         value={form.encryption}
         onChange={handleChange}
         className="w-full border rounded-md px-3 py-2"
        >
         <option value="tls">TLS</option>
         <option value="ssl">SSL</option>
         <option value="">Nenhuma</option>
        </select>
       </div>
      </div>
     )}
     <div className="flex items-center justify-between pt-2">
      <div className="flex items-center space-x-2">
       <input
        id="advanced"
        type="checkbox"
        checked={advanced}
        onChange={() => setAdvanced(!advanced)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
       />
       <label htmlFor="advanced" className="text-sm text-muted-foreground">
        Configuração avançada
       </label>
      </div>

      <div className="flex items-center space-x-3">
       <button
        type="button"
        onClick={handleTest}
        disabled={testing}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
       >
        {testing ? 'Testando...' : 'Testar Conexão'}
       </button>

       <button
        type="submit"
        onClick={handleSubmit}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
       >
        {saving ? 'Salvando...' : 'Salvar Configuração'}
       </button>

       {config && (
        <button
         type="button"
         onClick={handleDisconnect}
         className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
         Desconectar
        </button>
       )}
      </div>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}
