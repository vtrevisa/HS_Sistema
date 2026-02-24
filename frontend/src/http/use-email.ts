import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AxiosError } from "axios";
import type { EmailStatus, EmailTemplate } from './types/email';

//Fn to get the email provider and if connectd
export function useEmail() {
    const queryClient = useQueryClient();
    
    const emailStatus =  useQuery<EmailStatus>({
    queryKey: ['email', 'status'],
    queryFn: async () => {
      const { data } = await api.get('/email/status')
      console.log("📧 Email status fetched:", data);
      // backend returns { gmail: { connected, email }, microsoft: { connected, email } }
      return data as EmailStatus
    },
    staleTime: 60_000,
  })
  
  // Fn to update the subject and body of the email in the user config
  const updateEmailConfigMutation = useMutation<EmailTemplate, AxiosError<any>, any>({
    mutationFn: async (payload: any) => {
      // payload can come from the modal and include: id, email_subject, email_body, position, active
      const userId = payload.id || payload.user_id || (payload.template && payload.template.user_id);
      if (!userId) throw new Error("User id not provided for email config");

      const bodyPayload: any = {
        email_subject: payload.email_subject ?? payload.subject ?? payload.template?.subject,
        email_body: payload.email_body ?? payload.body ?? payload.template?.body,
        position: payload.position ?? payload.template?.position,
        active: payload.active ?? payload.template?.active ?? false,
      };

      const { data } = await api.put<{ status: boolean; template: EmailTemplate }>(
        `/users/${userId}/email-config`,
        bodyPayload
      );

      return data.template;
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
