import { useState, useEffect } from 'react';
import { getSmtpConfig,
         saveSmtpConfig,
         testSmtpConnection,
         deleteSmtpConfig,
       } from '@/services/smtp';
import type { SmtpConfig } from '@/services/smtp';

export const useSmtp = () => {
    const [config, setConfig] = useState<SmtpConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const data = await getSmtpConfig();
            setConfig(data.configured ? data : null);
        } catch (err) {
            setError('Erro ao carregar configuração SMTP');
        } finally {
            setLoading(false);
        }
    }

    const testConnection = async (data: Partial<SmtpConfig>) => {
        try {
            await testSmtpConnection(data);
            return { success: true };
        } catch (err: any) {
            setLoading(false);
            return { success: false, error: err.response?.data?.message || err.message };
        }
    }

    const save = async (data: SmtpConfig) => {
        try {
            await saveSmtpConfig(data);
            await fetchConfig(); // recarrega
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || err.message };
        }
    }

    const disconnect = async () => {
        try {
            await deleteSmtpConfig();
            setConfig(null);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: 'Erro ao desconectar SMTP' };
        }
    }

    return {
        config,
        loading,
        error,
        testConnection,
        save,
        disconnect,
    };
}