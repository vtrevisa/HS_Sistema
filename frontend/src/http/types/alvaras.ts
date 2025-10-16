export interface ExcelAlvara {
  id?: number
  company?: string
  service?: string
  cnpj?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  municipio?: string
  numero?: string
  complemento?: string
  enderecoParaBusca?: string
  nextAction?: string
  vigencia?: string
  vencimento?: string
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}