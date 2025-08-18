import type { Lead } from "@/http/types/leads";
import * as XLSX from "xlsx";

export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export async function fetchGoogleSheetData(sheetId: string) {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    console.log('Fazendo requisição para:', csvUrl);
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error('Erro ao acessar a planilha. Verifique se ela está pública.');
    }
      const csvText = await response.text();
      console.log('Dados CSV recebidos (primeiros 200 chars):', csvText.substring(0, 200));
      return parseCsvToLeads(csvText);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    throw error;
  }
}

  function parseCsvToLeads(csvText: string){
    const lines = csvText.split('\n');
    const csvData = lines.map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')));
    return parseDataToLeads(csvData);
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readExcelFile(file: File): Promise<any[]>  {

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('Dados Excel lidos (primeiras 3 linhas):', jsonData.slice(0, 3));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parseDataToLeads(jsonData as any[][]);
  } catch (error) {
    console.error('Erro ao ler arquivo Excel:', error);
    throw error;
  }

}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDataToLeads(data: any[][], debug = false): Lead[] {
  if (!data || data.length < 2) {
    if (debug) console.log('Dados insuficientes para parsing');
    return [];
  }

  const originalHeaders = data[0];
  if (debug) console.log('Headers originais da planilha:', originalHeaders);

  // Normaliza headers: remove espaços, acentos, minúsculas e substitui vazio por "coluna_X"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headers = originalHeaders.map((h: any, i: number) => {
    if (!h) {
      if (debug) console.log(`Header vazio na posição ${i}`);
      return `coluna_${i}`;
    }
    const cleaned = String(h).trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (debug) console.log(`Header ${i}: "${h}" -> "${cleaned}"`);
    return cleaned;
  });

  if (debug) console.log('Headers processados:', headers);

  const getColumnValue = (values: string[], possibleNames: string[], fallbackIndex?: number): string => {
    if (debug) console.log(`Buscando colunas para: ${possibleNames.join(', ')}`);

    for (const name of possibleNames) {
      if (!name) continue;

      const index = headers.findIndex(h => h === name || h.includes(name));
      if (index !== -1 && values[index]?.trim()) {
        if (debug) console.log(`  Valor encontrado: "${values[index]}" para "${name}"`);
        return values[index].trim();
      }
    }

    if (fallbackIndex !== undefined && values[fallbackIndex]?.trim()) {
      if (debug) console.log(`  Usando valor fallback na posição ${fallbackIndex}: "${values[fallbackIndex]}"`);
      return values[fallbackIndex].trim();
    }

    if (debug) console.log(`  Nenhum valor encontrado para: ${possibleNames.join(', ')}`);
    return '';
  };

  const leads: Lead[] = [];

  for (let i = 1; i < data.length; i++) {
    const rowData = data[i];
    if (debug) console.log(`Processando linha ${i}:`, rowData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values = rowData.map((v: any) => v == null ? '' : String(v).trim());
    if (!values.some(v => v !== '')) {
      if (debug) console.log(`Linha ${i} ignorada - sem dados`);
      continue;
    }

    // Campos extraídos
    const company = getColumnValue(values, [
      'empresa', 'company', 'nome', 'estabelecimento', 'razao social', 
      'razao_social', 'nome da empresa', 'nome do estabelecimento', 'fantasia'
    ], 3) || `Empresa_${i}`;

    const type = getColumnValue(values, [
      'tipo', 'servico', 'service', 'categoria', 'tipo de servico'
    ], 0) || 'AVCB';

    const vigenciaRaw = getColumnValue(values, [
      'vigencia', 'validade', 'vencimento', 'expiry', 'validity', 
      'data de vencimento', 'data de validade'
    ]);
    
    // Converter data Excel para ISO, ou usar string direta
    let vigencia = '';
    if (vigenciaRaw) {
      const numDate = Number(vigenciaRaw);
      if (!isNaN(numDate)) {
        const dt = new Date((numDate - 25569) * 86400 * 1000);
        vigencia = dt.toISOString().split('T')[0];
      } else {
        vigencia = vigenciaRaw;
      }
    }

    // Campos de endereço
    const endereco = getColumnValue(values, ['endereco', 'address', 'rua', 'logradouro']);
    const numero = getColumnValue(values, ['numero', 'number', 'n°', 'nº', 'num']);
    const complemento = getColumnValue(values, ['complemento', 'complement', 'compl']);
    const bairro = getColumnValue(values, ['bairro', 'district']);
    const municipio = getColumnValue(values, ['municipio', 'cidade', 'city']);
    const cep = getColumnValue(values, ['cep', 'zipcode']);
    const ocupacao = getColumnValue(values, ['ocupacao', 'occupation', 'atividade', 'uso', 'categoria de uso']);
    const valorServico = getColumnValue(values, ['valor', 'price', 'preco', 'custo', 'valor do servico', 'preco do servico']);
    const license = getColumnValue(values, ['licenca', 'license', 'numero', 'protocolo', 'numero do protocolo']);

    const enderecoParaBusca = [endereco, numero, complemento, bairro, municipio, cep]
      .filter(Boolean).join(', ');



    const lead: Lead = {
      company,
      type: type,
      license: license || '',
      contact: '',
      phone: '',
      email: '',
      address: endereco || '',
      numero: numero || '',
      complemento: complemento || '',
      bairro: bairro || '',
      municipio: municipio || '',
      cep: cep || '',
      occupation: ocupacao || '',
      status: 'Lead',
      vencimento: vigencia || new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0],
      vigencia: vigencia || '',
      nextAction: new Date(Date.now() + 7 * 86400 * 1000).toISOString().split('T')[0],
      valorServico: valorServico || '',
      cnpj: '',
      website: '',
      enderecoParaBusca
    };

    if (debug) console.log(`Lead ${i} criado:`, lead);
    leads.push(lead);
  }

  if (debug) console.log(`Total de leads parseados: ${leads.length}`);
  return leads;
}