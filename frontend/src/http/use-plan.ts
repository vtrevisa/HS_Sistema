import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";
import type { PlanRequest } from "./types/plan";

export function usePlan() {
  const queryClient = useQueryClient();

  const plansDB = useQuery<PlanRequest[], AxiosError>({
    queryKey: ["plans", filters.status],
    queryFn: async (): Promise<PlanRequest[]> => {
      const { data } = await api.get<{status: boolean, requests: PlanRequest[]}>('/plans', {
         params: filters.status !== 'all' ? { status: filters.status } : undefined
      })
      return data.requests
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: 'always'
  });

  const requestPlanChangeMutation = useMutation<{ status: boolean; message: string}, AxiosError, { plan_id: number }>({
    mutationFn: async ({ plan_id }) => {
      if (!plan_id) throw new Error("Plano não encontrado!")

      const { data } = await api.post("/plans/request-change", {
        plan_id,
      })

      return data
    },
  })

   const approvePlanChangeMutation = useMutation<{ status: boolean; message: string}, AxiosError,{ requestId: number }>({
    mutationFn: async ({ requestId }) => {
      const { data } = await api.post(
        `/admin/plan-requests/${requestId}/approve`
      )

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
      queryClient.invalidateQueries({ queryKey: ["planRequests"] })
    },
  })

  const rejectPlanChangeMutation = useMutation<{ status: boolean; message: string}, AxiosError,{ requestId: number }>({
    mutationFn: async ({ requestId }) => {
      const { data } = await api.post(
        `/admin/plan-requests/${requestId}/reject`
      )

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planRequests"] })
    },
  })

  return {
    plans: plansDB.data || [],
    requestPlanChangeMutation,
    approvePlanChangeMutation,
    rejectPlanChangeMutation
  };
}