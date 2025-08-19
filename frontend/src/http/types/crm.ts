export interface Lead {
  id: number;
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
  razaoSocial?: string;
  site?: string;
  endereco?: string;
  createdAt?: string;
  updatedAt?: string;
  daysInStage?: number;
  isOverdue?: boolean;
  // Activity tracking
  activities?: Activity[];
  // File attachments
  attachments?: FileAttachment[];
  // Automations
  emailSent?: boolean;
  whatsappSent?: boolean;
  lastContactDate?: string;
  // Google Places data
  place_id?: string;
  enderecoFormatado?: string;
  telefone?: string;
  categoria?: string;
  nomeComercial?: string;
}

export interface Activity {
  id: string;
  type: 'email' | 'phone' | 'whatsapp' | 'meeting' | 'note' | 'status_change';
  description: string;
  date: string;
  user?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface ArchivedProposal {
  id: number;
  leadId: number;
  company: string;
  type: string;
  valor: number;
  status: 'Ganho' | 'Perdido';
  archivedAt: string;
  reason?: string; // For lost proposals
  processId?: number; // For won proposals
}

export interface ColumnSummary {
  count: number;
  totalValue: number;
}

export const CRM_STATUSES = [
  { id: 'lead', title: 'Lead / Contato', deadline: 7 },
  { id: 'contato-automatico', title: 'Contato Automático', deadline: null },
  { id: 'contato-manual', title: 'Contato Manual', deadline: 30 },
  { id: 'proposta-followup', title: 'Proposta / Follow-UP', deadline: 60 },
  { id: 'cliente-fechado', title: 'Cliente Fechado', deadline: null },
] as const;

export type CRMStatus = typeof CRM_STATUSES[number]['id'];