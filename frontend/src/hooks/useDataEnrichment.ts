import { useState, useCallback } from 'react';
import { DataEnrichmentService, type EnrichmentConfig, type EnrichmentData } from '@/services/dataEnrichment';
import { toast } from 'sonner';


export const useDataEnrichment = () => {
  const [config, setConfig] = useState<EnrichmentConfig | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState<EnrichmentData | null>(null);


  const saveConfig = useCallback((newConfig: EnrichmentConfig) => {
    setConfig(newConfig);
    localStorage.setItem('enrichmentConfig', JSON.stringify(newConfig));
  }, []);

  const loadConfig = useCallback(() => {
    const savedConfig = localStorage.getItem('enrichmentConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        return parsedConfig;
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    }
    return null;
  }, []);

  const enrichCompanyData = useCallback(async (companyName: string, cnpj?: string) => {
    if (!config) {
      toast.info('Configuração Necessária', {
        description: 'Configure as APIs de enriquecimento antes de usar esta funcionalidade.',
      })
      return null;
    }

    setIsEnriching(true);
    console.log('Iniciando enriquecimento para:', companyName);

    try {
      const service = new DataEnrichmentService(config);
      const data = await service.enrichCompanyData(companyName, cnpj);
      setEnrichedData(data);
      
      const dataTypes = [];
      if (data.phone) dataTypes.push('telefone');
      if (data.email) dataTypes.push('email');
      if (data.website) dataTypes.push('website');
      if (data.address) dataTypes.push('endereço');
      
       toast.info('Dados Enriquecidos', {
        description: `Encontrados: ${dataTypes.join(', ')} para ${companyName}`,
       })

      return data;
    } catch (error) {
      console.error('Erro no enriquecimento:', error);
  
       toast.error('Erro no Enriquecimento', {
         description: error instanceof Error ? error.message : "Erro desconhecido",
       })

      return null;
    } finally {
      setIsEnriching(false);
    }
  }, [config]);

  const enrichMultipleCompanies = useCallback(async (companies: Array<{name: string, cnpj?: string}>) => {
    if (!config) {
      toast.info('Configuração Necessária', {
        description: "Configure as APIs de enriquecimento antes de usar esta funcionalidade.",
      })
      return [];
    }

    const enrichedResults = [];
    const service = new DataEnrichmentService(config);

    for (const company of companies) {
      try {
        console.log(`Enriquecendo: ${company.name}`);
        const data = await service.enrichCompanyData(company.name, company.cnpj);
        enrichedResults.push({ ...company, enrichedData: data });
        
        // Delay entre requisições para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erro ao enriquecer ${company.name}:`, error);
        enrichedResults.push({ ...company, enrichedData: null });
      }
    }

    return enrichedResults;
  }, [config]);

  return {
    config,
    saveConfig,
    loadConfig,
    enrichCompanyData,
    enrichMultipleCompanies,
    isEnriching,
    enrichedData,
    setEnrichedData
  };
};