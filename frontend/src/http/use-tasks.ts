import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TarefaAgendada } from "./types/calendar";
import type { AxiosError } from "axios";
import { toast } from "sonner"

export function useTasks() {
  const queryClient = useQueryClient();

  // List all tasks
  const tasksDB = useQuery<TarefaAgendada[], AxiosError>({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TarefaAgendada[]> => {
      const { data } = await api.get<{ status: boolean; tasks: TarefaAgendada[] }>("/tasks");
      return data.tasks;
    },
    refetchOnWindowFocus: true,       
    refetchOnReconnect: true,         
    staleTime: 0,                
  });

  // Mutation to save tasks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveMutation = useMutation<TarefaAgendada, AxiosError<any>, TarefaAgendada>({
    mutationFn: async task => {
      const { data } = await api.post<TarefaAgendada>('/tasks', task)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })

      toast.success('Tarefa salva com sucesso!')
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
    tasks: tasksDB,
    saveTasks: saveMutation,
  }
}
