import { api } from "@/lib/api"
import type { DashboardCards, DashboardResponse } from "./types/dashboard"
import { useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"

export function useDashboard() {
  const dashboardQuery = useQuery<DashboardCards, AxiosError>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get<DashboardResponse>('/dashboard')
      return data.data.cards
    },
    staleTime: 1000 * 60 * 5
  })

  return { 
    dashboard: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
  }
}