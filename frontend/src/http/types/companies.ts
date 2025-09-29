export interface CompanyRequest {
  id: number;
  status: string;
  company: string;
  cep: string;
  address: string;
  number?: string;
  state: string;
  city: string;
  service: string;
  validity: string;
  phone?: string;
  cnpj?: string;
  email?: string;
  enriched?: boolean;
}