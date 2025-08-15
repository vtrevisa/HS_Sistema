import { api } from "@/lib/api";
import type { AxiosError } from 'axios'
import { useMutation } from "@tanstack/react-query";
import type { AuthResponse } from "./types/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useLogout() {

  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {

      const response = await api.post('/auth/logout')

      return response.data
    },

    onSuccess: (data: AuthResponse) => {

      toast.success(data.message)

      navigate('/')
    },

    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message
      toast.error(message)
    }
  })
}