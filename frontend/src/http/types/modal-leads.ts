export interface ModalLeads {
  id: number | undefined;
  company: string;
  type: string;
  license: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  numero?: string;
  complemento?: string;
  municipio?: string;
  bairro?: string;
  cep: string;
  occupation: string;
  status: string;
  vencimento: string;
  nextAction: string;
  website?: string;
  cnpj?: string;
  vigencia?: string;
  valorServico?: string;
}