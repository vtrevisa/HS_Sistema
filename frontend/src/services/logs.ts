import type { AlvaraLog } from "@/http/types/logs";
import { formatDate } from "@/lib/date";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function handleExportLogs(filteredLogs: AlvaraLog[]){
  const dataToExport = filteredLogs.map((log) => ({
    "Usuário": log.userName,
    "Email": log.userEmail,
    "Cidade": log.city,
    "Tipo de Serviço": log.service,
    "Quantidade": log.quantity,
    "Data do Consumo": formatDate(log.consumedAt),
    "Período Início": formatDate(log.period.start),
    "Período Fim": formatDate(log.period.end),
  }));

  const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs de Alvarás");
    XLSX.writeFile(wb, `logs_alvaras_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success('Exportação concluída', {
      description: "O arquivo foi baixado com sucesso.",
    });
  };