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



export type LeadStatus =
  | "lead"
  | "primeiro-contato"
  | "follow-up"
  | "proposta-enviada"
  | "cliente-fechado"
  | "arquivado"

export interface LeadRequest {
  id?: number;
  company?: string;
  service: string;
  license: string;
  validity: string;
  expiration_date: string;
  next_action: string;
  service_value?: string
  address: string;
  number?: string;
  city: string;
  district: string;
  occupation?: string;
  status: string;
  complement?: string;
  cep?: string;
  contact?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  website?: string;
  categoria?: string;
  created_at?: string
  updated_at?: string

}

export interface LeadResponse {
  status: LeadStatus | string
  lead: LeadRequest
  message: string
}