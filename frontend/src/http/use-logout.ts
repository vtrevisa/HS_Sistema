import { api } from "@/lib/api";
import type { AxiosError } from 'axios'
import { useMutation } from "@tanstack/react-query";
import type { AuthResponse } from "./types/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useLogout() {

  const history = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const userData = localStorage.getItem('auth_user')

      if (!userData) return

      const user = JSON.parse(userData)
      const { id, token } = user

      const response = await api.post(`/logout/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      return response.data
    },

    onSuccess: (data: AuthResponse) => {

      localStorage.removeItem('auth_user')

      toast.success(data.message)

      history('/')
    },

    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message
      toast.error(message)
    }
  })
}