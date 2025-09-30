import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { CompanyRequest } from "./types/companies";
import { toast } from "sonner"

export interface CnpjResponse {
 cnpj: string | null
 razao_social: string | null
 nome_fantasia: string | null
 email: string | null
 telefone: string | null
}

export function useCompany() {
  const queryClient = useQueryClient();

  // Fn to show all companies
  const companiesDB = useQuery<CompanyRequest[], AxiosError>({
    queryKey: ["companies"],
    queryFn: async (): Promise<CompanyRequest[]> => {
      const { data } = await api.get<{ status: boolean; companies: CompanyRequest[] }>("/companies");
      return data.companies;
    },
    staleTime: 1 * 60 * 1000, 
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: "always",
  });

  // Mutation to save companies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveMutation = useMutation<CompanyRequest, AxiosError<any>, Omit<CompanyRequest, 'id'>>({
    mutationFn: async (company: Omit<CompanyRequest, 'id'>) => {
      const { data } = await api.post<CompanyRequest>("/companies", company)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      toast.success("A empresa foi salva com sucesso!")
    },
    onError: (error) => {
      const messages =
      error.response?.data?.erros
        ? Object.values(error.response.data.erros).flat().join("\n")
        : "Erro desconhecido."

      setTimeout(() => {
        toast.error('Erro ao salvar a empresa no sistema!', {
          description: messages
        })
      }, 3200)
    }
  })

  // Mutation to search CNPJ
  const searchCnpjMutation = useMutation<CnpjResponse, AxiosError, string>({
    mutationFn: async (cnpj: string) => {
      const { data } = await api.post<CnpjResponse>("/companies/search/cnpj", { cnpj });
      return data;
    },
    onError: () => {
      toast.error("Erro ao buscar empresa pelo CNPJ");
    },
  });

  

  return {
    companies: companiesDB.data || [],
    isLoading: companiesDB.isLoading,
    saveCompany: saveMutation,
    searchByCnpj: searchCnpjMutation
  }
}