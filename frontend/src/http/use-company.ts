import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { AddressRequest, AddressResponse, CompanyRequest, CnpjResponse } from "./types/companies";
import { toast } from "sonner"
import { useState } from "react";



export function useCompany() {
  const queryClient = useQueryClient();
  const [processingEnrichment, setProcessingEnrichment] = useState<number[]>([]);

  // Fn to show all companies
  const companiesDB = useQuery<CompanyRequest[], AxiosError>({
    queryKey: ["companies"],
    queryFn: async (): Promise<CompanyRequest[]> => {
      const { data } = await api.get<{ status: boolean; companies: CompanyRequest[] }>("/companies");
      return data.companies;
    },
    refetchOnWindowFocus: true,       
    refetchOnReconnect: true,         
    staleTime: 0,                
  });

  // Mutation to save companies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveMutation = useMutation<CompanyRequest[], AxiosError<any>, Omit<CompanyRequest, 'id'>[]>({
    mutationFn: async (companies: Omit<CompanyRequest, 'id'>[]) => {
      const responses = await Promise.all(
      companies.map(company =>
        api.post<CompanyRequest>("/companies", company).then(res => res.data)
      )
    )
    return responses
    },
    onSuccess: (savedCompanies) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      toast.success("A empresa foi salva com sucesso!")

      setTimeout(() => {
        toast.success(
          savedCompanies.length === 1
          ? '1 empresa foi salva com sucesso!'
          : `${savedCompanies.length} empresas foram salvas com sucesso!`
        )
      }, 3200)

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

  

  // Mutation to update companies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateMutation = useMutation<CompanyRequest, AxiosError<any>, CompanyRequest>({
    mutationFn: async (company: CompanyRequest) => {
      if (!company.id) throw new Error("Empresa não encontrada!");

      const { data } = await api.put<{ status: boolean; company: CompanyRequest }>(
        `/companies/${company.id}`,
        company
      );

      return data.company;
    },
    onSuccess: (updatedCompany) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });

      setTimeout(() => {
        toast.success(`A Empresa ${updatedCompany.company} foi enriquecida com sucesso!`);
      }, 1200);
    },
    onError: (error) => {
      const messages = error.response?.data?.erros
        ? Object.values(error.response.data.erros).flat().join("\n")
        : "Erro desconhecido.";

      setTimeout(() => {
        toast.error("Erro ao editar a empresa no sistema!", {
          description: messages,
        });
      }, 1200);
    },
  });


  // Mutation to search by Address
  const searchByAddressMutation = useMutation<AddressResponse, AxiosError, AddressRequest>({
    mutationFn: async (payload: AddressRequest) => {
      const { data } = await api.post<AddressResponse>("/companies/search/address", payload);
      return data;
    },
    onError: () => {
      toast.error("Erro ao buscar empresa pelo endereço");
    },
  });

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


  // Function to enhance company data
  const enhanceData = async (company: CompanyRequest) => {
    setProcessingEnrichment(prev => [...prev, company.id]);

    try {
      const data = await searchByAddressMutation.mutateAsync({
        address: `${company.address} ${company.number} ${company.district} ${company.city} ${company.state}`,
      });

      if (!data.places || data.places.length === 0) {
        toast.error(
          `Não foi possível enriquecer os dados dessa empresa, tente editar os dados manualmente.`
        );
        return;
      }

      const normalize = (str: string) =>
        str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchedPlace = data.places.find((place: any) => {
        const placeNormalized = normalize(place.endereco);
        const numberMatches = placeNormalized.includes(normalize(company.number || ""));
        const cityMatches = placeNormalized.includes(normalize(company.city || ""));
        return numberMatches && cityMatches;
      });

      if (!matchedPlace) {
        toast.error(
          `Não foi possível enriquecer os dados dessa empresa, tente editar os dados manualmente.`
        );
        return;
      }

      const firstPerson = matchedPlace.dados_oficiais?.qsa_nomes?.find(name => !/(S\/A|LTDA|PARTICIPACOES)/i.test(name)) ?.toLowerCase()
  .replace(/\b\w/g, char => char.toUpperCase());

      await updateMutation.mutateAsync({
        ...company,
        company: matchedPlace.nome_empresa || matchedPlace.dados_oficiais?.razao_social || "",
        phone: matchedPlace.telefone || null,
        cnpj: matchedPlace.cnpj || null,
        email: matchedPlace.dados_oficiais?.email || null,
        contact: firstPerson || undefined,
        website: matchedPlace.site || null,
        status: "enriquecido",
      });

    } catch (err) {
      toast.error(`Erro ao enriquecer empresa ${company.company}`);
      console.error(err);
    } finally {
      setProcessingEnrichment(prev => prev.filter(id => id !== company.id));
    }
  };

  // Function to enhance all pending companies
  const enhanceAllData = async () => {
    const pendingCompanies = companiesDB.data?.filter(company => company.status === "pendente") ?? [];

    if (pendingCompanies.length === 0) {
      toast.warning("Nenhuma empresa Pendente", {
        description: "Todos as empresas já foram enriquecidas.",
      });
      return;
    }

    for (const company of pendingCompanies) {
      await enhanceData(company);
    }

     setTimeout(() => {
      toast.success("Enriquecimento concluído.");
    }, pendingCompanies.length * 2000);

  };
  

  return {
    companies: companiesDB.data || [],
    refetchCompanies: companiesDB.refetch,
    isLoading: companiesDB.isLoading,
    saveCompanies: saveMutation,
    updateCompany: updateMutation,
    searchByCnpj: searchCnpjMutation,
    searchByAddress: searchByAddressMutation,
    enhanceData,
    enhanceAllData,
    processingEnrichment,
  }
}