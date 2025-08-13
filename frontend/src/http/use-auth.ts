import { api } from "@/lib/api"
import type { AxiosError } from 'axios'
import { useMutation } from "@tanstack/react-query"
import type { AuthRequest, AuthResponse } from "./types/auth"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"


export function useAuth() {

  const history = useNavigate();

  return useMutation<AuthResponse, AxiosError<{ message: string }>, AuthRequest>({
    mutationFn: async (data) => {
      const response = await api.post('/auth', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      })

      return response.data
    },

    onSuccess: (data) => {

      const authUser = {
        id: data.user.id
      }

      localStorage.setItem('auth_user', JSON.stringify(authUser))

      toast.success(data.message)

      history('/dashboard')
    },

    onError: (error) => {
      const message = error.response?.data?.message
      toast.error(message)
    }
   
  })

}
