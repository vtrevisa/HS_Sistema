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

export interface Alvara {
  id: number;
  city: string;
  year: number;
  month: string;
  avcb: number;
  clcb: number;
  total_per_month: number;
  insert_date: string;
  update_date: string;
}

export interface SearchAlvarasPayload {
  city: string;
  selectedTypeFilter: "Todos" | "AVCB" | "CLCB";
  from: { year: number; month: string };
  to: { year: number; month: string };
}

export interface ReleasePayload {
  totalToRelease: number
  city: string
  service_type: "AVCB" | "CLCB" | "Todos"
  period_start: string
  period_end: string
}

export interface AlvarasFake {
  id: number;
  service: string;
  endDate: Date;
  address: string;
  occupation: string;
}