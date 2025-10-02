export interface AddressRequest {
  address: string;
}

export interface AddressResponse {
  places: {
    endereco: string;
    telefone: string | null;
    cnpj: string | null;
    nome_empresa: string | null;
    dados_oficiais?: {
      razao_social?: string | null;
      email?: string | null;
    };
  }[];
}

export interface CompanyRequest {
  id: number;
  status: string;
  company: string;
  cep: string;
  address: string;
  number?: string | null;
  state: string;
  city: string;
  service: string;
  validity: string;
  phone?: string | null;
  cnpj?: string | null;
  email?: string | null;
  enriched?: boolean;
}

export interface CnpjResponse {
 cnpj: string | null
 razao_social: string | null
 nome_fantasia: string | null
 email: string | null
 telefone: string | null
}