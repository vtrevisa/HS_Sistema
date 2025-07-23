import { api } from "@/lib/api"
import type { AxiosError } from 'axios'
import { useMutation } from "@tanstack/react-query"
import type { AuthRequest, AuthResponse } from "./types/auth"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"


export function useAuth() {

  const history = useNavigate();

  return useMutation({
    mutationFn: async (data: AuthRequest) => {
      const response = await api.post('/auth', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.data
    },

    onSuccess: (data: AuthResponse) => {

      const user = {
        id: data.user.id,
        token: data.token
      }

      localStorage.setItem('auth_user', JSON.stringify(user))

      toast.success(data.message)

      history('/dashboard')
    },

    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message
      toast.error(message)
    }
   
  })

}
