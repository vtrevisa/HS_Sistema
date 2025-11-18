import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

import { toast } from 'sonner'

interface PurchaseCreditsPayload {
  credits: number
  amount_paid: number
  payment_method?: string
  transaction_id?: string | null
}

export function usePayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PurchaseCreditsPayload) => {
      const response = await api.post('/credits/purchase', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error('Erro ao registrar pagamento', {
        description: error?.response?.data?.message || 'Tente novamente. Se o valor foi debitado, contate o suporte.'
      })
    }
  })
}