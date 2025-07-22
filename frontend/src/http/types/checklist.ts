
export interface ChecklistItem {
  id: string;
  titulo: string;
  concluido: boolean;
  dataFinalizacao?: string;
}

export interface Checklist {
  id: string;
  nome: string;
  ordem: number;
  items: ChecklistItem[];
}

export interface Brigadista {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: string;
}

export interface BrigadaIncendio {
  dataTreinamento: string;
  nivelTreinamento: 'Básico' | 'Intermediário' | 'Avançado';
  instrutor: {
    nome: string;
    cpf: string;
    dataNascimento: string;
    email: string;
    telefone: string;
  };
  brigadistas: Brigadista[];
}

export const CLCB_CHECKLISTS: Omit<Checklist, 'id'>[] = [
  {
    nome: "VISTORIA TÉCNICA",
    ordem: 1,
    items: [
      { id: "verificar-extintores", titulo: "Verificar validade dos extintores", concluido: false },
      { id: "verificar-sinalizacao", titulo: "Verificar sinalização de emergência", concluido: false },
      { id: "verificar-iluminacao", titulo: "Verificar iluminação de emergência", concluido: false },
      { id: "testar-hidrantes", titulo: "Testar hidrantes", concluido: false },
      { id: "testar-alarme", titulo: "Testar sistema de alarme de incêndio", concluido: false },
      { id: "dados-proprietario", titulo: "Coletar dados do proprietário", concluido: false },
      { id: "dados-responsavel", titulo: "Coletar dados do responsável pelo uso", concluido: false },
      { id: "comprovante-area", titulo: "Coletar comprovante de área construída", concluido: false },
      { id: "fotos-fachada", titulo: "Tirar fotos da fachada do imóvel", concluido: false }
    ]
  },
  {
    nome: "ART",
    ordem: 2,
    items: [
      { id: "preencher-art", titulo: "Preencher ART", concluido: false },
      { id: "boleto-crea", titulo: "Enviar boleto CREA para o cliente", concluido: false },
      { id: "enviar-art", titulo: "Enviar ART para o cliente assinar", concluido: false },
      { id: "assinar-art", titulo: "Assinar ART com certificado digital", concluido: false }
    ]
  },
  {
    nome: "FORMULÁRIO DE RISCO DE INCÊNDIO",
    ordem: 3,
    items: [
      { id: "cadastrar-via-facil", titulo: "Cadastrar processo de CLCB no Via Fácil", concluido: false },
      { id: "guia-dare", titulo: "Enviar guia DARE para o cliente", concluido: false },
      { id: "formulario-risco", titulo: "Enviar formulário de risco para o cliente assinar", concluido: false },
      { id: "assinar-formulario", titulo: "Assinar formulário com certificado digital", concluido: false }
    ]
  },
  {
    nome: "ENVIO DE DOCUMENTOS VIA FÁCIL BOMBEIROS",
    ordem: 4,
    items: [
      { id: "enviar-art-assinada", titulo: "Enviar ART assinada", concluido: false },
      { id: "enviar-formulario-assinado", titulo: "Enviar formulário de risco assinado", concluido: false },
      { id: "enviar-comprovante", titulo: "Enviar comprovante de área construída", concluido: false },
      { id: "enviar-fotos", titulo: "Enviar fotos da fachada do imóvel", concluido: false },
      { id: "protocolo-envio", titulo: "Gerar protocolo de envio de documentação", concluido: false },
      { id: "enviar-protocolo", titulo: "Enviar para o cliente o protocolo de envio de documentação", concluido: false }
    ]
  },
  {
    nome: "CLCB EMITIDO",
    ordem: 5,
    items: [
      { id: "baixar-clcb", titulo: "Baixar CLCB emitido no Via Fácil", concluido: false },
      { id: "inserir-logo", titulo: "Inserir logo MS no CLCB emitido", concluido: false },
      { id: "marcar-agenda", titulo: "Marcar na agenda a validade do alvará", concluido: false },
      { id: "avaliacao-google", titulo: "Pedir para o cliente avaliar o serviço no Google Meu Negócio", concluido: false }
    ]
  }
];

export const AVCB_CHECKLISTS: Omit<Checklist, 'id'>[] = [
  {
    nome: "VISTORIA TÉCNICA",
    ordem: 1,
    items: [
      { id: "verificar-extintores", titulo: "Verificar validade dos extintores", concluido: false },
      { id: "verificar-sinalizacao", titulo: "Verificar sinalização de emergência", concluido: false },
      { id: "verificar-iluminacao", titulo: "Verificar iluminação de emergência", concluido: false },
      { id: "testar-hidrantes", titulo: "Testar hidrantes", concluido: false },
      { id: "testar-alarme", titulo: "Testar sistema de alarme de incêndio", concluido: false },
      { id: "verificar-pressurizacao", titulo: "Verificar pressurização de escadas", concluido: false },
      { id: "verificar-motogerador", titulo: "Verificar grupo motogerador e sistema de emergência", concluido: false },
      { id: "verificar-portas", titulo: "Verificar portas corta-fogo e rotas de fuga", concluido: false },
      { id: "dados-proprietario", titulo: "Coletar dados do proprietário", concluido: false },
      { id: "dados-responsavel", titulo: "Coletar dados do responsável pelo uso", concluido: false },
      { id: "comprovante-area", titulo: "Coletar comprovante de área construída", concluido: false },
      { id: "fotos-fachada", titulo: "Tirar fotos da fachada do imóvel", concluido: false }
    ]
  },
  {
    nome: "ART",
    ordem: 2,
    items: [
      { id: "preencher-art", titulo: "Preencher ART", concluido: false },
      { id: "gerar-guia-crea", titulo: "Gerar guia de pagamento CREA", concluido: false },
      { id: "boleto-crea", titulo: "Enviar boleto CREA para o cliente", concluido: false },
      { id: "enviar-art", titulo: "Enviar ART para o cliente assinar", concluido: false },
      { id: "assinar-art", titulo: "Assinar ART com certificado digital", concluido: false }
    ]
  },
  {
    nome: "FORMULÁRIO DE RISCO DE INCÊNDIO",
    ordem: 3,
    items: [
      { id: "cadastrar-via-facil", titulo: "Cadastrar processo de AVCB no Via Fácil", concluido: false },
      { id: "guia-dare", titulo: "Enviar guia DARE para o cliente", concluido: false },
      { id: "formulario-risco", titulo: "Enviar formulário de risco para o cliente assinar", concluido: false },
      { id: "assinar-formulario", titulo: "Assinar formulário com certificado digital", concluido: false }
    ]
  },
  {
    nome: "ENVIO DE DOCUMENTOS VIA FÁCIL BOMBEIROS",
    ordem: 4,
    items: [
      { id: "enviar-art-assinada", titulo: "Enviar ART assinada", concluido: false },
      { id: "enviar-formulario-assinado", titulo: "Enviar formulário assinado", concluido: false },
      { id: "enviar-projeto-tecnico", titulo: "Enviar projeto técnico", concluido: false },
      { id: "enviar-comprovante", titulo: "Enviar comprovante de área construída", concluido: false },
      { id: "enviar-fotos", titulo: "Enviar fotos da fachada do imóvel", concluido: false },
      { id: "protocolo-envio", titulo: "Gerar protocolo de envio de documentação", concluido: false },
      { id: "enviar-protocolo", titulo: "Enviar para o cliente o protocolo de envio", concluido: false }
    ]
  },
  {
    nome: "COMISSIONAMENTO",
    ordem: 5,
    items: [
      { id: "relatorio-alarme", titulo: "Anexar Relatório de Alarme", concluido: false },
      { id: "relatorio-hidrantes", titulo: "Anexar Relatório de Hidrantes", concluido: false },
      { id: "relatorio-eletricas", titulo: "Anexar Relatório de Instalações Elétricas", concluido: false },
      { id: "calculo-lotacao", titulo: "Anexar Cálculo de Lotação", concluido: false },
      { id: "termo-saidas", titulo: "Anexar Termo de Saídas de Emergência", concluido: false },
      { id: "plano-emergencia", titulo: "Anexar Plano de Emergência", concluido: false }
    ]
  },
  {
    nome: "AVCB EMITIDO",
    ordem: 6,
    items: [
      { id: "baixar-avcb", titulo: "Baixar AVCB emitido no Via Fácil", concluido: false },
      { id: "inserir-logo", titulo: "Inserir logo MS no AVCB emitido", concluido: false },
      { id: "marcar-agenda", titulo: "Marcar na agenda a validade do AVCB", concluido: false },
      { id: "avaliacao-google", titulo: "Pedir avaliação do serviço no Google Meu Negócio", concluido: false }
    ]
  }
];
