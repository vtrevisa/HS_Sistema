export interface EnrichmentData {
  company: string;
  cnpj?: string;
  industry?: string;
  size?: string;
  revenue?: string;
  website?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessHours?: string;
  rating?: number;
  reviews?: number;
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalInfo?: Record<string, any>;
}

export interface EnrichmentConfig {
  apiKey: string;
  apiProvider: 'receitaws' | 'serpapi' | 'google-places' | 'google-business' | 'custom';
  customEndpoint?: string;
}

export class DataEnrichmentService {
    
  private config: EnrichmentConfig;

  constructor(config: EnrichmentConfig) {
    this.config = config;
  }

  async enrichCompanyData(companyName: string, cnpj?: string): Promise<EnrichmentData> {
    console.log(`Enriquecendo dados para: ${companyName}`, { cnpj });

    switch (this.config.apiProvider) {
      case 'receitaws':
        if (!cnpj) {
          throw new Error('CNPJ é obrigatório para ReceitaWS');
        }
        return this.enrichWithReceitaWS(cnpj);

      default:
        throw new Error(`Provedor ${this.config.apiProvider} ainda não implementado`);
    }
   
  }

  private async enrichWithReceitaWS(cnpj: string): Promise<EnrichmentData> {
  
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    try {
      const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCnpj}`);
      const data = await response.json();

      if (data.status === 'ERROR') {
        throw new Error(data.message || 'Erro ao consultar ReceitaWS');
      }

      return {
        company: data.nome || data.fantasia,
        cnpj: data.cnpj,
        industry: data.atividade_principal?.[0]?.text,
        description: data.objeto_social,
        website: data.email ? `https://${data.email.split('@')[1]}` : undefined,
        phone: data.telefone,
        email: data.email,
        address: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}`,
        additionalInfo: {
          situacao: data.situacao,
          tipo: data.tipo,
          porte: data.porte,
          natureza_juridica: data.natureza_juridica,
          capital_social: data.capital_social
        }
      };
    } catch (error) {
      console.error('Erro ao enriquecer com ReceitaWS:', error);
      throw error;
    }
  }

}
