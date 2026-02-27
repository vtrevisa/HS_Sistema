import { api } from '@/lib/api'

export interface SmtpConfig {
    host: string;
    port: number;
    encryption: 'ssl' | 'tls' | null;
    username: string;
    password: string; //só usado no envio
    from_email: string;
    from_name: string | null;
}

export const getSmtpConfig = async () => {
    const response = await api.get('/smtp');
    return response.data;
}

export const saveSmtpConfig = async (data: SmtpConfig) => {
    console.log("Salvando configuração SMTP:", data);
    const response = await api.post('/smtp', data);
    return response.data;
}

export const testSmtpConnection = async (data: Partial<SmtpConfig>) => {
    console.log("Testando conexão SMTP com dados:", data);
    const response = await api.post('/smtp/test', data);
    return response.data;
}

export const deleteSmtpConfig = async () => {
    const response = await api.delete('/smtp');
    return response.data;
}