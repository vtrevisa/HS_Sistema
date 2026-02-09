import type { DateRange } from 'react-day-picker'
import type { Alvaras, SearchAlvarasPayload } from '@/http/types/alvaras'
import { saveAs } from "file-saver";
import { toast } from 'sonner'


interface PaginationParams<T> {
  data: T[]
  currentPage: number
  itemsPerPage: number
}

export function buildSearchPayload(
  city: string,
  dateRange: DateRange | undefined,
  selectedTypeFilter: 'Todos' | 'AVCB' | 'CLCB'
): SearchAlvarasPayload | null {
  if (!dateRange?.from || !dateRange?.to) return null

  const from = new Date(dateRange.from)
  const to = new Date(dateRange.to)
  if (to < from) return null

  const monthMap = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

  return {
    city,
    from: { year: from.getFullYear(), month: monthMap[from.getMonth()] },
    to: { year: to.getFullYear(), month: monthMap[to.getMonth()] },
    selectedTypeFilter
  }
}

export function calculateExtraAmount(totalFound: number, available: number) {
  return Math.max(totalFound - available, 0) * 5
}

export function getPaginatedData<T>({ data, currentPage, itemsPerPage }: PaginationParams<T>) {
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  return data.slice(start, end)
}

export function getTotalPages(totalItems: number, itemsPerPage: number) {
  return Math.ceil(totalItems / itemsPerPage)
}

// export function handlePageChange(page: number, totalPages: number) {
//   return Math.min(Math.max(page, 1), totalPages)
// }

// export function handleItemsPerPageChange(value: string, setCurrentPage: Dispatch<SetStateAction<number>>) {
//   setCurrentPage(1)
//   return Number(value)
// }

export function handleQuantityChange(value: string, totalFound?: number){
  const numValue = parseInt(value) || 0;

  if (typeof totalFound === 'number') {
    return Math.min(Math.max(0, numValue), totalFound)
  }

  return Math.max(0, numValue)
};

export async function exportConsumedAlvaras(consumedAlvaras: Alvaras[]) {
   if (!consumedAlvaras || consumedAlvaras.length === 0) {
    toast.warning("Nenhum dado para exportar", {
      description: "Você ainda não possui alvarás consumidos.",
    });
    return;
  }

  const ExcelJS = await import("exceljs")
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Meus Alvarás");

  const headers = ["Tipo de Serviço", "Data de Vencimento", "Endereço Completo", "Ocupação", "Cidade"];
  sheet.addRow(headers);

  // Estilo do header
  sheet.getRow(1).eachCell(cell => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "5A80B7" }
    };
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  // Adiciona os dados
  consumedAlvaras.forEach((alvara, i) => {
    const row = sheet.addRow([
      alvara.service,
      new Date(alvara.validity).toLocaleDateString("pt-BR"),
      alvara.address,
      alvara.occupation,
      alvara.city,
    ]);

    // Cor alternada das linhas
    const isEven = i % 2 === 0;
    row.eachCell(cell => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "DEE6F0" : "BCCCE2" }
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  // Ajusta largura das colunas
  sheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell?.({ includeEmpty: true }, cell => {
      const value = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, value.length);
    });
    column.width = maxLength < 15 ? 15 : maxLength;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `meus_alvaras_${new Date().toISOString().split("T")[0]}.xlsx`);

  toast.success('Exportação concluída', {
    description: `Arquivo baixado com sucesso.`,
  });
};