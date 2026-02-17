import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AxiosError } from "axios";
import type { EmailStatus } from './types/email';
import type { UserRequest } from './types/user';

//Fn to get the email provider and if connectd
export function useEmail() {
    const queryClient = useQueryClient();
    
    const emailStatus =  useQuery<EmailStatus>({
    queryKey: ['email', 'status'],
    queryFn: async () => {
      const { data } = await api.get('/email/status')
      console.log("📧 Email status fetched:", data);
      // backend returns { gmail: { connected, email }, outlook: { connected, email } }
      return data as EmailStatus
    },
    staleTime: 60_000,
  })
  
  // Fn to update the subject and body of the email in the user config
  const updateEmailConfigMutation = useMutation<UserRequest, AxiosError<any>, UserRequest>({
    mutationFn: async (user: UserRequest) => {
      if (!user.id) throw new Error("Usuário não encontrado!");

      const payload = {
        email_subject: user.email_subject,
        email_body: user.email_body,
      };

      const { data } = await api.put<{ status: boolean; user: UserRequest }>(
        `/users/${user.id}/email-config`,
        payload
      );

      return data.user;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["authUser", updatedUser.id] });
      console.log('Email config updated for user', updatedUser?.id);
    },
    onError: (error) => {
      const messages = error.response?.data?.erros
        ? Object.values(error.response.data.erros).flat().join("\n")
        : 'Erro ao atualizar as configurações de e-mail.';

      // eslint-disable-next-line no-console
      console.error('Erro updateEmailConfig:', messages);
    }
  });
  
  return {
    emailStatus,
    updateEmailConfig: updateEmailConfigMutation
  }
}
