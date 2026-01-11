import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";
import type { PlanRequest, PlanRequestStatus } from "./types/plan";
import { toast } from "sonner";

export function usePlan(status?: PlanRequestStatus, enabled: boolean = true) {
  const queryClient = useQueryClient();

  const plansDB = useQuery<PlanRequest[], AxiosError>({
  queryKey: ['plans', status],
  queryFn: async (): Promise<PlanRequest[]> => {
    const { data } = await api.get<{status: boolean, requests: PlanRequest[]}>('/plans', {
      params: status !== 'all' ? { status } : undefined
    })
    return data.requests
  },
  staleTime: 1 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: 'always',
  enabled
})

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

      if (!requestId) throw new Error("Solicitação não encontrada!");

      const { data } = await api.post(
        `/admin/plan-requests/${requestId}/approve`
      )

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
      queryClient.invalidateQueries({ queryKey: ["plans"] })

       setTimeout(() => {
        toast.success('Solicitação aprovada com sucesso!')
      }, 1200)
    },
    onError: (error) => {
      const messages = error.response?.data ? Object.values(error.response.data).flat().join("\n") : "Erro desconhecido.";

      setTimeout(() => {
        toast.error("Falha ao aprovar solicitação.", {
          description: messages,
        });
      }, 1200);
    },
  })

  const rejectPlanChangeMutation = useMutation<{ status: boolean; message: string}, AxiosError,{ requestId: number }>({
    mutationFn: async ({ requestId }) => {
      if (!requestId) throw new Error("Solicitação não encontrada!");

      const { data } = await api.post(
        `/admin/plan-requests/${requestId}/reject`
      )

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })

      setTimeout(() => {
        toast.success('Solicitação rejeitada com sucesso!')
      }, 1200)
    },
    onError: (error) => {
      const messages = error.response?.data ? Object.values(error.response.data).flat().join("\n") : "Erro desconhecido.";

      setTimeout(() => {
        toast.success('A atualização do plano foi rejeitada com sucesso!')
      }, 1200)

      setTimeout(() => {
        toast.error("Falha ao rejeitar a solicitação.", {
          description: messages,
        });
      }, 1200);
    },
  })

  return {
    plans: plansDB.data || [],
    isLoading: plansDB.isLoading,
    requestPlanChangeMutation,
    approvePlanChangeMutation,
    rejectPlanChangeMutation
  };
}