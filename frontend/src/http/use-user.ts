import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { UpdateUserPasswordRequest, UserRequest } from "./types/user";
import { toast } from "sonner";

export function useUser() {
  const queryClient = useQueryClient();

  // Fn to show data from auth user
  const authUser = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.user;
    },
    refetchOnWindowFocus: true,       
    refetchOnReconnect: true,         
    staleTime: 0,                
  });

  // Fn to update user data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateMutation = useMutation<UserRequest, AxiosError<any>, UserRequest>({
    mutationFn: async (user: UserRequest) => {
      if (!user.id) throw new Error("Usuário não encontrado!");

      const { data } = await api.put<{ status: boolean; user: UserRequest }>(
        `/users/${user.id}`,
        user
      );

      return data.user;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["authUser", updatedUser.id] });

      setTimeout(() => {
        toast.success(`Usuário ${updatedUser.name} atualizado com sucesso!`);
      }, 1200);
    },
    onError: (error) => {
      const messages = error.response?.data?.erros
        ? Object.values(error.response.data.erros).flat().join("\n")
        : "Erro desconhecido.";

      setTimeout(() => {
        toast.error("Erro ao atualizar o usuário!", {
          description: messages,
        });
      }, 1200);
    },
  });

  //Fn to update userpassword
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePasswordMutation = useMutation<{ status: boolean; message: string }, AxiosError<any>, UpdateUserPasswordRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.put('/auth/me/password/update', payload);
      return data;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success(updatedUser.message);
    },
    onError: (error) => {
      const messages = error.response?.data?.erros
        ? Object.values(error.response.data.erros).flat().join("\n")
        : "Erro ao atualizar a senha.";

      toast.error(messages);
    }
  });

  return {
    user: authUser.data || [],
    isLoading: authUser.isLoading,
    updateUser: updateMutation,
    updateUserPassword: updatePasswordMutation
  }
}

