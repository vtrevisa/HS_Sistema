import { api } from "@/lib/api"
import type { DashboardResponse } from "./types/dashboard"
import { useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"


export function useDashboard() {

  const dashboardQuery = useQuery<DashboardResponse['data'], AxiosError>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get<DashboardResponse>('/dashboard');
      return data.data
    },
    staleTime: 1000 * 60 * 5
  })

  return { 
    cards: dashboardQuery.data?.cards,
    recentLeads: dashboardQuery.data?.recentLeads,
    isLoading: dashboardQuery.isLoading,
  }
}