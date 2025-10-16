export interface AddressRequest {
  address: string;
}

export interface AddressResponse {
  places: {
    endereco: string;
    telefone: string | null;
    cnpj: string | null;
    nome_empresa: string | null;
    site: string | null;
    dados_oficiais?: {
      razao_social?: string | null;
      email?: string | null;
      qsa_nomes?: string[]
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
  complement?: string;
  state?: string;
  city: string;
  district: string;
  service: string;
  license: string;
  occupation?: string;
  validity: string;
  website?: string | null;
  contact?: string;
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
 qsa_nomes?: string[]

}