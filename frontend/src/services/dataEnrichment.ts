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
        return this.enrichWithReceitaWS(cnpj || '');
      case 'serpapi':
        return this.enrichWithSerpAPI(companyName);
      case 'google-places':
        return this.enrichWithGooglePlaces(companyName);
      case 'google-business':
        return this.enrichWithGoogleBusiness(companyName);
      case 'custom':
        return this.enrichWithCustomAPI(companyName, cnpj);
      default:
        throw new Error('Provedor de API não suportado');
    }
  }

  private async enrichWithReceitaWS(cnpj: string): Promise<EnrichmentData> {
    if (!cnpj) {
      throw new Error('CNPJ é obrigatório para ReceitaWS');
    }

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

  private async enrichWithSerpAPI(companyName: string): Promise<EnrichmentData> {
    // Simulação - em produção, usaria a API real do SerpAPI
    console.log('Simulando enriquecimento com SerpAPI para:', companyName);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      company: companyName,
      industry: 'Tecnologia',
      size: 'Média Empresa',
      website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com.br`,
      description: `${companyName} é uma empresa inovadora no setor tecnológico.`,
      socialMedia: {
        linkedin: `https://linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}`,
        instagram: `https://instagram.com/${companyName.toLowerCase().replace(/\s+/g, '')}`
      },
      additionalInfo: {
        employees: '50-200',
        founded: '2015',
        location: 'São Paulo, SP'
      }
    };
  }

  private async enrichWithGooglePlaces(companyName: string): Promise<EnrichmentData> {
    try {
      // Busca por texto na API do Google Places
      const searchResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(companyName)}&key=${this.config.apiKey}`
      );
      
      const searchData = await searchResponse.json();
      
      if (searchData.status !== 'OK' || !searchData.results?.length) {
        throw new Error('Empresa não encontrada no Google Places');
      }

      const place = searchData.results[0];
      
      // Busca detalhes do local
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,website,formatted_address,business_status,opening_hours,rating,user_ratings_total,types&key=${this.config.apiKey}`
      );
      
      const detailsData = await detailsResponse.json();
      const details = detailsData.result;

      return {
        company: details.name || companyName,
        phone: details.formatted_phone_number,
        website: details.website,
        address: details.formatted_address,
        rating: details.rating,
        reviews: details.user_ratings_total,
        businessHours: details.opening_hours?.weekday_text?.join(', '),
        industry: details.types?.[0]?.replace(/_/g, ' '),
        additionalInfo: {
          business_status: details.business_status,
          place_id: place.place_id,
          types: details.types
        }
      };
    } catch (error) {
      console.error('Erro ao enriquecer com Google Places:', error);
      throw error;
    }
  }

  private async enrichWithGoogleBusiness(companyName: string): Promise<EnrichmentData> {
    try {
      // Usar SerpAPI para fazer scraping do Google Business Profile
      const response = await fetch('https://serpapi.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.config.apiKey,
          engine: 'google_maps',
          q: companyName,
          type: 'search'
        })
      });

      const data = await response.json();
      
      if (!data.local_results?.length) {
        throw new Error('Empresa não encontrada no Google Business');
      }

      const business = data.local_results[0];

      // Extrair email do site se disponível
      let email = '';
      if (business.website) {
        try {
          //const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
          // Simular extração de email (em produção seria necessário fazer scraping do site)
          const domain = business.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
          email = `contato@${domain}`;
        } catch (error) {
          console.error(error)
          console.log('Não foi possível extrair email');
        }
      }

      return {
        company: business.title || companyName,
        phone: business.phone,
        website: business.website,
        email: email,
        address: business.address,
        rating: business.rating,
        reviews: business.reviews,
        businessHours: business.hours,
        industry: business.type,
        description: business.description,
        additionalInfo: {
          place_id: business.place_id,
          service_options: business.service_options,
          price: business.price
        }
      };
    } catch (error) {
      console.error('Erro ao enriquecer com Google Business:', error);
      throw error;
    }
  }

  private async enrichWithCustomAPI(companyName: string, cnpj?: string): Promise<EnrichmentData> {
    if (!this.config.customEndpoint) {
      throw new Error('Endpoint customizado não configurado');
    }

    try {
      const response = await fetch(this.config.customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          company: companyName,
          cnpj: cnpj
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao enriquecer com API customizada:', error);
      throw error;
    }
  }
}
