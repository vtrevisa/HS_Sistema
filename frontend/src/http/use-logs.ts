import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { AlvaraLog } from "./types/logs";

export function useLog() {

  // Fn to show all logs
  const logsDB = useQuery<AlvaraLog[], AxiosError>({
    queryKey: ["logs"],
    queryFn: async (): Promise<AlvaraLog[]> => {
      const { data } = await api.get<{ status: boolean; logs: AlvaraLog[] }>("/alvaras/logs");
      return data.logs;
    },
    staleTime: 1 * 60 * 1000, 
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: "always",
  });


  return {
    logs: logsDB.data || [],
    isLoading: logsDB.isLoading,
  }
}