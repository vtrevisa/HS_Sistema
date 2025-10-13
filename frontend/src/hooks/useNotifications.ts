import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLead } from '@/http/use-lead';
import { useCLCB } from '@/contexts/CLCBContext';

interface Notification {
  id: string;
  type: 'license_expiring' | 'follow_up_due' | 'service_update' | 'process_due' | 'checklist_pending' | 'document_expiring' | 'budget_status' | 'automatic_reminder';
  title: string;
  message: string;
  leadId?: number;
  processoId?: number;
  budgetId?: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category: 'document' | 'budget' | 'follow_up' | 'process' | 'reminder';
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationSettings {
  documentExpiry: boolean;
  budgetStatus: boolean;
  followUpReminders: boolean;
  processAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem('notificationSettings');
    return stored
      ? JSON.parse(stored)
      : {
          documentExpiry: true,
          budgetStatus: true,
          followUpReminders: true,
          processAlerts: true,
          emailNotifications: false,
          pushNotifications: true,
        };
  });

  const { leadsDB } = useLead();
  const { processos } = useCLCB();

  const leads = leadsDB.data ?? [];

  // Mock budgets data - in real app this would come from a context
  const budgets = [
    { id: 1, status: 'pendente', company: 'Empresa A', valor: 15000, createdAt: '2024-06-20', updatedAt: '2024-06-28' },
    { id: 2, status: 'aprovado', company: 'Empresa B', valor: 8500, createdAt: '2024-06-25', updatedAt: '2024-06-29' },
    { id: 3, status: 'rejeitado', company: 'Empresa C', valor: 12000, createdAt: '2024-06-15', updatedAt: '2024-06-27' },
  ];

  const checkDocumentExpiryNotifications = () => {
    if (!settings.documentExpiry) return [];
    
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    //const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const newNotifications: Notification[] = [];

    leads.forEach(lead => {
      const vencimentoDate = new Date(lead.expiration_date);
      
      if (vencimentoDate <= sevenDaysFromNow && vencimentoDate >= today) {
        const daysUntilExpiry = Math.ceil((vencimentoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        newNotifications.push({
          id: `doc_expiry_${lead.id}_${Date.now()}`,
          type: 'document_expiring',
          title: 'Documento Vencendo',
          message: `${lead.service} de ${lead.company} vence em ${daysUntilExpiry} dias`,
          leadId: lead.id,
          dueDate: lead.expiration_date,
          priority: daysUntilExpiry <= 3 ? 'high' : 'medium',
          category: 'document',
          actionUrl: `/dashboard/gestao-leads?lead=${lead.id}`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    return newNotifications;
  };

  const checkBudgetStatusNotifications = () => {
    if (!settings.budgetStatus) return [];
    
    const newNotifications: Notification[] = [];
    
    budgets.forEach(budget => {
      const updatedDate = new Date(budget.updatedAt);
      const today = new Date();
      const daysSinceUpdate = Math.ceil((today.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Notificar sobre orçamentos pendentes há mais de 5 dias
      if (budget.status === 'pendente' && daysSinceUpdate > 5) {
        newNotifications.push({
          id: `budget_pending_${budget.id}_${Date.now()}`,
          type: 'budget_status',
          title: 'Orçamento Pendente',
          message: `Orçamento para ${budget.company} pendente há ${daysSinceUpdate} dias`,
          budgetId: budget.id,
          dueDate: budget.updatedAt,
          priority: daysSinceUpdate > 10 ? 'high' : 'medium',
          category: 'budget',
          actionUrl: `/orcamentos/${budget.id}`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
      
      // Notificar sobre orçamentos aprovados recentemente
      if (budget.status === 'aprovado' && daysSinceUpdate <= 1) {
        newNotifications.push({
          id: `budget_approved_${budget.id}_${Date.now()}`,
          type: 'budget_status',
          title: 'Orçamento Aprovado',
          message: `Orçamento de R$ ${budget.valor.toLocaleString('pt-BR')} para ${budget.company} foi aprovado`,
          budgetId: budget.id,
          dueDate: budget.updatedAt,
          priority: 'medium',
          category: 'budget',
          actionUrl: `/orcamentos/${budget.id}`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    return newNotifications;
  };

  const checkAutomaticReminders = () => {
    if (!settings.followUpReminders) return [];
    
    const today = new Date();
    const newNotifications: Notification[] = [];

    leads.forEach(lead => {
      const nextActionDate = new Date(lead.next_action);
      
      if (nextActionDate <= today) {
        newNotifications.push({
          id: `reminder_${lead.id}_${Date.now()}`,
          type: 'automatic_reminder',
          title: 'Lembrete de Follow-up',
          message: `É hora de fazer follow-up com ${lead.company}`,
          leadId: lead.id,
          dueDate: lead.next_action,
          priority: 'high',
          category: 'reminder',
          actionUrl: `/dashboard/gestao-leads?lead=${lead.id}`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    return newNotifications;
  };

  const checkProcessNotifications = () => {
    if (!settings.processAlerts) return [];
    
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newNotifications: Notification[] = [];

    processos.forEach(processo => {
      const vencimentoDate = new Date(processo.vencimento);
      
      if (vencimentoDate <= sevenDaysFromNow && vencimentoDate >= today) {
        const daysUntilExpiry = Math.ceil((vencimentoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        newNotifications.push({
          id: `process_due_${processo.id}_${Date.now()}`,
          type: 'process_due',
          title: 'Processo Vencendo',
          message: `${processo.tipoServico} vence em ${daysUntilExpiry} dias`,
          processoId: processo.id,
          dueDate: processo.vencimento,
          priority: daysUntilExpiry <= 3 ? 'high' : 'medium',
          category: 'process',
          actionUrl: `/clcb/${processo.id}`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    return newNotifications;
  };

  const checkAllNotifications = () => {
    const documentNotifications = checkDocumentExpiryNotifications();
    const budgetNotifications = checkBudgetStatusNotifications();
    const reminderNotifications = checkAutomaticReminders();
    const processNotifications = checkProcessNotifications();
    
    const allNotifications = [
      ...documentNotifications,
      ...budgetNotifications,
      ...reminderNotifications,
      ...processNotifications
    ];
    
    setNotifications(prev => {
      // Merge with existing notifications, avoiding duplicates
      const existingIds = prev.map(n => n.id);
      const newUniqueNotifications = allNotifications.filter(n => !existingIds.includes(n.id));
      return [...prev, ...newUniqueNotifications].slice(-50); // Keep only last 50 notifications
    });
    
    // Show toast for high priority notifications
    allNotifications
      .filter(n => n.priority === 'high')
      .forEach((notification, index) => {
        setTimeout(() => {
          if (settings.pushNotifications) {
            if (notification.category === 'document' || notification.category === 'process') {
              toast.error(notification.title, { description: notification.message });
            } else {
              toast.info(notification.title, { description: notification.message });
            }
          }
        }, index * 2000);
      });
  };

  useEffect(() => {
    checkAllNotifications();
    
    // Check notifications every 30 minutes
    const interval = setInterval(checkAllNotifications, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [leads, processos, settings]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(n => n.category === category);
  };

  const getNotificationsByPriority = (priority: 'high' | 'medium' | 'low') => {
    return notifications.filter(n => n.priority === priority);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('notificationSettings', JSON.stringify(updated));
      return updated;
    });
  };

  return {
    notifications,
    settings,
    unreadCount: getUnreadCount(),
    markAsRead,
    markAllAsRead,
    dismissNotification,
    getNotificationsByCategory,
    getNotificationsByPriority,
    updateSettings,
    checkAllNotifications
  };
};
