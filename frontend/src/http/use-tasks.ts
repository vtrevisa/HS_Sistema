import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Alvara, AlvaraResponse, CreateTask, Task, TaskResponse } from "./types/calendar";
import type { AxiosError } from "axios";
import { toast } from "sonner"
import { parseUTCDateAsLocal } from "@/lib/date";
import { parseISO, startOfDay } from "date-fns";

interface ApiError {
  message: string
}

export function useTasks() {
  const queryClient = useQueryClient();


  // List all tasks
  const tasksDB = useQuery<Task[], AxiosError>({
    queryKey: ["tasks-calendar"],
    queryFn: async (): Promise<Task[]> => {
      const { data } = await api.get<{ status: boolean; tasks: TaskResponse[] }>("/tasks");
       return data.tasks.map(task => ({
         ...task,
         date: parseUTCDateAsLocal(task.date),
       }))
    },
    staleTime: 1000 * 60 * 2,              
    refetchOnWindowFocus: false,       
    refetchOnReconnect: true,         
  });

  //List all alvaras
  const alvarasDB = useQuery<Alvara[], AxiosError>({
    queryKey: ['alvaras-calendar'],
    queryFn: async (): Promise<Alvara[]> => {
      const { data } = await api.get<{status: boolean, alvaras: AlvaraResponse[]}>('/calendar/alvaras')

      return data.alvaras.map(alvara => ({
        id: String(alvara.id),
        company: alvara.company,
        type: alvara.service,
        validity: startOfDay(parseISO(alvara.validity)),
        address: alvara.address,
        eventType: 'alvara' as const
      }))
    }
  })

  // Mutation to save tasks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveMutation = useMutation<Task, AxiosError<any>, CreateTask>({
    mutationFn: async task => {
      const { data } = await api.post<Task>('/tasks', task)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-calendar'] })

      toast.success('Tarefa agendada com sucesso!')
    },
    onError: (error) => {
      const messages = Object.values(error.response?.data.erros).flat() .join("\n"); 

      setTimeout(() => {
        toast.error('Erro ao salvar tarefa no sistema!', {
          description: messages
        })
      }, 3200)
    }
  })

  // Mutation to update task
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateMutation = useMutation<Task, AxiosError<any>, Partial<Task>>({
    mutationFn: async task => {
      const { data } = await api.put<Task>(`/tasks/${task.id}`, task)
      return data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-calendar'] })

      toast.success('Tarefa editada com sucesso!')
    },

    onError: (error) => {
      const messages = Object
        .values(error.response?.data.erros ?? {})
        .flat()
        .join('\n')

      setTimeout(() => {
        toast.error('Erro ao editar a tarefa!', {
          description: messages
        })
      }, 3200)
    }
  })



  // Mutation to set task completed

  const toggleCompletedMutation = useMutation<Task, AxiosError<ApiError>, { id: string }, { previousTasks?: Task[] }>({
    mutationFn: async ({ id }) => {
      const { data } = await api.put<{ task: Task }>(`/tasks/${id}/completed`)
      return data.task
    },

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks-calendar'] })

      const previousTasks = queryClient.getQueryData<Task[]>(['tasks-calendar'])

      queryClient.setQueryData<Task[]>(['tasks-calendar'], old => old?.map(task => task.id === id ? { ...task, completed: !task.completed } : task) ?? [])

      return { previousTasks }
    },

    onSuccess: (data) => {
      toast.success(data.completed ? 'Tarefa concluída com sucesso' : 'Tarefa marcada como pendente')
    },

    onError: (error, _variables, context) => {
      queryClient.setQueryData(['tasks-calendar'], context?.previousTasks)

      const message = error.response?.data?.message


      if (message) {
        toast.warning(message)
        return
      }

      toast.error('Erro ao atualizar a tarefa')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-calendar'] })
    }
  })

  return {
    tasks: tasksDB.data ?? [],
    alvaras: alvarasDB.data ?? [],
    taskCompleted: toggleCompletedMutation.mutate,
    isLoading: tasksDB.isLoading,
    saveTasks: saveMutation,
    updateTask: updateMutation
  }
}
