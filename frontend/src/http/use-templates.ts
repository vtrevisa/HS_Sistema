import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { EmailTemplate } from "./types/email";
import type { AxiosError } from "axios";

export function useTemplates(){

    const getTemplates = useQuery<EmailTemplate[], AxiosError>({
        queryKey: ['emailTemplates'],
        queryFn: async (): Promise<EmailTemplate[]> => {
            const { data } = await api.get<{ templates: EmailTemplate[] }>('/email/templates');
            return data.templates ?? [];
        }
    });

    return {
        getTemplates

    }
}