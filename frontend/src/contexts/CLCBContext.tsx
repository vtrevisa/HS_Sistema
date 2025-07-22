import React, { createContext, useState, useEffect, useContext } from 'react'
import {
 type Checklist,
 CLCB_CHECKLISTS,
 AVCB_CHECKLISTS,
 type BrigadaIncendio
} from '@/http/types/checklist'

export interface Cliente {
 id: number
 nome: string
 cpfCnpj: string
 email: string
 telefone: string
 whatsapp: string
 enderecoCompleto: string
 municipio: string
 bairro: string
 responsavelUso: string
 observacoes: string
 origemLead?: boolean
 leadId?: number
}

export interface DadosProprietario {
 nome: string
 email: string
 contato: string
 cnpjCpf: string
}

export interface DadosResponsavelUso {
 nome: string
 email: string
 contato: string
 cnpjCpf: string
}

export interface DadosImovel {
 servico: 'CLCB' | 'AVCB' | 'PPCI' | 'Instalação'
 validadeAlvara: string
 contatoPrincipal: string
 enderecoCompleto: string
 ocupacao: string
 areaConstruida: number
 altura: number
}

export interface DadosProcesso {
 art: string
 numeroSolicitacao: string
 numeroProjeto: string
 numeroPavimentos: number
 descricao: string
 divisao: string
 cargaIncendio: string
 quantidadeGLP: number
}

export interface ProcessoCLCB {
 id: number
 clienteId: number
 tipoServico: 'CLCB' | 'AVCB' | 'PPCI' | 'Instalação'
 statusGeral:
  | 'Vistoria'
  | 'Cadastro'
  | 'Envio de documentos'
  | 'Análise Corpo de Bombeiros'
  | 'Concluído'
  | 'Arquivado'
 progresso: number
 vencimento: string
 valorServico: number
 responsavelInterno: string
 dataAbertura: string
 createdAt: string
 etapaAtual?: string
 observacoes?: string
 imagemProcesso?: string
 dadosFixosPreenchidos: boolean
 dadosProprietario?: DadosProprietario
 dadosResponsavelUso?: DadosResponsavelUso
 dadosImovel?: DadosImovel
 dadosProcesso?: DadosProcesso
 checklists?: Checklist[]
 brigadaIncendio?: BrigadaIncendio
}

export interface CLCBContextType {
 clientes: Cliente[]
 processos: ProcessoCLCB[]
 addCliente: (cliente: Omit<Cliente, 'id'>) => Cliente
 updateCliente: (id: number, cliente: Partial<Cliente>) => void
 deleteCliente: (id: number) => void
 addProcesso: (processo: Omit<ProcessoCLCB, 'id' | 'createdAt'>) => void
 updateProcesso: (id: number, processo: Partial<ProcessoCLCB>) => void
 deleteProcesso: (id: number) => void
 getProcessosByStatus: (status: string) => ProcessoCLCB[]
 getProcessosVencendo: (dias: number) => ProcessoCLCB[]
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 createClienteFromLead: (leadData: any) => Cliente
 updateChecklistItem: (
  processoId: number,
  checklistId: string,
  itemId: string,
  concluido: boolean
 ) => void
 updateBrigadaIncendio: (
  processoId: number,
  brigadaData: Partial<BrigadaIncendio>
 ) => void
}

const CLCBContext = createContext<CLCBContextType | undefined>(undefined)

export const CLCBProvider: React.FC<{ children: React.ReactNode }> = ({
 children
}) => {
 const [clientes, setClientes] = useState<Cliente[]>([])
 const [processos, setProcessos] = useState<ProcessoCLCB[]>([])

 // Cliente
 const addCliente = (cliente: Omit<Cliente, 'id'>): Cliente => {
  const novoCliente: Cliente = { ...cliente, id: Date.now() }
  setClientes(prev => [...prev, novoCliente])
  return novoCliente
 }

 const updateCliente = (id: number, clienteUpdate: Partial<Cliente>) => {
  setClientes(prev =>
   prev.map(cliente =>
    cliente.id === id ? { ...cliente, ...clienteUpdate } : cliente
   )
  )
 }

 const deleteCliente = (id: number) => {
  setClientes(prev => prev.filter(cliente => cliente.id !== id))
 }

 // Processo
 const addProcesso = (processo: Omit<ProcessoCLCB, 'id' | 'createdAt'>) => {
  let checklists: Checklist[] = []
  let brigadaIncendio: BrigadaIncendio | undefined

  if (processo.dadosFixosPreenchidos) {
   if (processo.tipoServico === 'CLCB') {
    checklists = CLCB_CHECKLISTS.map((template, index) => ({
     id: `checklist-${Date.now()}-${index}`,
     ...template
    }))
   } else if (processo.tipoServico === 'AVCB') {
    checklists = AVCB_CHECKLISTS.map((template, index) => ({
     id: `checklist-${Date.now()}-${index}`,
     ...template
    }))
    brigadaIncendio = {
     dataTreinamento: '',
     nivelTreinamento: 'Básico',
     instrutor: {
      nome: '',
      cpf: '',
      dataNascimento: '',
      email: '',
      telefone: ''
     },
     brigadistas: []
    }
   }
  }

  const novoProcesso: ProcessoCLCB = {
   ...processo,
   id: Date.now(),
   etapaAtual: processo.etapaAtual || 'Cadastro de dados fixos',
   statusGeral: processo.statusGeral || 'Vistoria',
   progresso: 0,
   observacoes: processo.observacoes || '',
   createdAt: new Date().toISOString(),
   checklists,
   brigadaIncendio
  }
  setProcessos(prev => [...prev, novoProcesso])
 }

 const updateProcesso = (id: number, processoUpdate: Partial<ProcessoCLCB>) => {
  setProcessos(prev =>
   prev.map(processo =>
    processo.id === id ? { ...processo, ...processoUpdate } : processo
   )
  )
 }

 const deleteProcesso = (id: number) => {
  setProcessos(prev => prev.filter(processo => processo.id !== id))
 }

 // Filtros
 const getProcessosByStatus = (status: string): ProcessoCLCB[] => {
  return processos.filter(p => p.statusGeral === status)
 }

 const getProcessosVencendo = (dias: number): ProcessoCLCB[] => {
  const now = new Date()
  const limite = new Date(now.getTime() + dias * 24 * 60 * 60 * 1000)
  return processos.filter(p => {
   const vencimento = new Date(p.vencimento)
   return vencimento >= now && vencimento <= limite
  })
 }

 // Criar cliente a partir de lead
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const createClienteFromLead = (leadData: any): Cliente => {
  const novoCliente: Cliente = {
   id: Date.now(),
   nome: leadData.nome || '',
   cpfCnpj: leadData.cpfCnpj || '',
   email: leadData.email || '',
   telefone: leadData.telefone || '',
   whatsapp: leadData.whatsapp || '',
   enderecoCompleto: leadData.enderecoCompleto || '',
   municipio: leadData.municipio || '',
   bairro: leadData.bairro || '',
   responsavelUso: leadData.responsavelUso || '',
   observacoes: leadData.observacoes || '',
   origemLead: true,
   leadId: leadData.id
  }
  setClientes(prev => [...prev, novoCliente])
  return novoCliente
 }

 // Atualizar item do checklist
 const updateChecklistItem = (
  processoId: number,
  checklistId: string,
  itemId: string,
  concluido: boolean
 ) => {
  setProcessos(prev =>
   prev.map(processo => {
    if (processo.id === processoId && processo.checklists) {
     const updatedChecklists = processo.checklists.map(checklist => {
      if (checklist.id === checklistId) {
       const updatedItems = checklist.items.map(item => {
        if (item.id === itemId) {
         return {
          ...item,
          concluido,
          dataFinalizacao: concluido ? new Date().toISOString() : undefined
         }
        }
        return item
       })
       return { ...checklist, items: updatedItems }
      }
      return checklist
     })

     const newProgress = calculateProgress(updatedChecklists)
     const allCompleted = updatedChecklists.every(cl =>
      cl.items.every(item => item.concluido)
     )

     return {
      ...processo,
      checklists: updatedChecklists,
      progresso: newProgress,
      statusGeral: allCompleted ? 'Concluído' : processo.statusGeral
     }
    }
    return processo
   })
  )
 }

 // Atualizar dados da brigada de incêndio
 const updateBrigadaIncendio = (
  processoId: number,
  brigadaData: Partial<BrigadaIncendio>
 ) => {
  setProcessos(prev =>
   prev.map(processo => {
    if (processo.id === processoId && processo.brigadaIncendio) {
     return {
      ...processo,
      brigadaIncendio: { ...processo.brigadaIncendio, ...brigadaData }
     }
    }
    return processo
   })
  )
 }

 // Função auxiliar para calcular progresso do checklist (%)
 const calculateProgress = (checklists: Checklist[]): number => {
  const totalItems = checklists.reduce(
   (acc, checklist) => acc + checklist.items.length,
   0
  )
  const completedItems = checklists.reduce(
   (acc, checklist) =>
    acc + checklist.items.filter(item => item.concluido).length,
   0
  )
  return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)
 }

 // Sincronização localStorage
 useEffect(() => {
  const clientesSalvos = localStorage.getItem('clcb-clientes')
  const processosSalvos = localStorage.getItem('clcb-processos')

  if (clientesSalvos) {
   setClientes(JSON.parse(clientesSalvos))
  }
  if (processosSalvos) {
   setProcessos(JSON.parse(processosSalvos))
  }
 }, [])

 useEffect(() => {
  localStorage.setItem('clcb-clientes', JSON.stringify(clientes))
 }, [clientes])

 useEffect(() => {
  localStorage.setItem('clcb-processos', JSON.stringify(processos))
 }, [processos])

 const value: CLCBContextType = {
  clientes,
  processos,
  addCliente,
  updateCliente,
  deleteCliente,
  addProcesso,
  updateProcesso,
  deleteProcesso,
  getProcessosByStatus,
  getProcessosVencendo,
  createClienteFromLead,
  updateChecklistItem,
  updateBrigadaIncendio
 }

 return <CLCBContext.Provider value={value}>{children}</CLCBContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCLCB = () => {
 const context = useContext(CLCBContext)
 if (context === undefined) {
  throw new Error('useCLCB must be used within a CLCBProvider')
 }
 return context
}
