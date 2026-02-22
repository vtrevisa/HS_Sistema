import type { Lead, LeadRequest } from "@/http/types/leads";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export function toDateOnly(value?: string | null) {
 if (!value) return null

 const date = new Date(value)
 return isNaN(date.getTime())
  ? null
  : date.toISOString().split('T')[0]
}

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

export async function exportLeadsToExcel(leads: LeadRequest[]) {
  if (!leads || leads.length === 0) {
    toast.warning("Nenhum lead para exportar", {
      description: "Você ainda não possui leads.",
    })
    
    return;
  }

  const today = new Date()
  const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "")
  const filename = `leads_${formattedDate}.xlsx`

  const ExcelJS = await import("exceljs")
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Leads")

  const headers = [
    "Empresa",
    "Tipo",
    "Licença",
    "Vigência",
    "Vencimento",
    "Próxima Ação",
    "Valor Serviço",
    "Endereço",
    "Número",
    "Complemento",
    "Município",
    "CEP",
    "Bairro",
    "Ocupação",
    "Status",
    "CNPJ",
    "Website",
    "Contato",
    "Telefone/WhatsApp",
    "Email",
    "Data de criação do lead"
  ]

  sheet.addRow(headers)

  leads.forEach(lead => {

    const formattedDateLead = lead.created_at ? new Date(lead.created_at).toLocaleDateString("pt-BR") : ""
    const formattedVigencia = lead.validity ? new Date(lead.validity).toLocaleDateString("pt-BR") : ""
    const formattedVencimento = lead.expiration_date ? new Date(lead.expiration_date).toLocaleDateString("pt-BR") : ""
    const formattedProximaAcao = lead.next_action ? new Date(lead.next_action).toLocaleDateString("pt-BR") : ""


    sheet.addRow([
      lead.company,
      lead.service,
      lead.license,
      formattedVigencia,
      formattedVencimento,
      formattedProximaAcao,
      lead.service_value ?? "",
      lead.address,
      lead.number,
      lead.complement,
      lead.city,
      lead.cep ?? "",
      lead.district,
      lead.occupation,
      lead.status,
      lead.cnpj ?? "",
      lead.website,
      lead.contact,
      lead.phone,
      lead.email ?? "",
      formattedDateLead
    ])
  })

  sheet.getRow(1).eachCell?.(cell => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "5A80B7" }
    }
    cell.font = { bold: true, color: { argb: "FFFFFF" } }
    cell.alignment = { vertical: "middle", horizontal: "left" }
    cell.border = {
      top: { style: "thin", color: { argb: "FFFFFF" } },
      left: { style: "thin", color: { argb: "FFFFFF" } },
      bottom: { style: "thin", color: { argb: "FFFFFF" } },
      right: { style: "thin", color: { argb: "FFFFFF" } },
    }
  })

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return 

    const isEven = rowNumber % 2 === 0
    row.eachCell(cell => {

      if (cell.value) {
        cell.value = cell.value.toString().toUpperCase()
      }

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "BCCCE2" : "DEE6F0" } 
      }

      cell.alignment = { vertical: "middle", horizontal: "left" }

      cell.border = {
        top: { style: "thin", color: { argb: "FFFFFF" } },
        left: { style: "thin", color: { argb: "FFFFFF" } },
        bottom: { style: "thin", color: { argb: "FFFFFF" } },
        right: { style: "thin", color: { argb: "FFFFFF" } },
      }
    })
  })

  sheet.columns.forEach(column => {
    let maxLength = 0
    column.eachCell?.({ includeEmpty: true }, cell => {
      const value = cell.value ? cell.value.toString() : ""
      maxLength = Math.max(maxLength, value.length)
    })
    column.width = maxLength < 15 ? 15 : maxLength
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  saveAs(blob, filename)

  toast.success('Exportação concluída!', {
    description: `Leads exportados com sucesso!`
  })

}

export function getStatusColor(status: string) {
 switch (status) {
   case 'Lead':
    return 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 hover:bg-blue-50'
   case 'Primeiro contato':
    return 'border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300 hover:bg-indigo-50'
   case 'Follow-up':
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 hover:bg-amber-50'
   case 'Proposta enviada':
    return 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 hover:bg-red-50'
   case 'Cliente fechado':
    return 'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300 hover:bg-green-50'
   default:
    return 'border border-border bg-muted text-muted-foreground'
  }
}



export function isVencimentoProximo(vencimento?: string) {
 if (!vencimento) return false
 const hoje = new Date()
 const dataVencimento = new Date(vencimento)
 const diasAteVencimento = Math.ceil(
  (dataVencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24)
 )
 return diasAteVencimento <= 30
}

export function getCompleteAddress(lead: LeadRequest) {
 const parts: string[] = []
 if (lead.address) parts.push(lead.address)
 if (lead.number) parts.push(lead.number)
 if (lead.complement) parts.push(lead.complement)
 if (lead.district) parts.push(lead.district)
 if (lead.city) parts.push(lead.city)

 const addressLine = parts.join(', ')
 return lead.cep ? `${addressLine} - CEP: ${lead.cep}` : addressLine
}

