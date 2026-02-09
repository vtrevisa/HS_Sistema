import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Alvara, AlvaraResponse, Task, TaskResponse } from "./types/calendar";
import type { AxiosError } from "axios";
import { toast } from "sonner"
import { parseUTCDateAsLocal } from "@/lib/date";
import { parseISO, startOfDay } from "date-fns";

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
    refetchOnWindowFocus: true,       
    refetchOnReconnect: true,         
    staleTime: 0,                
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
  const saveMutation = useMutation<Task, AxiosError<any>, Task>({
    mutationFn: async task => {
      const { data } = await api.post<Task>('/tasks', task)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })

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

  return {
    tasks: tasksDB.data ?? [],
    alvaras: alvarasDB.data ?? [],
    isLoading: tasksDB.isLoading,
    saveTasks: saveMutation,
  }
}
