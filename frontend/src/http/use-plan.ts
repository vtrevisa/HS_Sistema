import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";

// interface Plan {
//   id: number;
//   name: string;
//   creditsLimit: number;
//   price: string;
//   description: string;
//   features: string[];
// }

export function usePlan() {
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changePlanMutation = useMutation<{ status: boolean; message: string; user: any }, AxiosError, { plan_id: number }>({
    mutationFn:  async ({ plan_id }) => {
      if (!plan_id) throw new Error("Plano não encontrado!");

      const { data } = await api.post("/plans/update", { plan_id });
      return data;
    },
    onSuccess: (data) => {
      if (data.status) {
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
    },
  });

  return {
    changePlanMutation
  };
}