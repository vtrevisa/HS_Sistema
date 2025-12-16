import type { AlvaraLog } from "@/http/types/logs";
import { toast } from "sonner";
import * as XLSX from "xlsx";


export const mockAlvarasLogs: AlvaraLog[] = [
  {
    id: 1,
    userId: "user-1",
    userName: "João Silva",
    userEmail: "joao@empresa.com",
    city: "São Paulo",
    service: "AVCB",
    quantity: 25,
    consumedDate: new Date(2025, 11, 8),
    initDate: new Date(2025, 11, 1),
    endDate: new Date(2025, 11, 31),
  },
  {
    id: 2,
    userId: "user-2",
    userName: "Maria Santos",
    userEmail: "maria@empresa.com",
    city: "Campinas",
    service: "CLCB",
    quantity: 15,
    consumedDate: new Date(2025, 11, 7),
    initDate: new Date(2025, 10, 15),
    endDate: new Date(2025, 11, 15),
  },
  {
    id: 3,
    userId: "user-1",
    userName: "João Silva",
    userEmail: "joao@empresa.com",
    city: "Santos",
    service: "Todos",
    quantity: 50,
    consumedDate: new Date(2025, 11, 5),
    initDate: new Date(2025, 10, 1),
    endDate: new Date(2025, 10, 30),
  },
  {
    id: 4,
    userId: "user-3",
    userName: "Carlos Oliveira",
    userEmail: "carlos@empresa.com",
    city: "Guarulhos",
    service: "AVCB",
    quantity: 30,
    consumedDate: new Date(2025, 11, 3),
    initDate: new Date(2025, 11, 1),
    endDate: new Date(2025, 11, 31),
  },
  {
    id: 5,
    userId: "user-2",
    userName: "Maria Santos",
    userEmail: "maria@empresa.com",
    city: "São Paulo",
    service: "CLCB",
    quantity: 40,
    consumedDate: new Date(2025, 11, 1),
    initDate: new Date(2025, 10, 20),
    endDate: new Date(2025, 11, 20),
  },
];



export function handleExportLogs(filteredLogs: AlvaraLog[]){
  const dataToExport = filteredLogs.map((log) => ({
    "Usuário": log.userName,
    "Email": log.userEmail,
    "Cidade": log.city,
    "Tipo de Serviço": log.service,
    "Quantidade": log.quantity,
    "Data do Consumo": log.consumedDate.toLocaleDateString("pt-BR"),
    "Período Início": log.initDate.toLocaleDateString("pt-BR"),
    "Período Fim": log.endDate.toLocaleDateString("pt-BR"),
  }));

  const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs de Alvarás");
    XLSX.writeFile(wb, `logs_alvaras_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success('Exportação concluída', {
      description: "O arquivo foi baixado com sucesso.",
    });
  };