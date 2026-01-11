import { api } from "@/lib/api"
import type { AxiosError } from 'axios'
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AuthRequest, AuthResponse } from "./types/auth"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"


export function useAuth() {

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  return useMutation<AuthResponse, AxiosError<{ message: string }>, AuthRequest>({
    mutationFn: async (data) => {
      const response = await api.post('/auth', data)

      return response.data
    },

    onSuccess: (data) => {

      toast.success(data.message)

      navigate('/dashboard')

      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },

    onError: (error) => {
      const message = error.response?.data?.message
      toast.error(message)
    }
   
  })

}
