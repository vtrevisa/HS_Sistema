import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { startOfDay } from 'date-fns'
import { useTasks } from '@/http/use-tasks'


export type NotificationType =
  | 'task_due'
  | 'task_overdue'
  | 'avcb_clcb_expiring'
  | 'admin_notice'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
  isRead: boolean
  createdAt: string
}

type NotificationSettings = {
  pushNotifications: boolean
  tasks: boolean
  alvaras: boolean
}

const SETTINGS_KEY = 'notification_settings'
const READ_KEY = 'read_notifications'

export const useNotifications = () => {
  const { tasks, alvaras } = useTasks()

  const [notifications, setNotifications] = useState<Notification[]>([])

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(READ_KEY)
    return new Set(stored ? JSON.parse(stored) : [])
  })

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY)
    return stored
      ? JSON.parse(stored)
      : { pushNotifications: true, tasks: true, alvaras: true }
  })

  const processedIdsRef = useRef<Set<string>>(new Set())


  function persistReadIds(ids: Set<string>) {
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids)))
  }


  function checkTaskNotifications(): Notification[] {
     const today = startOfDay(new Date())

    return tasks.flatMap<Notification>(task => {
      if (task.completed) return []

      const taskDate = startOfDay(new Date(task.date))

      const base: Pick<
        Notification,
        'isRead' | 'actionUrl' | 'createdAt'
      > = {
        isRead: false,
        actionUrl: '/dashboard/calendario',
        createdAt: new Date().toISOString()
      }

      // 🔥 VENCIDA
      if (taskDate < today) {
        return [{
          id: `task_overdue_${task.id}`,
          type: 'task_overdue',
          title: 'Tarefa vencida',
          message: task.title,
          priority: 'high',
          ...base
        }]
      }

      // ✅ HOJE
      if (taskDate.getTime() === today.getTime()) {
        return [{
          id: `task_today_${task.id}`,
          type: 'task_due',
          title: 'Tarefa de hoje',
          message: task.title,
          priority: 'medium',
          ...base
        }]
      }

      return []
    })
  }


  function checkAlvaraNotifications(): Notification[] {
    const today = startOfDay(new Date())

    return alvaras.flatMap(alvara => {

      const diff =
        Math.ceil(
          (alvara.validity.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
        )

      if (diff <= 0 || diff > 30) return []

      return [{
        id: `alvara_${alvara.id}`,
        type: 'avcb_clcb_expiring',
        title: 'AVCB / CLCB próximo do vencimento',
        message: `${alvara.company} vence em ${diff} dias`,
        priority: diff <= 7 ? 'high' : 'medium',
        actionUrl: `/dashboard/gestao-leads?lead=${alvara.id}`,
        isRead: false,
        createdAt: new Date().toISOString()
      }]
    })
  }


  function checkAllNotifications() {
    const newNotifications = [
      ...checkTaskNotifications(),
      ...checkAlvaraNotifications(),
    ]

    const newOnes = newNotifications.filter(n => {
      if (readIds.has(n.id)) return false
      if (processedIdsRef.current.has(n.id)) return false

      processedIdsRef.current.add(n.id)
      return true
    })

    if (newOnes.length === 0) return

    setNotifications(prev => [...prev, ...newOnes].slice(-50))

    if (settings.pushNotifications) {
      newOnes
        .filter(n => n.priority === 'high')
        .forEach(n => {
          toast.error(n.title, { description: n.message })
        })
    }
  }

  useEffect(() => {
    if (!tasks.length && !alvaras.length) return
    checkAllNotifications()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, alvaras])

  function updateSettings(newSettings: Partial<NotificationSettings>) {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  function markAsRead(id: string) {
    // setNotifications(prev =>
    //   prev.map(n =>
    //     n.id === id ? { ...n, isRead: true } : n
    //   )
    // )

    setNotifications(prev => prev.filter(notification => notification.id !== id))

    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      persistReadIds(next)
      return next
    })
  }

  function markAllAsRead() {
    // setNotifications(prev =>
    //   prev.map(n => ({ ...n, isRead: true }))
    // )

    setNotifications(prev => {
      setReadIds(current => {
        const next = new Set(current)
        prev.forEach(n => next.add(n.id))
        persistReadIds(next)
        return next
      })

      return []
    })
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    settings,
    updateSettings,
    markAllAsRead
  }
};
