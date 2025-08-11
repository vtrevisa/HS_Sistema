export interface Lead {
 id?: number | undefined
 company: string
 type: string
 license: string
 contact: string
 phone: string
 email: string
 address: string
 numero?: string
 complemento?: string
 municipio?: string
 bairro?: string
 cep: string
 occupation: string
 status: string
 vencimento: string
 nextAction: string
 website?: string
 cnpj?: string
 vigencia?: string;
 valorServico?: string;
 // Novos campos do Google Places
 place_id?: string
 enderecoFormatado?: string
 enderecoParaBusca?: string
 telefone?: string
 site?: string
 categoria?: string
 nomeComercial?: string
}

export interface ExcelLead {
  id?: number
  company?: string
  cnpj?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  enderecoParaBusca?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
